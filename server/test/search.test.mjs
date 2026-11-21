// Search tests. They run against the real OpenSearch with the sample data loaded
// (node src/ingest.mjs first).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { client, INDEX } from '../src/lib.mjs';
import { personOf, search, suggest, list, getOne, postMessage } from '../src/search.mjs';

const ava = personOf('ava');   // Engineering, Operations, Everyone
const noor = personOf('noor'); // Sales, Leadership, Everyone
const posted = [];

after(async () => {
  for (const id of posted) await client.delete({ index: INDEX.content, id, refresh: true }).catch(() => {});
  await client.deleteByQuery({ index: INDEX.passages, body: { query: { terms: { content_id: posted } } }, refresh: true });
});

test('finds a document by its words, title first', async () => {
  const result = await search(ava, { q: 'time off' });
  assert.equal(result.hits[0].title, 'Time off policy');
  assert.match(result.hits[0].titleHtml, /<mark>/);
});

test('searches every kind of content at once', async () => {
  const result = await search(ava, { q: 'firmware 4.2' });
  for (const type of ['document', 'event', 'message']) assert.ok(result.types[type] > 0, `no ${type} found`);
});

test('forgives a typo', async () => {
  const result = await search(ava, { q: 'parentl leave' });
  assert.equal(result.hits[0].title, 'Parental leave');
});

test('finds other forms of a word', async () => {
  const result = await search(ava, { q: 'refunding returns', type: 'document' });
  assert.ok(result.hits.some((hit) => hit.title === 'Handling returned units'));
});

test('type chip narrows the hits but keeps the counts for the other chips', async () => {
  const all = await search(ava, { q: 'release' });
  const events = await search(ava, { q: 'release', type: 'event' });
  assert.ok(events.hits.length > 0);
  assert.ok(events.hits.every((hit) => hit.type === 'event'));
  assert.deepEqual(events.types, all.types);
});

test('date range limits results', async () => {
  const from = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date().toISOString();
  const everything = await search(ava, { q: 'open-window detection' });
  const recent = await search(ava, { q: 'open-window detection', from, to });
  assert.ok(recent.hits.length > 0 && recent.total < everything.total);
  assert.ok(recent.hits.every((hit) => hit.created >= from && hit.created <= to));
});

test('permissions: a search never returns another space\'s content', async () => {
  const mine = await search(ava, { q: 'fundraising term sheets' });
  assert.ok(mine.hits.every((hit) => ava.spaces.includes(hit.space)));
  assert.ok(!mine.hits.some((hit) => hit.title === 'Fundraising status'));
  const theirs = await search(noor, { q: 'fundraising term sheets' });
  assert.equal(theirs.hits[0].title, 'Fundraising status');
});

test('permissions: reading a record directly is refused too', async () => {
  assert.equal(await getOne(ava, 'doc-fundraising-status'), null);
  assert.equal((await getOne(noor, 'doc-fundraising-status')).title, 'Fundraising status');
});

test('permissions: lists and suggestions follow the same rule', async () => {
  const documents = await list(ava, { type: 'document' });
  assert.ok(documents.length > 0 && documents.every((item) => ava.spaces.includes(item.space)));
  const suggestions = await suggest(ava, 'fund');
  assert.ok(!suggestions.some((item) => item.space === 'leadership'));
  assert.ok((await suggest(noor, 'fund')).some((item) => item.title === 'Fundraising status'));
});

test('suggests titles from the first letters', async () => {
  const titles = (await suggest(ava, 'rel')).map((item) => item.title);
  assert.ok(titles.includes('Release process'), titles.join(' | '));
});

test('hybrid search finds a page by meaning when the words differ', async () => {
  const q = 'paid vacation';
  const keyword = await search(ava, { q, type: 'document' });
  const hybrid = await search(ava, { q, type: 'document', mode: 'hybrid' });
  const place = (result) => result.hits.findIndex((hit) => hit.title === 'Time off policy');
  assert.equal(place(hybrid), 0, `hybrid put it at ${place(hybrid)}`);
  assert.ok(place(keyword) !== 0, 'keyword search alone already had it first');
});

test('a new chat message can be found as soon as it is sent', async () => {
  const message = await postMessage(ava, 'engineering', 'The zebra soldering station is back from repair.');
  posted.push(message.id);
  const result = await search(ava, { q: 'zebra soldering' });
  assert.equal(result.hits[0].id, message.id);
  await assert.rejects(() => postMessage(ava, 'leadership', 'hello'), /not a member/);
});
