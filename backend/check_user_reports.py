#!/usr/bin/env python3
"""Query all medical reports for a specific user."""

import os
import json
import urllib.parse
from dotenv import load_dotenv
import httpx

load_dotenv()

project_id = os.getenv('SANITY_PROJECT_ID')
dataset = os.getenv('SANITY_DATASET')
token = os.getenv('SANITY_API_TOKEN')

user_id = 'user_399lIslRMLqlOqSBEBkhty0kJEB'
query = f'*[_type == "medicalReport" && userId == "{user_id}"]'

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
        results = data.get('result', [])
        print(f'Found {len(results)} documents with userId={user_id}\n')
        
        if results:
            for doc in results:
                print(f'Document ID: {doc.get("_id")}')
                print(f'Report ID: {doc.get("reportId")}')
                print(f'Upload Date: {doc.get("uploadDate")}')
                print(f'Text Length: {len(doc.get("extractedText", ""))}')
                print('-' * 50)
        else:
            print('No documents found!')
            
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
