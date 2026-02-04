#!/usr/bin/env python3
"""Test querying a specific report."""

import os
import urllib.parse
from dotenv import load_dotenv
import httpx

load_dotenv()

project_id = os.getenv('SANITY_PROJECT_ID')
dataset = os.getenv('SANITY_DATASET')
token = os.getenv('SANITY_API_TOKEN')

# Use the exact report ID from Sanity
report_id = 'fbcda383-1bb1-4e3d-ba10-f315dbb2381c'
user_id = 'user_399lIslRMLqlOqSBEBkhty0kJEB'

query = f'*[_type == "medicalReport" && reportId == "{report_id}" && userId == "{user_id}"][0]'

url = f'https://{project_id}.api.sanity.io/v2023-10-18/data/query/{dataset}'
headers = {'Authorization': f'Bearer {token}'}

encoded_query = urllib.parse.quote(query)
full_url = f'{url}?query={encoded_query}'

print(f'Query: {query}\n')

try:
    with httpx.Client(timeout=10.0) as client:
        response = client.get(full_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        result = data.get('result')
        
        if result:
            print(f'✓ Found document!')
            print(f'Report ID: {result.get("reportId")}')
            print(f'User ID: {result.get("userId")}')
            print(f'Text Length: {len(result.get("extractedText", ""))}')
        else:
            print(f'❌ Document not found')
            
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
