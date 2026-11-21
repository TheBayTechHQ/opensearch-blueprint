// Ask: answers a question from Plaza's content, with sources, and with what
// the assistant remembers about the person asking.
import { client, embed, chatStream, INDEX, HYBRID_PIPELINE } from './lib.mjs';
import { spaceFilter } from './search.mjs';
import { recall, remember, extractFacts } from './memory.mjs';

export const NOT_FOUND = 'I could not find that in Plaza.';

/**
 * Finds the passages closest to a question, by words and by meaning together.
 * @param {object} person The person asking (only their spaces are searched).
 * @param {string} question The question.
 * @param {number[]} vector The question as a vector.
 * @param {number} [size] How many passages to return.
 * @returns {Promise<object[]>} Passages with id, content_id, type, space, title, text.
 */
export const findPassages = async (person, question, vector, size = 5) => {
  const filter = [spaceFilter(person)];
  const { body } = await client.search({
    index: INDEX.passages,
    search_pipeline: HYBRID_PIPELINE,
    body: {
      size,
      _source: ['content_id', 'type', 'space', 'title', 'text', 'created'],
      query: {
        hybrid: {
          queries: [
            { bool: { must: [{ multi_match: { query: question, fields: ['title^2', 'text'] } }], filter } },
            { knn: { vector: { vector, k: 20, filter: { bool: { filter } } } } },
          ],
        },
      },
    },
  });
  return body.hits.hits.map((hit) => ({ id: hit._id, score: hit._score, ...hit._source }));
};

/**
 * Builds the messages sent to the chat model.
 * @param {object} person The person asking.
 * @param {string} question The question.
 * @param {object[]} passages Numbered passages to answer from.
 * @param {object[]} memories What is remembered about the person.
 * @returns {object[]} Chat messages.
 */
export const buildPrompt = (person, question, passages, memories) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const facts = memories.filter((memory) => memory.kind === 'fact');
  const chats = memories.filter((memory) => memory.kind === 'chat');
  const system = [
    'You are the assistant inside Plaza, the team hub of a company called Finchley Home.',
    `Today is ${today}. You are talking to ${person.name}, ${person.role}.`,
    'Answer only from the numbered passages below and from what you remember about this person.',
    'After each fact you take from a passage, put its number in square brackets, like [2].',
    `If the passages do not contain the answer, reply exactly: ${NOT_FOUND}`,
    'Do not guess, and answer only what was asked: leave out passages that are about something else.',
    'Be short and plain: one to four sentences, or a short list.',
    facts.length ? `\nWhat you remember about this person:\n${facts.map((memory) => `- ${memory.text}`).join('\n')}` : '',
    chats.length ? `\nEarlier conversations with this person:\n${chats.map((memory) => `- ${memory.text}`).join('\n')}` : '',
    `\nPassages:\n${passages.map((passage, n) => `[${n + 1}] (${passage.title})\n${passage.text}`).join('\n\n')}`,
  ].filter(Boolean).join('\n');
  return [{ role: 'system', content: system }, { role: 'user', content: question }];
};

/**
 * Answers a question and reports each step as it happens.
 * @param {object} person The person asking.
 * @param {string} question The question.
 * @param {(event: string, data: object) => void} send Called for every step: 'step', 'token', 'sources', 'memory', 'done'.
 * @returns {Promise<{ answer: string, sources: object[], saved: object[] }>} The full result.
 */
export const ask = async (person, question, send = () => {}) => {
  const started = Date.now();
  const [vector] = await embed([question], 'query');

  const memories = await recall(person, vector);
  send('step', { name: 'memory', count: memories.length, items: memories.map((memory) => memory.text) });

  const passages = await findPassages(person, question, vector);
  send('step', { name: 'search', count: passages.length, ms: Date.now() - started });

  let answer = '';
  for await (const piece of chatStream(buildPrompt(person, question, passages, memories))) {
    answer += piece;
    send('token', { text: piece });
  }
  answer = answer.trim();

  // Show only the passages the answer points to, keeping their numbers.
  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1])));
  const sources = passages
    .map((passage, n) => ({ n: n + 1, id: passage.content_id, type: passage.type, space: passage.space, title: passage.title, text: passage.text }))
    .filter((source) => cited.has(source.n));
  send('sources', { sources });

  // Keep what is worth remembering: lasting facts the person stated, and a line about this chat.
  const saved = [];
  for (const fact of await extractFacts(question)) {
    const record = await remember(person, 'fact', fact);
    if (record) saved.push(record);
  }
  if (!answer.startsWith(NOT_FOUND)) {
    const summary = `Asked "${question}" and was told: ${answer.replace(/\s+/g, ' ').slice(0, 220)}`;
    await remember(person, 'chat', summary);
  }
  send('memory', { saved: saved.map((record) => record.text) });
  send('done', { ms: Date.now() - started });
  return { answer, sources, saved };
};
