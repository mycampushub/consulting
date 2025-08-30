#!/bin/bash

echo "=== COMPREHENSIVE API TESTING ==="
echo ""

# Test agency exists
echo "1. Testing agency existence..."
AGENCY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/test/create-agency -H "Content-Type: application/json")
echo "Agency Response: $AGENCY_RESPONSE"
echo ""

# Test marketing campaigns
echo "2. Testing Marketing Campaigns API..."
CAMPAIGNS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/marketing/campaigns -H "Content-Type: application/json")
CAMPAIGNS_COUNT=$(echo "$CAMPAIGNS_RESPONSE" | jq '.campaigns | length' 2>/dev/null || echo "ERROR")
echo "Campaigns Count: $CAMPAIGNS_COUNT"
echo ""

# Test marketing leads
echo "3. Testing Marketing Leads API..."
LEADS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/marketing/leads -H "Content-Type: application/json")
LEADS_COUNT=$(echo "$LEADS_RESPONSE" | jq '.leads | length' 2>/dev/null || echo "ERROR")
echo "Leads Count: $LEADS_COUNT"
echo ""

# Test workflows
echo "4. Testing Workflows API..."
WORKFLOWS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/workflows -H "Content-Type: application/json")
WORKFLOWS_COUNT=$(echo "$WORKFLOWS_RESPONSE" | jq '.workflows | length' 2>/dev/null || echo "ERROR")
echo "Workflows Count: $WORKFLOWS_COUNT"
echo ""

# Test universities
echo "5. Testing Universities API..."
UNIVERSITIES_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/universities -H "Content-Type: application/json")
UNIVERSITIES_COUNT=$(echo "$UNIVERSITIES_RESPONSE" | jq '. | length' 2>/dev/null || echo "ERROR")
echo "Universities Count: $UNIVERSITIES_COUNT"
echo ""

# Test students
echo "6. Testing Students API..."
STUDENTS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/students -H "Content-Type: application/json")
STUDENTS_COUNT=$(echo "$STUDENTS_RESPONSE" | jq '.students | length' 2>/dev/null || echo "ERROR")
echo "Students Count: $STUDENTS_COUNT"
echo ""

# Test forms
echo "7. Testing Forms API..."
FORMS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/forms -H "Content-Type: application/json")
FORMS_COUNT=$(echo "$FORMS_RESPONSE" | jq '.forms | length' 2>/dev/null || echo "ERROR")
echo "Forms Count: $FORMS_COUNT"
echo ""

# Test landing pages
echo "8. Testing Landing Pages API..."
LANDING_PAGES_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/landing-pages -H "Content-Type: application/json")
LANDING_PAGES_COUNT=$(echo "$LANDING_PAGES_RESPONSE" | jq '.landingPages | length' 2>/dev/null || echo "ERROR")
echo "Landing Pages Count: $LANDING_PAGES_COUNT"
echo ""

# Test accounting
echo "9. Testing Accounting API..."
ACCOUNTING_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/accounting -H "Content-Type: application/json")
ACCOUNTING_STATUS=$(echo "$ACCOUNTING_RESPONSE" | jq '.status' 2>/dev/null || echo "ERROR")
echo "Accounting Status: $ACCOUNTING_STATUS"
echo ""

# Test billing
echo "10. Testing Billing API..."
BILLING_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/billing/usage -H "Content-Type: application/json")
BILLING_PLAN=$(echo "$BILLING_RESPONSE" | jq '.plan' 2>/dev/null || echo "ERROR")
echo "Billing Plan: $BILLING_PLAN"
echo ""

# Test communications
echo "11. Testing Communications API..."
COMMUNICATIONS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/communications -H "Content-Type: application/json")
COMMUNICATIONS_COUNT=$(echo "$COMMUNICATIONS_RESPONSE" | jq '. | length' 2>/dev/null || echo "ERROR")
echo "Communications Count: $COMMUNICATIONS_COUNT"
echo ""

# Test documents
echo "12. Testing Documents API..."
DOCUMENTS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/documents -H "Content-Type: application/json")
DOCUMENTS_COUNT=$(echo "$DOCUMENTS_RESPONSE" | jq '.documents | length' 2>/dev/null || echo "ERROR")
echo "Documents Count: $DOCUMENTS_COUNT"
echo ""

# Test applications
echo "13. Testing Applications API..."
APPLICATIONS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/testagency/applications -H "Content-Type: application/json")
APPLICATIONS_COUNT=$(echo "$APPLICATIONS_RESPONSE" | jq '.applications | length' 2>/dev/null || echo "ERROR")
echo "Applications Count: $APPLICATIONS_COUNT"
echo ""

# Test student portal
echo "14. Testing Student Portal API..."
STUDENT_PORTAL_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/testagency/student/portal?studentId=1" -H "Content-Type: application/json")
STUDENT_PORTAL_STATUS=$(echo "$STUDENT_PORTAL_RESPONSE" | jq '.student.status' 2>/dev/null || echo "ERROR")
echo "Student Portal Status: $STUDENT_PORTAL_STATUS"
echo ""

echo "=== API TESTING COMPLETE ==="