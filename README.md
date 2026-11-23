# Plaza: a team hub built on OpenSearch

A complete example that runs on one machine. Plaza is where a company's groups keep documents, discussions, events and messages, with:

- **Global search**: one box over everything, with highlights, filters, suggestions while you type and typo tolerance.
- **Ask**: an assistant that answers from the content, shows its sources, and says so when it does not know.
- **Memory**: the assistant remembers what you tell it about yourself, and you can see and delete all of it.
- **Permissions**: a person only ever finds content from the spaces they belong to.

Nothing leaves your machine. There is no cloud account and no API key.

| Part | Tool |
| --- | --- |
| Search and storage | OpenSearch 2.19 (one node, Docker) |
| Models | Ollama: `nomic-embed-text` turns text into numbers, `qwen3:8b` writes answers |
| Server | Node.js 22 with the official OpenSearch client, no web framework |
| Screens | React, Vite, Tailwind |

The company in the sample data, Finchley Home, and everything in it is made up.

## What you need

| Thing | Version used here |
| --- | --- |
| Docker | 29 |
| Ollama | 0.40 |
| Node.js | 22 |
| Memory | 16 GB or more (`qwen3:8b` is a 5.2 GB download) |

## Run it

1. Get the models (one time):

   ```bash
   ollama pull nomic-embed-text
   ```

   ```bash
   ollama pull qwen3:8b
   ```

2. Start OpenSearch (port 9210, this machine only):

   ```bash
   docker compose up -d
   ```

3. Install and build the indexes:

   ```bash
   cd server && npm install && node src/ingest.mjs
   ```

4. Build the screens:

   ```bash
   cd ../web && npm install && npm run build
   ```

5. Start Plaza:

   ```bash
   cd ../server && npm start
   ```

6. Open http://localhost:4320

Use the name in the top right corner to view Plaza as another person. Ava is in Engineering and Operations; Noor is in Sales and Leadership. Search for "fundraising" as each of them.

## New to OpenSearch? Start in `basics/`

`basics/` has nothing to do with Plaza. It is the shortest path from zero to a working search:

| File | What it shows |
| --- | --- |
| `docker-compose.yml` | The smallest OpenSearch you can run |
| `requests.sh` | Eleven `curl` calls: create an index, add documents, search, filter, sort, fix typos, count |
| `search.mjs` | The same search from JavaScript |
| `search.py` | The same search from Python |

```bash
cd basics && docker compose up -d && sh requests.sh
```

## The three indexes

| Index | One record is | Used for |
| --- | --- | --- |
| `plaza_content` | A document, discussion topic, reply, event or message | Global search, lists, suggestions |
| `plaza_passages` | One paragraph, one post, one event, or one day of chat in a space | Finding what the assistant answers from |
| `plaza_memory` | One thing remembered about one person | Recall in Ask, the Memory page |

Every record has a `space`. Every content and passage record has a `vector` (768 numbers) beside its text, so the same index can be searched by words, by meaning, or both.

## OpenSearch features, and where to read them

| Feature | Where |
| --- | --- |
| Mappings: `text` with the English analyzer, `keyword`, `date`, `knn_vector` | `indexDefinitions` in `server/src/lib.mjs` |
| Loading many records with `_bulk` | `bulk` in `server/src/ingest.mjs` |
| `multi_match` with the title weighted, and `fuzziness` for typos | `search` in `server/src/search.mjs` |
| Filters in `bool`, and `post_filter` so chip counts stay useful | same |
| Highlighting | same |
| Counts per type and space (`terms` aggregations) | same |
| Suggestions while typing (`search_as_you_type`) | `suggest` in `server/src/search.mjs` |
| Permissions as a `terms` filter on every query | `spaceFilter` in `server/src/search.mjs` |
| Making a new record searchable at once (`refresh: 'wait_for'`) | `postMessage` in `server/src/search.mjs` |
| Vector search (`knn`) with a filter | `nearest` in `server/src/memory.mjs` |
| Hybrid search: a `hybrid` query plus a search pipeline that blends the scores | `createHybridPipeline` in `lib.mjs`, `findPassages` in `ask.mjs` |
| Deleting by query | `forget` in `server/src/memory.mjs` |

## How Ask works

1. The question becomes a vector.
2. Memory: the nearest memories of this person are fetched (up to three facts and two earlier chats, above a similarity floor).
3. Search: a hybrid query finds the five passages closest by words and by meaning, inside the person's spaces.
4. The model gets the passages, numbered, plus the memories, and is told to answer only from them and cite by number.
5. The answer streams to the screen. Only the passages it cited are shown as sources. A sentence that comes from memory is marked as memory, not as a passage.
6. If the message stated a lasting fact about the person, it is saved, and only when the fact is made of the message's own words. A message that states a fact and asks nothing gets a short confirmation. A one-line note about each answered question is saved too.

## The API

Send the header `x-user` with a person's id (`ava`, `noor`, ...). There is no sign-in in this example.

| Call | What it does |
| --- | --- |
| `GET /api/status` | Record counts and model names |
| `GET /api/people` | People and spaces |
| `GET /api/search?q=&type=&space=&from=&to=&mode=` | Global search. `mode=hybrid` adds meaning |
| `GET /api/suggest?q=` | Titles for what has been typed so far |
| `GET /api/list?type=&space=&parent=` | The list behind a module page |
| `GET /api/content?id=` | One record, if you may see it |
| `POST /api/messages` with `{"space": "...", "text": "..."}` | Sends a chat message |
| `POST /api/ask` with `{"question": "..."}` | Streams the steps and the answer as server-sent events |
| `GET /api/memory` | Your memories |
| `DELETE /api/memory?id=` | Deletes one memory, or all when `id` is left out |
| `POST /api/ingest` | Rebuilds content and passages (`?memory=reset` also clears memory) |

## Tests

```bash
cd server && npm test
```

Twenty-five tests run against the real OpenSearch and the real models: search behaviour, permissions (two people, different results), Ask (an answer with its source, a question with no answer, a question about a space the person is not in) and Memory (save, recall in a new question, delete, and one person's memory never showing for another), and Security (six attacks that worked before their fixes).

## Settings

Optional environment variables, read in `server/src/lib.mjs`.

| Variable | Default |
| --- | --- |
| `PORT` | `4320` |
| `OPENSEARCH_URL` | `http://127.0.0.1:9210` |
| `OLLAMA_URL` | `http://127.0.0.1:11434` |
| `EMBED_MODEL` | `nomic-embed-text` |
| `CHAT_MODEL` | `qwen3:8b` |

Dates in the sample data are relative: "today" is the day you run `ingest.mjs`. Run it again to refresh them.

## Security

Plaza was attacked five ways after it was built, and all five worked. Each is now fixed and kept as a test in `server/test/security.test.mjs`.

| Attack | What happened | Fix |
| --- | --- | --- |
| Reach it from the network | The server listened on every address | It listens on `127.0.0.1` only |
| A request from another web page | A form posted from any site was accepted | Only its own address, its own pages and JSON are accepted (`checkRequest`) |
| A script inside a chat message | Results found by meaning were put into the page as HTML | Every result is escaped (`escapeHtml`), and a content security policy is sent |
| Orders for the assistant inside a chat message (prompt injection) | The assistant repeated them word for word | Passages that read like orders are held back (`looksLikeOrders`); the prompt marks passages as content |
| A very large request | Read in full | Bodies over 64 KB are refused |

Prompt injection has no complete fix. The check catches plain cases only. What limits the damage is that the assistant can only read, only from the asker's own spaces, and always shows its sources.

## Limits of this example

This is a teaching example, not a production system.

- **No sign-in.** The screen says who you are. The permission rule is real, but anyone can claim to be anyone. A real system checks identity on the server.
- **OpenSearch security is off** and the port is bound to this machine. Do not expose it to a network.
- **A small model can be wrong.** It is told to answer only from the passages and to say when the answer is missing, and the tests check both, but always read the sources.
- **Memory is simple.** Facts are pulled out by the model and can be missed or misread. That is why the Memory page shows everything and lets you delete it.
- **One node, no replicas, small data.** Enough to learn the ideas; sizing a real cluster is its own subject.
