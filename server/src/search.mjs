// Global search, suggestions and the lists behind each module page.
import { client, embed, INDEX, HYBRID_PIPELINE } from './lib.mjs';
import { PEOPLE } from '../../seed/data.mjs';

/**
 * Looks up a person. Plaza has no sign-in; the screen says who you are.
 * @param {string} userId Person id, such as 'ava'.
 * @returns {object} The person record.
 */
export const personOf = (userId) => {
  const person = PEOPLE.find((item) => item.id === userId);
  if (!person) throw Object.assign(new Error(`Unknown user: ${userId}`), { status: 400 });
  return person;
};

/**
 * The permission rule, as an OpenSearch filter: only content from the user's spaces.
 * Every query in this file carries it.
 * @param {object} person The person searching.
 * @returns {object} A terms filter.
 */
export const spaceFilter = (person) => ({ terms: { space: person.spaces } });

const SEARCH_FIELDS = ['title^3', 'title.suggest', 'body', 'tags.text^2', 'author_name', 'place'];
const SOURCE_FIELDS = ['type', 'space', 'title', 'body', 'author', 'author_name', 'created', 'parent_id', 'starts', 'ends', 'place', 'tags'];

/**
 * Searches every kind of content at once.
 * @param {object} person The person searching.
 * @param {object} options
 * @param {string} options.q Search words.
 * @param {string} [options.type] Show only this type.
 * @param {string} [options.space] Show only this space.
 * @param {string} [options.from] Earliest created date (ISO).
 * @param {string} [options.to] Latest created date (ISO).
 * @param {'keyword'|'hybrid'} [options.mode] Keyword only, or keyword and meaning together.
 * @param {number} [options.size] How many hits to return.
 * @returns {Promise<object>} Hits, counts per type and per space, and how long OpenSearch took.
 */
export const search = async (person, { q, type, space, from, to, mode = 'keyword', size = 20 }) => {
  // Always applied: permissions and the date range.
  const always = [spaceFilter(person)];
  if (from || to) always.push({ range: { created: { ...(from && { gte: from }), ...(to && { lte: to }) } } });

  // The words. Fuzziness forgives a typo; the title counts three times as much as the body.
  const keyword = {
    bool: {
      must: [{ multi_match: { query: q, fields: SEARCH_FIELDS, fuzziness: 'AUTO', prefix_length: 1 } }],
      filter: always,
    },
  };

  // Type and space chips go in post_filter, so the counts beside the chips
  // still show what the other choices would give.
  const chosen = [];
  if (type) chosen.push({ term: { type } });
  if (space) chosen.push({ term: { space } });

  const body = {
    size,
    _source: SOURCE_FIELDS,
    query: keyword,
    ...(chosen.length && { post_filter: { bool: { filter: chosen } } }),
    highlight: {
      encoder: 'html', pre_tags: ['<mark>'], post_tags: ['</mark>'],
      fields: { title: { number_of_fragments: 0 }, body: { fragment_size: 160, number_of_fragments: 1 } },
    },
    aggs: {
      types: { terms: { field: 'type' } },
      spaces: { terms: { field: 'space' } },
    },
  };

  const params = { index: INDEX.content, body };
  if (mode === 'hybrid') {
    const [vector] = await embed([q], 'query');
    body.query = {
      hybrid: {
        queries: [keyword, { knn: { vector: { vector, k: 30, filter: { bool: { filter: always } } } } }],
      },
    };
    params.search_pipeline = HYBRID_PIPELINE;
  }

  const { body: result } = await client.search(params);
  return {
    took: result.took,
    total: result.hits.total.value,
    hits: result.hits.hits.map((hit) => ({
      id: hit._id, score: hit._score, ...hit._source,
      titleHtml: hit.highlight?.title?.[0], snippetHtml: hit.highlight?.body?.[0],
    })),
    types: Object.fromEntries(result.aggregations.types.buckets.map((bucket) => [bucket.key, bucket.doc_count])),
    spaces: Object.fromEntries(result.aggregations.spaces.buckets.map((bucket) => [bucket.key, bucket.doc_count])),
  };
};

/**
 * Suggests titles while the user is still typing.
 * @param {object} person The person typing.
 * @param {string} q What they have typed so far.
 * @returns {Promise<object[]>} Up to six { id, type, space, title }.
 */
export const suggest = async (person, q) => {
  const { body } = await client.search({
    index: INDEX.content,
    body: {
      size: 6,
      _source: ['type', 'space', 'title'],
      query: {
        bool: {
          must: [{ multi_match: { query: q, type: 'bool_prefix', fields: ['title.suggest', 'title.suggest._2gram', 'title.suggest._3gram'] } }],
          filter: [spaceFilter(person)],
          must_not: [{ terms: { type: ['reply', 'message'] } }],
        },
      },
    },
  });
  return body.hits.hits.map((hit) => ({ id: hit._id, ...hit._source }));
};

/**
 * Lists one type of content, newest first (events: soonest first).
 * @param {object} person The person looking.
 * @param {object} options
 * @param {string} options.type Content type.
 * @param {string} [options.space] Only this space.
 * @param {string} [options.parent] Only replies to this topic.
 * @param {number} [options.size] How many to return.
 * @returns {Promise<object[]>} The records.
 */
export const list = async (person, { type, space, parent, size = 100 }) => {
  const filter = [spaceFilter(person), { term: { type } }];
  if (space) filter.push({ term: { space } });
  if (parent) filter.push({ term: { parent_id: parent } });
  const sort = type === 'event' ? [{ starts: 'asc' }] : type === 'reply' ? [{ created: 'asc' }] : [{ created: 'desc' }];
  if (type === 'event') filter.push({ range: { starts: { gte: 'now-1d/d' } } });
  const { body } = await client.search({ index: INDEX.content, body: { size, _source: SOURCE_FIELDS, query: { bool: { filter } }, sort } });
  return body.hits.hits.map((hit) => ({ id: hit._id, ...hit._source }));
};

/**
 * Reads one record, if the user may see it.
 * @param {object} person The person looking.
 * @param {string} id Record id.
 * @returns {Promise<object|null>} The record, or null when missing or not allowed.
 */
export const getOne = async (person, id) => {
  const { body } = await client.search({
    index: INDEX.content,
    body: { size: 1, _source: SOURCE_FIELDS, query: { bool: { filter: [{ ids: { values: [id] } }, spaceFilter(person)] } } },
  });
  const hit = body.hits.hits[0];
  return hit ? { id: hit._id, ...hit._source } : null;
};

/**
 * Saves a chat message and makes it searchable straight away.
 * @param {object} person The author.
 * @param {string} space Space the message is sent in.
 * @param {string} text Message text.
 * @returns {Promise<object>} The saved record.
 */
export const postMessage = async (person, space, text) => {
  if (!person.spaces.includes(space)) throw Object.assign(new Error('You are not a member of this space.'), { status: 403 });
  const clean = String(text || '').trim();
  if (!clean) throw Object.assign(new Error('The message is empty.'), { status: 400 });
  const [vector] = await embed([clean]);
  const record = {
    type: 'message', space, title: '', body: clean,
    author: person.id, author_name: person.name, tags: [], created: new Date().toISOString(),
  };
  // refresh: 'wait_for' returns once the message can be found by a search.
  const { body } = await client.index({ index: INDEX.content, body: { ...record, vector }, refresh: 'wait_for' });
  await client.index({
    index: INDEX.passages,
    body: { content_id: body._id, type: 'message', space, title: `Chat message from ${person.name}`, text: `${person.name}: ${clean}`, created: record.created, vector },
    refresh: 'wait_for',
  });
  return { id: body._id, ...record };
};
