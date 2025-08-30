#!/bin/bash

echo "Creating test agency..."
curl -X POST http://localhost:3000/api/test/create-agency \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}\n"

echo -e "\n\nCreating test marketing data..."
curl -X POST http://localhost:3000/api/test/create-marketing-data \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}\n"

echo -e "\n\nTesting marketing campaigns API..."
curl -X GET http://localhost:3000/api/testagency/marketing/campaigns \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}\n"

echo -e "\n\nTesting marketing leads API..."
curl -X GET http://localhost:3000/api/testagency/marketing/leads \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}\n"

echo -e "\n\nTesting workflows API..."
curl -X GET http://localhost:3000/api/testagency/workflows \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}\n"