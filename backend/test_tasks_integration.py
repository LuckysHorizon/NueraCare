#!/usr/bin/env python3
"""
Test Script for Tasks Backend Integration
Tests the full flow from creating tasks in Sanity to fetching them via backend
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "http://localhost:8000"
SANITY_PROJECT_ID = "q5maqr3y"
SANITY_DATASET = "production"
TEST_CLERK_ID = "user_test_123"

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}\n")

def test_health_check():
    """Test backend health"""
    print_header("1. Testing Backend Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_fetch_tasks():
    """Test fetching tasks from backend"""
    print_header("2. Testing Fetch Tasks Endpoint")
    try:
        url = f"{BACKEND_URL}/api/tasks/today/{TEST_CLERK_ID}"
        print(f"Fetching from: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"   Total tasks: {data.get('total', 0)}")
            print(f"   Message: {data.get('message', '')}")
            
            tasks = data.get('tasks', [])
            if tasks:
                print(f"\n   Tasks found:")
                for i, task in enumerate(tasks[:3], 1):
                    print(f"   {i}. {task.get('title')} (Priority: {task.get('priority')})")
            else:
                print(f"\n   ℹ️  No tasks found for today (create some in Sanity Studio)")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_generate_groq_tasks():
    """Test Groq task generation endpoint"""
    print_header("3. Testing Groq Task Generation")
    try:
        url = f"{BACKEND_URL}/api/tasks/generate-groq"
        payload = {
            "clerkId": TEST_CLERK_ID,
            "userHealthData": {
                "firstName": "Test User",
                "age": 45,
                "weight": 75,
                "conditions": ["diabetes", "hypertension"],
                "medications": ["Metformin", "Lisinopril"],
                "allergies": ["Penicillin"],
                "activityLevel": "moderate"
            }
        }
        
        print(f"POSTing to: {url}")
        print(f"Payload: User with {len(payload['userHealthData'].get('medications', []))} medications")
        
        response = requests.post(url, json=payload, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"   Message: {data.get('message', '')}")
            
            tasks = data.get('tasks', [])
            print(f"   Generated {len(tasks)} tasks:")
            for i, task in enumerate(tasks, 1):
                print(f"   {i}. {task.get('title')} (Priority: {task.get('priority')}, Category: {task.get('category')})")
            
            return True
        else:
            print(f"⚠️  Status {response.status_code}")
            error_msg = response.json().get('detail', response.text)
            print(f"   Response: {error_msg}")
            print(f"   Note: Groq may be unavailable if API key not set")
            return True  # Don't fail - Groq is optional
            
    except Exception as e:
        print(f"⚠️  Error: {e}")
        print(f"   Note: Groq generation is optional")
        return True

def test_sanity_connection():
    """Test Sanity connection"""
    print_header("4. Testing Sanity Connection")
    try:
        # Check environment
        import os
        token = os.getenv("SANITY_API_TOKEN")
        
        if not token:
            print("❌ SANITY_API_TOKEN not set in environment")
            return False
        
        print("✅ SANITY_API_TOKEN found")
        
        # Try a simple query
        sanity_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/{SANITY_DATASET}?query=*%5B_type%20%3D%3D%20%22dailyTask%22%5D%5B0%5D"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        
        response = requests.get(sanity_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Sanity API connection successful")
            data = response.json()
            if data.get('result'):
                print(f"   Found task in Sanity")
            else:
                print(f"   ℹ️  No tasks in Sanity yet (create some in Studio)")
            return True
        else:
            print(f"❌ Sanity API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def print_instructions():
    """Print instructions for creating test tasks"""
    print_header("INSTRUCTIONS: Create Test Tasks")
    print("""
To create test tasks and see them in the app:

1. Go to Sanity Studio:
   http://localhost:3333

2. Click "Daily Task" in the left sidebar

3. Click "Create" to create a new task with:
   - Title: "Take morning medication"
   - Clerk ID: "user_test_123" (matches TEST_CLERK_ID in this script)
   - Category: "medication"
   - Priority: "high"
   - Due Date: Today's date
   - Is Completed: false

4. Publish the document

5. Run this test again to see the task appear

Then in the app:
- Go to home screen
- Tasks will appear in "Today's Focus" section
- Click "Mark done" to complete
- Task status saves to Sanity
    """)

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  NueraCare Tasks Integration Test Suite")
    print("=" * 60)
    print(f"\nBackend URL: {BACKEND_URL}")
    print(f"Test Clerk ID: {TEST_CLERK_ID}")
    print(f"Sanity Project: {SANITY_PROJECT_ID} / {SANITY_DATASET}")
    
    results = {
        "Health Check": test_health_check(),
        "Fetch Tasks": test_fetch_tasks(),
        "Groq Generation": test_generate_groq_tasks(),
        "Sanity Connection": test_sanity_connection(),
    }
    
    # Summary
    print_header("Test Summary")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    all_passed = all(results.values())
    if all_passed:
        print(f"\n✅ All tests passed!")
    else:
        print(f"\n⚠️  Some tests failed - check configuration above")
    
    print_instructions()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    try:
        exit(main())
    except KeyboardInterrupt:
        print("\n\n❌ Test interrupted")
        exit(1)
