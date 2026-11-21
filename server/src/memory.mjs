// Memory: what the assistant keeps about each person, stored as text plus a vector.
import { client, embed, chat, INDEX } from './lib.mjs';

// Scores from the Lucene engine with cosine similarity run from 0 to 1: (1 + cosine) / 2.
const RECALL_FACT = 0.72;
const RECALL_CHAT = 0.8;
const SAME_MEMORY = 0.95;

/**
 * Finds a person's memories nearest to a vector.
 * @param {object} person Whose memories to search.
 * @param {number[]} vector The vector to compare with.
 * @param {number} [k] How many to fetch.
 * @returns {Promise<object[]>} Memories with id, kind, text, created, score.
 */
const nearest = async (person, vector, k = 6) => {
  const { body } = await client.search({
    index: INDEX.memory,
    body: {
      size: k,
      _source: ['kind', 'text', 'created'],
      query: { knn: { vector: { vector, k, filter: { term: { user: person.id } } } } },
    },
  });
  return body.hits.hits.map((hit) => ({ id: hit._id, score: hit._score, ...hit._source }));
};

/**
 * Picks the memories that relate to a question: up to three facts and two earlier chats.
 * @param {object} person The person asking.
 * @param {number[]} vector The question as a vector.
 * @returns {Promise<object[]>} The memories to give the model.
 */
export const recall = async (person, vector) => {
  const found = await nearest(person, vector, 10);
  const facts = found.filter((memory) => memory.kind === 'fact' && memory.score >= RECALL_FACT).slice(0, 3);
  const chats = found.filter((memory) => memory.kind === 'chat' && memory.score >= RECALL_CHAT).slice(0, 2);
  return [...facts, ...chats];
};

/**
 * Saves a memory, unless one that says nearly the same thing already exists.
 * @param {object} person Whose memory it is.
 * @param {'fact'|'chat'} kind A lasting fact, or a line about a past conversation.
 * @param {string} text The memory in plain words.
 * @returns {Promise<object|null>} The saved record, or null when it was a repeat.
 */
export const remember = async (person, kind, text) => {
  const [vector] = await embed([text]);
  const [closest] = await nearest(person, vector, 1);
  if (closest && closest.kind === kind && closest.score >= SAME_MEMORY) return null;
  const record = { user: person.id, kind, text, created: new Date().toISOString() };
  const { body } = await client.index({ index: INDEX.memory, body: { ...record, vector }, refresh: 'wait_for' });
  return { id: body._id, ...record };
};

/**
 * Lists everything remembered about a person, newest first.
 * @param {object} person Whose memories to list.
 * @returns {Promise<object[]>} Memories with id, kind, text, created.
 */
export const listMemories = async (person) => {
  const { body } = await client.search({
    index: INDEX.memory,
    body: { size: 200, _source: ['kind', 'text', 'created'], query: { term: { user: person.id } }, sort: [{ created: 'desc' }] },
  });
  return body.hits.hits.map((hit) => ({ id: hit._id, ...hit._source }));
};

/**
 * Deletes one memory, or all of a person's memories.
 * @param {object} person Whose memories to delete from.
 * @param {string} [id] Memory id; leave out to delete everything.
 * @returns {Promise<number>} How many were deleted.
 */
export const forget = async (person, id) => {
  const filter = [{ term: { user: person.id } }];
  if (id) filter.push({ ids: { values: [id] } });
  const { body } = await client.deleteByQuery({ index: INDEX.memory, body: { query: { bool: { filter } } }, refresh: true });
  return body.deleted;
};

// Only messages that talk about the speaker can hold a fact about them.
const ABOUT_SELF = /\b(i|i'm|i've|my|me|we|our|remember)\b/i;

/**
 * Pulls lasting facts about the speaker out of a message.
 * @param {string} message What the person wrote.
 * @returns {Promise<string[]>} Facts as short sentences; empty when there are none.
 */
export const extractFacts = async (message) => {
  if (!ABOUT_SELF.test(message)) return [];
  const reply = await chat([
    {
      role: 'system',
      content: [
        'You read one message from a user and list lasting facts the user states about themselves:',
        'their role, team, location, preferences, plans or decisions.',
        'A question is not a fact. Something the user wants to know is not a fact.',
        'Write each fact as one short sentence that starts with "The user".',
        'Reply with JSON only: {"facts": ["..."]}. When there are none, reply {"facts": []}.',
      ].join(' '),
    },
    { role: 'user', content: 'Message: "How many days off do I get?"' },
    { role: 'assistant', content: '{"facts": []}' },
    { role: 'user', content: 'Message: "I work from Lisbon on Fridays. Can I expense my coworking desk?"' },
    { role: 'assistant', content: '{"facts": ["The user works from Lisbon on Fridays."]}' },
    { role: 'user', content: `Message: ${JSON.stringify(message)}` },
  ], { format: 'json' });
  try {
    const { facts } = JSON.parse(reply);
    return Array.isArray(facts) ? facts.filter((fact) => typeof fact === 'string' && fact.trim()).map((fact) => fact.trim()).slice(0, 3) : [];
  } catch {
    return [];
  }
};
