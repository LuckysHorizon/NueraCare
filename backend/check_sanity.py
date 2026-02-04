#!/usr/bin/env python3
"""Check what documents exist in Sanity for medical reports."""

import os
import json
from dotenv import load_dotenv
import httpx

load_dotenv()

project_id = os.getenv('SANITY_PROJECT_ID')
dataset = os.getenv('SANITY_DATASET')
token = os.getenv('SANITY_API_TOKEN')

print(f'Project ID: {project_id}')
print(f'Dataset: {dataset}')
print()

# Query all medical reports
url = f'https://{project_id}.api.sanity.io/v2023-10-18/data/query/{dataset}'
headers = {'Authorization': f'Bearer {token}'}

print("=== All Medical Reports ===")
params = {'query': '*[_type == "medicalReport"]'}

try:
    resp = httpx.get(url, params=params, headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    
    results = data.get('result', [])
    print(f"Found {len(results)} medical reports\n")
    
    for doc in results:
        print(f"ID: {doc.get('_id')}")
        print(f"Report ID: {doc.get('reportId')}")
        print(f"User ID: {doc.get('userId')}")
        print(f"Upload Date: {doc.get('uploadDate')}")
        print(f"Text Length: {len(doc.get('extractedText', ''))}")
        print("-" * 50)
        
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
