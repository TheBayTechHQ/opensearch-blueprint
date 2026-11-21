# The same search from Python, with the official client.
#   pip install opensearch-py
#   python search.py
import os

from opensearchpy import OpenSearch

client = OpenSearch(os.environ.get("OS", "http://localhost:9200"))

result = client.search(
    index="books",
    body={
        "query": {
            "bool": {
                "must": [{"multi_match": {"query": "island lighthouse", "fields": ["title^2", "about"]}}],
                "filter": [{"term": {"genre": "mystery"}}],
            }
        }
    },
)

print(f"{result['hits']['total']['value']} books found in {result['took']} ms")
for hit in result["hits"]["hits"]:
    print(f"{hit['_score']:.2f}  {hit['_source']['title']} ({hit['_source']['year']})")
