#!/usr/bin/env python3
from dotenv import load_dotenv
import os

load_dotenv()
token = os.getenv('SANITY_API_TOKEN')
print(f'SANITY_API_TOKEN configured: {bool(token)}')
if token:
    print(f'Token length: {len(token)}')
    print(f'Token prefix: {token[:20]}...')
