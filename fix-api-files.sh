#!/bin/bash

# Fix all API files to use getSubdomainForAPI instead of getSubdomain

echo "Fixing API files to use getSubdomainForAPI..."

# Find all files that need fixing
files=$(find /home/z/my-project/src/app/api -name "*.ts" -exec grep -l "getSubdomain(request)" {} \;)

for file in $files; do
  echo "Fixing: $file"
  
  # Replace import statement
  sed -i 's/import { getSubdomain } from "@\/lib\/utils"/import { getSubdomainForAPI } from "@\/lib\/utils"/g' "$file"
  
  # Replace function calls
  sed -i 's/getSubdomain(request)/getSubdomainForAPI(request)/g' "$file"
  
  echo "Fixed: $file"
done

echo "All API files have been fixed!"