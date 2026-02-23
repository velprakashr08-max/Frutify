#!/bin/bash
# ============================================================
#  Frutify — Elasticsearch Index Setup
#  Run: bash server/db/elasticsearch/create_index.sh
#
#  Prerequisites: ES running on localhost:9200
#  Check: curl http://localhost:9200
# ============================================================

ES="http://localhost:9200"
INDEX="frutify_products"

echo ""
echo "── Connecting to Elasticsearch ──────────────"
curl -s "$ES" | grep "cluster_name" && echo "✔  ES is up" || { echo "✘  ES not reachable"; exit 1; }

# ── Delete existing index if re-running ──────────────────────
echo ""
echo "── Dropping old index (if exists) ───────────"
curl -s -X DELETE "$ES/$INDEX" | grep -q '"acknowledged":true' && echo "✔  Old index deleted" || echo "–  Index did not exist"


# ============================================================
#  Create index: frutify_products
#  Settings: 1 shard, 0 replicas (dev config — use 1+ replicas in prod)
#  Analysis: custom analyzer for product names
# ============================================================
echo ""
echo "── Creating index: $INDEX ────────────────────"

curl -s -X PUT "$ES/$INDEX" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards":   1,
      "number_of_replicas": 0,
      "analysis": {
        "filter": {
          "autocomplete_filter": {
            "type":     "edge_ngram",
            "min_gram": 2,
            "max_gram": 20
          }
        },
        "analyzer": {
          "product_analyzer": {
            "type":      "custom",
            "tokenizer": "standard",
            "filter":    ["lowercase", "stop", "asciifolding"]
          },
          "autocomplete_analyzer": {
            "type":      "custom",
            "tokenizer": "standard",
            "filter":    ["lowercase", "autocomplete_filter"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "mongo_id": {
          "type": "keyword"
        },
        "name": {
          "type":            "text",
          "analyzer":        "product_analyzer",
          "search_analyzer": "product_analyzer",
          "fields": {
            "autocomplete": {
              "type":            "text",
              "analyzer":        "autocomplete_analyzer",
              "search_analyzer": "product_analyzer"
            },
            "raw": {
              "type": "keyword"
            }
          }
        },
        "slug": {
          "type": "keyword"
        },
        "category": {
          "type": "keyword"
        },
        "type": {
          "type": "keyword"
        },
        "tags": {
          "type": "keyword"
        },
        "organic": {
          "type": "boolean"
        },
        "price": {
          "type": "float"
        },
        "original_price": {
          "type": "float"
        },
        "stock": {
          "type": "integer"
        },
        "avg_rating": {
          "type": "float"
        },
        "review_count": {
          "type": "integer"
        },
        "image": {
          "type":  "keyword",
          "index": false
        },
        "suggest": {
          "type":            "completion",
          "analyzer":        "product_analyzer",
          "search_analyzer": "product_analyzer"
        },
        "updated_at": {
          "type":   "date",
          "format": "strict_date_optional_time"
        }
      }
    }
  }' | python3 -m json.tool


# ── Verify ────────────────────────────────────────────────────
echo ""
echo "── Verifying index ───────────────────────────"
curl -s "$ES/$INDEX/_stats/docs" | grep '"count"'


# ── Seed a test document ──────────────────────────────────────
echo ""
echo "── Seeding one test document ─────────────────"
curl -s -X POST "$ES/$INDEX/_doc/test-001" \
  -H "Content-Type: application/json" \
  -d '{
    "mongo_id":     "000000000000000000000001",
    "name":         "Organic Carrot",
    "slug":         "organic-carrot",
    "category":     "Root Vegetables",
    "type":         "vegetable",
    "tags":         ["keto", "winter"],
    "organic":      true,
    "price":        49.0,
    "stock":        200,
    "avg_rating":   4.3,
    "review_count": 42,
    "suggest": {
      "input": ["Organic Carrot", "carrot", "root vegetable"]
    },
    "updated_at": "2026-02-22T00:00:00Z"
  }' | python3 -m json.tool


# ── Test search ───────────────────────────────────────────────
echo ""
echo "── Test: search for 'carr' (autocomplete) ────"
curl -s -X GET "$ES/$INDEX/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "match": {
        "name.autocomplete": "carr"
      }
    },
    "_source": ["name", "category", "price"],
    "size": 3
  }' | python3 -m json.tool


# ── Delete test document ──────────────────────────────────────
curl -s -X DELETE "$ES/$INDEX/_doc/test-001" > /dev/null

echo ""
echo "🎉  Elasticsearch index ready: $INDEX"
echo "     Node: $ES"
echo ""
