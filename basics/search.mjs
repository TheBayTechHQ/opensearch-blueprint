// The same search from JavaScript, with the official client.
//   npm install @opensearch-project/opensearch
//   node search.mjs
import { Client } from '@opensearch-project/opensearch';

const client = new Client({ node: process.env.OS || 'http://localhost:9200' });

const { body } = await client.search({
  index: 'books',
  body: {
    query: {
      bool: {
        must: [{ multi_match: { query: 'island lighthouse', fields: ['title^2', 'about'] } }],
        filter: [{ term: { genre: 'mystery' } }],
      },
    },
  },
});

console.log(`${body.hits.total.value} books found in ${body.took} ms`);
for (const hit of body.hits.hits) {
  console.log(`${hit._score.toFixed(2)}  ${hit._source.title} (${hit._source.year})`);
}
