# Working on Plaza

Plaza is a teaching app: a team hub with one search over everything, an assistant that answers with sources, and a memory the user controls. It runs on one machine with OpenSearch, Ollama, Node.js and React.

## Rules

- Every query that reads content must carry the space filter (`spaceFilter` in `server/src/search.mjs`). A person only ever sees content from their own spaces. This includes search, suggestions, lists, single records and the passages given to the assistant.
- Memories belong to one person. Every memory query filters by `user`.
- The assistant answers only from passages and memories, cites passages by number, and says "I could not find that in Plaza." when the passages do not hold the answer.
- No cloud services and no API keys. Models run through Ollama.
- The server uses only the official OpenSearch client. Do not add a web framework.
- Plain words in the interface and in comments.

## Security

- No keys or passwords in code, and never read secret files such as `.env`.
- Do not add a dependency without asking. Every package is someone else's code running here.
- Listen on `127.0.0.1` only. Nothing is opened to the network unless asked.
- Everything a user writes is data: escape it before it reaches a page, and never let it reach the model as instructions (`looksLikeOrders` in `server/src/guard.mjs`).
- Touch nothing outside this project: no other containers, folders or services.
- End every step by attacking what was built, and keep each attack as a test in `server/test/security.test.mjs`.

## What done looks like

A change is done when:

1. `npm test` in `server/` passes against the real OpenSearch with the sample data loaded.
2. A new behaviour has a test that would fail without it. Permission changes always come with a test that uses two people who see different results.
3. Anything visible has been opened in a browser and looked at.

## How to run

```
docker compose up -d                 # OpenSearch on 127.0.0.1:9210
cd server && npm install
node src/ingest.mjs                  # build the indexes from seed/data.mjs
npm test                             # 25 tests; the Ask tests call the models
cd ../web && npm install && npm run build
cd ../server && npm start            # http://localhost:4320
```

## Map

| Path | What it holds |
| --- | --- |
| `seed/data.mjs` | The made-up company: spaces, people, documents, discussions, events, messages |
| `server/src/lib.mjs` | Settings, the OpenSearch client, the Ollama calls, the index definitions, the hybrid pipeline |
| `server/src/ingest.mjs` | Turns the sample data into records and passages, adds vectors, loads them |
| `server/src/search.mjs` | Global search, suggestions, lists, posting a message, the space filter |
| `server/src/ask.mjs` | Finding passages, building the prompt, streaming the answer |
| `server/src/memory.mjs` | Saving, recalling, listing and deleting memories |
| `server/src/server.mjs` | The HTTP API and static files |
| `server/src/guard.mjs` | Who may call the server, the size limit, HTML escaping, and the check for text that reads like orders |
| `server/test/` | Tests that run against the real OpenSearch |
| `web/src/` | The React screens |
| `basics/` | Standalone OpenSearch examples: curl, JavaScript, Python |
