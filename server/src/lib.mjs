// Shared pieces: settings, the OpenSearch client, the Ollama calls and the index definitions.
import { Client } from '@opensearch-project/opensearch';

export const config = {
  port: Number(process.env.PORT || 4320),
  host: process.env.HOST || '127.0.0.1',
  opensearchUrl: process.env.OPENSEARCH_URL || 'http://127.0.0.1:9210',
  ollamaUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
  embedModel: process.env.EMBED_MODEL || 'nomic-embed-text',
  chatModel: process.env.CHAT_MODEL || 'qwen3:8b',
};

export const INDEX = {
  content: 'plaza_content',
  passages: 'plaza_passages',
  memory: 'plaza_memory',
};

// Name of the search pipeline that blends keyword and vector scores.
export const HYBRID_PIPELINE = 'plaza_hybrid';

export const client = new Client({ node: config.opensearchUrl });

/**
 * Turns texts into vectors with the embedding model.
 * @param {string[]} texts Texts to embed.
 * @param {'document'|'query'} kind The model was trained with a different prefix for each.
 * @returns {Promise<number[][]>} One vector per text.
 */
export const embed = async (texts, kind = 'document') => {
  const prefix = kind === 'query' ? 'search_query: ' : 'search_document: ';
  const response = await fetch(`${config.ollamaUrl}/api/embed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: config.embedModel, input: texts.map((text) => prefix + text) }),
  });
  if (!response.ok) throw new Error(`Embedding failed: ${response.status} ${await response.text()}`);
  return (await response.json()).embeddings;
};

/**
 * Asks the chat model and returns the whole reply.
 * @param {object[]} messages Chat messages ({ role, content }).
 * @param {object} [options] Extra fields for the request, such as { format: 'json' }.
 * @returns {Promise<string>} The reply text.
 */
export const chat = async (messages, options = {}) => {
  const response = await fetch(`${config.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: config.chatModel, messages, stream: false, think: false, options: { temperature: 0.1 }, ...options }),
  });
  if (!response.ok) throw new Error(`Chat failed: ${response.status} ${await response.text()}`);
  return (await response.json()).message.content;
};

/**
 * Asks the chat model and yields the reply piece by piece.
 * @param {object[]} messages Chat messages ({ role, content }).
 * @returns {AsyncGenerator<string>} Pieces of the reply as they arrive.
 */
export async function* chatStream(messages) {
  const response = await fetch(`${config.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: config.chatModel, messages, stream: true, think: false, options: { temperature: 0.1 } }),
  });
  if (!response.ok) throw new Error(`Chat failed: ${response.status} ${await response.text()}`);
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      const piece = JSON.parse(line).message?.content;
      if (piece) yield piece;
    }
  }
}

/**
 * Builds the three index definitions for a given vector length.
 * @param {number} dimension Length of the embedding model's vectors.
 * @returns {object} Index name to { settings, mappings }.
 */
export const indexDefinitions = (dimension) => {
  const vector = {
    type: 'knn_vector',
    dimension,
    method: { name: 'hnsw', engine: 'lucene', space_type: 'cosinesimil' },
  };
  return {
    [INDEX.content]: {
      settings: { index: { knn: true, number_of_shards: 1, number_of_replicas: 0 } },
      mappings: {
        properties: {
          type: { type: 'keyword' },
          space: { type: 'keyword' },
          title: {
            type: 'text',
            analyzer: 'english',
            // The same text indexed a second way, for suggestions while typing.
            fields: { suggest: { type: 'search_as_you_type' } },
          },
          body: { type: 'text', analyzer: 'english' },
          author: { type: 'keyword' },
          author_name: { type: 'text' },
          tags: { type: 'keyword', fields: { text: { type: 'text' } } },
          created: { type: 'date' },
          parent_id: { type: 'keyword' },
          starts: { type: 'date' },
          ends: { type: 'date' },
          place: { type: 'text' },
          vector,
        },
      },
    },
    [INDEX.passages]: {
      settings: { index: { knn: true, number_of_shards: 1, number_of_replicas: 0 } },
      mappings: {
        properties: {
          content_id: { type: 'keyword' },
          type: { type: 'keyword' },
          space: { type: 'keyword' },
          title: { type: 'text', analyzer: 'english' },
          text: { type: 'text', analyzer: 'english' },
          created: { type: 'date' },
          vector,
        },
      },
    },
    [INDEX.memory]: {
      settings: { index: { knn: true, number_of_shards: 1, number_of_replicas: 0 } },
      mappings: {
        properties: {
          user: { type: 'keyword' },
          kind: { type: 'keyword' },
          text: { type: 'text', analyzer: 'english' },
          created: { type: 'date' },
          vector,
        },
      },
    },
  };
};

/**
 * Creates the search pipeline that puts keyword and vector scores on the same
 * scale and blends them. Safe to call again.
 * @returns {Promise<void>}
 */
export const createHybridPipeline = async () => {
  await client.transport.request({
    method: 'PUT',
    path: `/_search/pipeline/${HYBRID_PIPELINE}`,
    body: {
      description: 'Blend keyword and vector results',
      phase_results_processors: [
        {
          'normalization-processor': {
            normalization: { technique: 'min_max' },
            combination: { technique: 'arithmetic_mean', parameters: { weights: [0.4, 0.6] } },
          },
        },
      ],
    },
  });
};
