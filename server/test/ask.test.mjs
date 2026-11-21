// Ask and Memory tests. They call the real models through Ollama, so they take a while.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { personOf } from '../src/search.mjs';
import { ask, NOT_FOUND } from '../src/ask.mjs';
import { listMemories, forget, extractFacts } from '../src/memory.mjs';
import { PEOPLE } from '../../seed/data.mjs';

// A test-only person, so the tests never touch a real person's memories.
const tester = { id: 'test-user', name: 'Test User', role: 'Tester', spaces: ['people', 'support'] };
const outsider = personOf('chloe'); // Everyone space only

before(() => forget(tester));
after(() => forget(tester));

test('answers from the content and points to its source', async () => {
  const { answer, sources } = await ask(tester, 'How many days of paid time off do employees get each year?');
  assert.match(answer, /\b20\b/);
  assert.ok(sources.some((source) => source.title === 'Time off policy'), JSON.stringify(sources.map((source) => source.title)));
});

test('says so when the content has no answer', async () => {
  const { answer, sources } = await ask(tester, 'What is the dress code for the office?');
  assert.ok(answer.startsWith(NOT_FOUND), answer);
  assert.equal(sources.length, 0);
});

test('permissions: never answers from a space the person is not in', async () => {
  const { answer, sources } = await ask(outsider, 'How much money are we raising in the funding round?');
  assert.ok(!/15 million/.test(answer), answer);
  assert.ok(sources.every((source) => outsider.spaces.includes(source.space)));
});

test('a plain question leaves no fact behind', async () => {
  assert.deepEqual(await extractFacts('What is the refund limit for agents?'), []);
});

test('a question about yourself does not invent a fact', async () => {
  assert.deepEqual(await extractFacts('Where do I work?'), []);
  assert.deepEqual(await extractFacts('Which desk is mine? Can I expense my lunch today?'), []);
});

test('remembers a fact, uses it in a new question, and forgets it when deleted', async () => {
  const first = await ask(tester, 'I am based in the Reno warehouse and I do not come to Oakland. When is the winter party?');
  assert.ok(first.saved.length > 0, 'nothing was saved');
  const facts = (await listMemories(tester)).filter((memory) => memory.kind === 'fact');
  assert.ok(facts.some((memory) => /Reno/.test(memory.text)), JSON.stringify(facts.map((memory) => memory.text)));

  const steps = [];
  await ask(tester, 'Where do I work?', (event, data) => steps.push([event, data]));
  const recalled = steps.find(([event, data]) => event === 'step' && data.name === 'memory')[1];
  assert.ok(recalled.items.some((text) => /Reno/.test(text)), JSON.stringify(recalled.items));
  const answer = steps.filter(([event]) => event === 'token').map(([, data]) => data.text).join('');
  assert.match(answer, /Reno/);
  const final = steps.find(([event]) => event === 'answer')[1].text;
  assert.match(final, /Reno[^[]*\[M\]/, final);

  assert.ok((await forget(tester)) > 0);
  assert.equal((await listMemories(tester)).length, 0);
  const after = [];
  await ask(tester, 'Where do I work?', (event, data) => after.push([event, data]));
  assert.equal(after.find(([event, data]) => event === 'step' && data.name === 'memory')[1].count, 0);
});

test('memories belong to one person only', async () => {
  await ask(tester, 'Remember that my favourite lab unit is L7. Which lab units must not be flashed?');
  for (const person of PEOPLE) {
    assert.ok(!(await listMemories(person)).some((memory) => /L7/.test(memory.text)), `${person.id} can see it`);
  }
});
