#!/bin/bash

echo "=== Testing All Modules API Endpoints ==="
echo ""

# Test agency exists first
echo "1. Testing agency existence..."
curl -s -o /dev/null -w "Agency exists: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/marketing/campaigns"

echo ""
echo "=== Marketing Module ==="
echo "2. Testing marketing campaigns..."
curl -s -o /dev/null -w "Campaigns API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/marketing/campaigns"

echo "3. Testing marketing leads..."
curl -s -o /dev/null -w "Leads API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/marketing/leads"

echo "4. Testing workflows..."
curl -s -o /dev/null -w "Workflows API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/workflows"

echo ""
echo "=== Core Modules ==="
echo "5. Testing students..."
curl -s -o /dev/null -w "Students API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/students"

echo "6. Testing applications..."
curl -s -o /dev/null -w "Applications API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/applications"

echo "7. Testing universities..."
curl -s -o /dev/null -w "Universities API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/universities"

echo ""
echo "=== Business Modules ==="
echo "8. Testing billing..."
curl -s -o /dev/null -w "Billing API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/billing/usage"

echo "9. Testing accounting..."
curl -s -o /dev/null -w "Accounting API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/accounting"

echo "10. Testing forms..."
curl -s -o /dev/null -w "Forms API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/forms"

echo "11. Testing landing pages..."
curl -s -o /dev/null -w "Landing Pages API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/landing-pages"

echo ""
echo "=== Communication Modules ==="
echo "12. Testing communications..."
curl -s -o /dev/null -w "Communications API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/communications"

echo "13. Testing documents..."
curl -s -o /dev/null -w "Documents API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/documents"

echo ""
echo "=== Advanced Modules ==="
echo "14. Testing analytics..."
curl -s -o /dev/null -w "Analytics API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/analytics"

echo "15. Testing events..."
curl -s -o /dev/null -w "Events API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/events"

echo "16. Testing integrations..."
curl -s -o /dev/null -w "Integrations API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/integrations"

echo ""
echo "=== Student Portal ==="
echo "17. Testing student portal..."
curl -s -o /dev/null -w "Student Portal API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/student/portal?studentId=1"

echo "18. Testing student auth..."
curl -s -o /dev/null -w "Student Auth API: %{http_code}\n" -X POST "http://localhost:3000/api/testagency/student/auth/login" -H "Content-Type: application/json" -d '{"email":"john.doe@email.com","password":"testpassword123"}'

echo ""
echo "=== Team Management ==="
echo "19. Testing team management..."
curl -s -o /dev/null -w "Team API: %{http_code}\n" -X GET "http://localhost:3000/api/testagency/team"

echo ""
echo "=== Test Complete ==="