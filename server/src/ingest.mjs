// Builds the indexes from the sample data: node src/ingest.mjs
// Dates in the sample data are relative, so "today" is the day you run this.
import { fileURLToPath } from 'node:url';
import { client, embed, INDEX, indexDefinitions, createHybridPipeline } from './lib.mjs';
import { SPACES, PEOPLE, DOCUMENTS, TOPICS, EVENTS, MESSAGES } from '../../seed/data.mjs';

const DAY = 24 * 60 * 60 * 1000;
const nameOf = Object.fromEntries(PEOPLE.map((person) => [person.id, person.name]));
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

/**
 * Turns the sample data into content records and passages.
 * @param {Date} now The moment treated as "today".
 * @returns {{ content: object[], passages: object[] }} Records ready to index (without vectors).
 */
export const buildRecords = (now = new Date()) => {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const at = (daysAgo, hour = 10) => new Date(midnight - daysAgo * DAY + hour * 60 * 60 * 1000).toISOString();
  const content = [];
  const passages = [];
  const passage = (record, text, n) => passages.push({
    id: `${record.id}#${n}`, content_id: record.id, type: record.type, space: record.space,
    title: record.title, text, created: record.created,
  });

  for (const [space, title, author, daysAgo, tags, body] of DOCUMENTS) {
    const record = { id: `doc-${slug(title)}`, type: 'document', space, title, body, author, author_name: nameOf[author], tags, created: at(daysAgo) };
    content.push(record);
    // One passage per paragraph: small enough to be about one thing.
    body.split(/\n\s*\n/).forEach((paragraph, n) => passage(record, paragraph.trim(), n));
  }

  for (const [space, title, author, daysAgo, first, replies] of TOPICS) {
    const topic = { id: `topic-${slug(title)}`, type: 'topic', space, title, body: first, author, author_name: nameOf[author], tags: [], created: at(daysAgo, 9) };
    content.push(topic);
    passage(topic, `${nameOf[author]}: ${first}`, 0);
    replies.forEach(([replyAuthor, text], n) => {
      const reply = {
        id: `${topic.id}-r${n + 1}`, type: 'reply', space, title: `Re: ${title}`, body: text, author: replyAuthor,
        author_name: nameOf[replyAuthor], tags: [], parent_id: topic.id, created: at(daysAgo, 10 + n),
      };
      content.push(reply);
      passage(reply, `${nameOf[replyAuthor]} replied: ${text}`, 0);
    });
  }

  for (const [space, title, inDays, hour, hours, place, note] of EVENTS) {
    const starts = at(-inDays, hour);
    const ends = new Date(new Date(starts).getTime() + hours * 60 * 60 * 1000).toISOString();
    const day = new Date(starts).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const event = { id: `event-${slug(title)}`, type: 'event', space, title, body: note, author: 'system', author_name: '', tags: [], created: starts, starts, ends, place };
    content.push(event);
    passage(event, `Event: ${title}. When: ${day} at ${String(hour).padStart(2, '0')}:00. Where: ${place}. ${note}`, 0);
  }

  // Messages are short, so a day of chat in one space becomes one passage.
  const days = new Map();
  MESSAGES.forEach(([space, author, daysAgo, hour, text], n) => {
    const message = {
      // No title: a message is only its text, and a copy in the title would count its words twice.
      id: `msg-${String(n + 1).padStart(3, '0')}`, type: 'message', space, title: '', body: text, author, author_name: nameOf[author], tags: [], created: new Date(new Date(at(daysAgo, hour)).getTime() + n * 60000).toISOString(),
    };
    content.push(message);
    const key = `${space}|${daysAgo}`;
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(message);
  });
  for (const [key, list] of days) {
    const [space] = key.split('|');
    const spaceName = SPACES.find((item) => item.id === space).name;
    const first = list[0];
    const day = new Date(first.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    passages.push({
      id: `chat-${space}-${first.created.slice(0, 10)}`, content_id: first.id, type: 'message', space,
      title: `${spaceName} chat, ${day}`, text: list.map((message) => `${message.author_name}: ${message.body}`).join('\n'), created: first.created,
    });
  }
  return { content, passages };
};

/**
 * Sends records to an index with the bulk API.
 * @param {string} index Index name.
 * @param {object[]} records Records with an `id` field.
 * @returns {Promise<void>}
 */
const bulk = async (index, records) => {
  const body = records.flatMap(({ id, ...source }) => [{ index: { _index: index, _id: id } }, source]);
  const { body: result } = await client.bulk({ body, refresh: true });
  if (result.errors) {
    const first = result.items.find((item) => item.index.error);
    throw new Error(`Bulk indexing failed: ${JSON.stringify(first.index.error)}`);
  }
};

/**
 * Drops and rebuilds the content and passage indexes. Memory is kept unless asked.
 * @param {{ resetMemory?: boolean, log?: (line: string) => void }} [options]
 * @returns {Promise<{ content: number, passages: number }>} How many records were indexed.
 */
export const ingest = async ({ resetMemory = false, log = () => {} } = {}) => {
  const { content, passages } = buildRecords();
  const [probe] = await embed(['probe']);
  const definitions = indexDefinitions(probe.length);
  for (const [name, definition] of Object.entries(definitions)) {
    const exists = (await client.indices.exists({ index: name })).body;
    if (name === INDEX.memory && exists && !resetMemory) continue;
    if (exists) await client.indices.delete({ index: name });
    await client.indices.create({ index: name, body: definition });
    log(`created index ${name}`);
  }
  await createHybridPipeline();

  const BATCH = 32;
  const withVectors = async (records, textOf) => {
    for (let n = 0; n < records.length; n += BATCH) {
      const slice = records.slice(n, n + BATCH);
      const vectors = await embed(slice.map(textOf));
      slice.forEach((record, i) => { record.vector = vectors[i]; });
    }
    return records;
  };
  await bulk(INDEX.content, await withVectors(content, (record) => `${record.title}\n${record.body}`.slice(0, 1500)));
  log(`indexed ${content.length} content records`);
  await bulk(INDEX.passages, await withVectors(passages, (record) => `${record.title}\n${record.text}`));
  log(`indexed ${passages.length} passages`);
  return { content: content.length, passages: passages.length };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const started = Date.now();
  const counts = await ingest({ resetMemory: process.argv.includes('--reset-memory'), log: console.log });
  const { body } = await client.search({ index: INDEX.content, body: { size: 0, aggs: { types: { terms: { field: 'type' } } } } });
  console.log(body.aggregations.types.buckets.map((bucket) => `${bucket.key}: ${bucket.doc_count}`).join(', '));
  console.log(`done in ${((Date.now() - started) / 1000).toFixed(1)} s`, counts);
}
