// The web server: a small JSON API, plus the built React app when it exists.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { client, config, INDEX } from './lib.mjs';
import { personOf, search, suggest, list, getOne, postMessage } from './search.mjs';
import { ask } from './ask.mjs';
import { listMemories, forget } from './memory.mjs';
import { ingest } from './ingest.mjs';
import { SPACES, PEOPLE } from '../../seed/data.mjs';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'web', 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon' };

const json = (response, status, data) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(data));
};

const readBody = async (request) => {
  let text = '';
  for await (const chunk of request) text += chunk;
  return text ? JSON.parse(text) : {};
};

/**
 * Handles one API request.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {URL} url The parsed request address.
 * @returns {Promise<void>}
 */
const api = async (request, response, url) => {
  const route = `${request.method} ${url.pathname}`;
  const query = Object.fromEntries(url.searchParams);

  if (route === 'GET /api/status') {
    const counts = {};
    for (const [name, index] of Object.entries(INDEX)) {
      counts[name] = (await client.count({ index })).body.count;
    }
    return json(response, 200, { ok: true, counts, embedModel: config.embedModel, chatModel: config.chatModel });
  }
  if (route === 'GET /api/people') return json(response, 200, { people: PEOPLE, spaces: SPACES });

  // Plaza has no sign-in: the screen sends who you are with every request.
  const person = personOf(request.headers['x-user'] || query.user || 'ava');

  if (route === 'GET /api/search') {
    if (!query.q?.trim()) return json(response, 400, { error: 'Type something to search for.' });
    return json(response, 200, await search(person, query));
  }
  if (route === 'GET /api/suggest') return json(response, 200, { items: query.q?.trim() ? await suggest(person, query.q) : [] });
  if (route === 'GET /api/list') return json(response, 200, { items: await list(person, query) });
  if (route === 'GET /api/content') {
    const record = await getOne(person, query.id);
    return record ? json(response, 200, record) : json(response, 404, { error: 'Not found, or not in one of your spaces.' });
  }
  if (route === 'POST /api/messages') {
    const { space, text } = await readBody(request);
    return json(response, 201, await postMessage(person, space, text));
  }
  if (route === 'GET /api/memory') return json(response, 200, { items: await listMemories(person) });
  if (route === 'DELETE /api/memory') return json(response, 200, { deleted: await forget(person, query.id) });
  if (route === 'POST /api/ingest') return json(response, 200, await ingest({ resetMemory: query.memory === 'reset' }));

  if (route === 'POST /api/ask') {
    const { question } = await readBody(request);
    if (!question?.trim()) return json(response, 400, { error: 'Ask a question.' });
    // Server-sent events: the answer appears word by word.
    response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    const send = (event, data) => response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    try {
      await ask(person, question.trim(), send);
    } catch (error) {
      send('error', { message: error.message });
    }
    return response.end();
  }
  return json(response, 404, { error: 'No such address.' });
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) return await api(request, response, url);
    if (!existsSync(webRoot)) return json(response, 200, { message: 'The API is running. Build the web app (npm run build in web/) or use its dev server.' });
    const wanted = normalize(join(webRoot, url.pathname));
    const file = wanted.startsWith(webRoot) && extname(wanted) && existsSync(wanted) ? wanted : join(webRoot, 'index.html');
    response.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    return response.end(await readFile(file));
  } catch (error) {
    if (response.headersSent) return response.end();
    return json(response, error.status || 500, { error: error.message });
  }
});

server.listen(config.port, () => console.log(`Plaza is on http://localhost:${config.port}`));
