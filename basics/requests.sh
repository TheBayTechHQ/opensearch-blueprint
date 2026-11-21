#!/bin/sh
# Every call from the video, in order. Run it whole, or copy one call at a time.
# Usage: sh requests.sh            (OpenSearch on http://localhost:9200)
#        OS=http://localhost:9210 sh requests.sh
OS="${OS:-http://localhost:9200}"
JSON="Content-Type: application/json"
say() { printf '\n\n== %s ==\n' "$1"; }

say "1. Is it alive?"
curl -s "$OS"

say "2. Start clean (ignore the error the first time)"
curl -s -X DELETE "$OS/books"

say "3. Create an index with a mapping"
curl -s -X PUT "$OS/books" -H "$JSON" -d '{
  "mappings": {
    "properties": {
      "title":  { "type": "text", "analyzer": "english" },
      "author": { "type": "keyword" },
      "year":   { "type": "integer" },
      "genre":  { "type": "keyword" },
      "about":  { "type": "text", "analyzer": "english" }
    }
  }
}'

say "4. Put one document in"
curl -s -X PUT "$OS/books/_doc/1?refresh=true" -H "$JSON" -d '{
  "title": "The Lighthouse Keeper",
  "author": "Mara Lind",
  "year": 2019,
  "genre": "mystery",
  "about": "A keeper on a remote island finds letters hidden in the lamp room."
}'

say "5. Get it back by id"
curl -s "$OS/books/_doc/1"

say "6. Put many in at once with _bulk"
curl -s -X POST "$OS/books/_bulk?refresh=true" -H "Content-Type: application/x-ndjson" --data-binary '
{ "index": { "_id": "2" } }
{ "title": "Running the Tide", "author": "Owen Hale", "year": 2021, "genre": "sport", "about": "She starts running on the beach every morning before the tide comes in." }
{ "index": { "_id": "3" } }
{ "title": "Bread and Salt", "author": "Ines Costa", "year": 2015, "genre": "cooking", "about": "Simple recipes from a seaside bakery, with stories about the people who run it." }
{ "index": { "_id": "4" } }
{ "title": "The Quiet Island", "author": "Mara Lind", "year": 2023, "genre": "mystery", "about": "A detective arrives on an island where nobody will talk about the lighthouse." }
{ "index": { "_id": "5" } }
{ "title": "Letters to the Sea", "author": "Tomas Reed", "year": 2010, "genre": "poetry", "about": "Poems written as letters, one for every month of a year spent sailing." }
'

say "7. Search by words: 'run' also finds 'running'"
curl -s "$OS/books/_search" -H "$JSON" -d '{
  "query": { "match": { "about": "run" } },
  "_source": ["title"]
}'

say "8. Search two fields, title counts double, with the matched words marked"
curl -s "$OS/books/_search" -H "$JSON" -d '{
  "query": { "multi_match": { "query": "island lighthouse", "fields": ["title^2", "about"] } },
  "highlight": { "fields": { "about": {} } },
  "_source": ["title"]
}'

say "9. Words plus exact filters, newest first"
curl -s "$OS/books/_search" -H "$JSON" -d '{
  "query": {
    "bool": {
      "must":   [ { "match": { "about": "island" } } ],
      "filter": [ { "term": { "genre": "mystery" } }, { "range": { "year": { "gte": 2020 } } } ]
    }
  },
  "sort": [ { "year": "desc" } ],
  "_source": ["title", "year"]
}'

say "10. Forgive a typo"
curl -s "$OS/books/_search" -H "$JSON" -d '{
  "query": { "match": { "title": { "query": "lighthose", "fuzziness": "AUTO" } } },
  "_source": ["title"]
}'

say "11. Count books per genre"
curl -s "$OS/books/_search" -H "$JSON" -d '{
  "size": 0,
  "aggs": { "genres": { "terms": { "field": "genre" } } }
}'
echo
