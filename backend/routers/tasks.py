"""
Task Management Router
Handles daily task generation, retrieval, and updates
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os

router = APIRouter(prefix="/tasks", tags=["tasks"])

# ===== MODELS =====

class UserHealthData(BaseModel):
    firstName: Optional[str] = None
    conditions: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    bloodPressure: Optional[str] = None
    bloodSugar: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None
    activityLevel: Optional[str] = None

class GenerateTasksRequest(BaseModel):
    clerkId: str
    userHealthData: UserHealthData

class GeneratedTaskResponse(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str  # low, medium, high
    category: str  # medication, exercise, appointment, health-check, nutrition, general
    dueDate: Optional[str] = None
    generatedByGroq: bool = True
    isCompleted: bool = False
    clerkId: str

class GenerateTasksResponse(BaseModel):
    tasks: List[GeneratedTaskResponse]
    message: str

class DailyTaskResponse(BaseModel):
    id: str = Field(alias="_id")  # Use alias for Sanity's _id field
    title: str
    description: Optional[str] = None
    priority: str
    category: str
    isCompleted: bool
    dueDate: Optional[str] = None
    completedAt: Optional[str] = None
    generatedByGroq: bool
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    
    class Config:
        populate_by_name = True  # Allow both 'id' and '_id' when parsing
        by_alias = True  # Serialize using alias names (use _id in JSON output)

class FetchTasksResponse(BaseModel):
    tasks: List[DailyTaskResponse]
    total: int
    message: str

# ===== SANITY CLIENT =====

def get_sanity_client():
    """Get Sanity client for API calls"""
    try:
        import sys
        # Try to import sanity module
        sanity_module = __import__('sanity', fromlist=['Client'])
        Client = getattr(sanity_module, 'Client', None)
        
        if not Client:
            # Fallback - use requests to make direct API calls
            return None
        
        project_id = os.getenv("SANITY_PROJECT_ID", "q5maqr3y")
        dataset = os.getenv("SANITY_DATASET", "production")
        api_token = os.getenv("SANITY_API_TOKEN")
        
        client = Client(
            projectId=project_id,
            dataset=dataset,
            apiVersion="2024-01-01",
            token=api_token,
            useCdn=False
        )
        return client
    except Exception as e:
        print(f"Error initializing Sanity client: {e}")
        return None

# ===== GROQ INTEGRATION =====

def generate_tasks_with_groq(user_health_data: UserHealthData) -> List[dict]:
    """
    Generate personalized daily tasks using Groq AI
    
    This function creates a prompt based on user health data and uses Groq
    to generate relevant health tasks.
    """
    try:
        from groq import Groq  # type: ignore
        import os
        
        # Initialize Groq client
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Build user profile context
        profile_text = "User Health Profile:\n"
        if user_health_data.firstName:
            profile_text += f"- Name: {user_health_data.firstName}\n"
        if user_health_data.age:
            profile_text += f"- Age: {user_health_data.age}\n"
        if user_health_data.weight:
            profile_text += f"- Weight: {user_health_data.weight} kg\n"
        if user_health_data.bloodPressure:
            profile_text += f"- Blood Pressure: {user_health_data.bloodPressure}\n"
        if user_health_data.bloodSugar:
            profile_text += f"- Blood Sugar: {user_health_data.bloodSugar} mg/dL\n"
        if user_health_data.activityLevel:
            profile_text += f"- Activity Level: {user_health_data.activityLevel}\n"
        if user_health_data.conditions:
            profile_text += f"- Health Conditions: {', '.join(user_health_data.conditions)}\n"
        if user_health_data.medications:
            profile_text += f"- Current Medications: {', '.join(user_health_data.medications)}\n"
        if user_health_data.allergies:
            profile_text += f"- Allergies: {', '.join(user_health_data.allergies)}\n"
        
        # Create prompt for Groq
        prompt = f"""{profile_text}

Based on this health profile, generate exactly 3 personalized daily health tasks for today.

Return the tasks in this exact JSON format (no markdown, just raw JSON):
{{
  "tasks": [
    {{
      "title": "Task title",
      "description": "Brief description",
      "priority": "high|medium|low",
      "category": "medication|exercise|appointment|health-check|nutrition|general"
    }},
    ...
  ]
}}

Make sure tasks are:
1. Personalized to the user's health conditions
2. Realistic and achievable in one day
3. Focused on medication compliance, exercise, nutrition, and health monitoring
4. Clear and actionable
5. Include at least one medication reminder if medications are listed

Generate exactly 3 tasks. No more, no less."""

        # Call Groq API
        print(f"🤖 Calling Groq API with model: mixtral-8x7b-32768")
        print(f"📝 Prompt length: {len(prompt)} characters")
        
        message = client.messages.create(
            model="mixtral-8x7b-32768",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        print(f"✅ Groq API responded successfully")
        
        # Parse response
        response_text = message.content[0].text
        print(f"📄 Response text length: {len(response_text)} characters")
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        import json
        parsed = json.loads(response_text.strip())
        print(f"✅ Successfully parsed JSON with {len(parsed.get('tasks', []))} tasks")
        
        # Add dueDate to tasks (today at specific times)
        today = datetime.now()
        tasks_with_dates = []
        
        for idx, task in enumerate(parsed.get("tasks", [])):
            # Stagger tasks throughout the day
            task["dueDate"] = today.isoformat()
            tasks_with_dates.append(task)
            print(f"  📌 Task {idx+1}: {task.get('title')} (priority: {task.get('priority')}, category: {task.get('category')})")
        
        print(f"📊 Generated {len(tasks_with_dates)} tasks successfully")
        return tasks_with_dates
        
    except Exception as e:
        print(f"❌ Error generating tasks with Groq: {e}")
        import traceback
        traceback.print_exc()
        # Return empty list on error - frontend will use defaults
        return []

# ===== ENDPOINTS =====

@router.get("/today/{clerk_id}", response_model=FetchTasksResponse)
async def get_today_tasks(clerk_id: str) -> FetchTasksResponse:
    """
    Fetch today's incomplete tasks for a user from Sanity
    
    This endpoint:
    1. Takes a clerk_id (user ID)
    2. Queries Sanity for today's incomplete tasks
    3. Returns tasks sorted by priority
    """
    try:
        if not clerk_id:
            raise HTTPException(status_code=400, detail="clerk_id is required")
        
        # Get credentials
        project_id = os.getenv("SANITY_PROJECT_ID", "q5maqr3y")
        dataset = os.getenv("SANITY_DATASET", "production")
        api_token = os.getenv("SANITY_API_TOKEN")
        
        if not api_token:
            print("⚠️ SANITY_API_TOKEN not set, returning empty tasks")
            return FetchTasksResponse(
                tasks=[],
                total=0,
                message="Sanity credentials not configured"
            )
        
        # Get today's date range
        from datetime import datetime, timedelta
        today = datetime.now()
        today_start = today.replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"
        tomorrow_start = (today + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"
        
        print(f"🔍 Fetching tasks for clerk_id: {clerk_id}")
        print(f"📅 Date range: {today_start} to {tomorrow_start}")
        
        # Build GROQ query - Sanity includes _id by default
        groq_query = f"""*[_type == "dailyTask" && clerkId == "{clerk_id}" && 
                        (dueDate == null || (dueDate >= "{today_start}" && dueDate < "{tomorrow_start}")) && 
                        isCompleted == false] | order(priority desc, dueDate asc)"""
        
        print(f"📋 GROQ Query: {groq_query}")
        
        # Make HTTP request to Sanity API
        import requests  # type: ignore
        import urllib.parse
        
        encoded_query = urllib.parse.quote(groq_query)
        sanity_url = f"https://{project_id}.api.sanity.io/v2024-01-01/data/query/{dataset}?query={encoded_query}"
        
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Accept": "application/json"
        }
        
        response = requests.get(sanity_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"⚠️ Sanity API error: {response.status_code}")
            print(f"Response: {response.text}")
            return FetchTasksResponse(
                tasks=[],
                total=0,
                message="Failed to fetch from Sanity"
            )
        
        data = response.json()
        tasks = data.get("result", [])
        
        print(f"✅ Sanity returned {len(tasks)} tasks for {clerk_id}")
        print(f"📦 Raw Sanity response: {tasks}")
        
        if tasks:
            print(f"📌 Task details:")
            for task in tasks:
                print(f"  - _id={task.get('_id')}, title={task.get('title')}: dueDate={task.get('dueDate')}, isCompleted={task.get('isCompleted')}, priority={task.get('priority')}")
        
        # Format response
        formatted_tasks = [
            DailyTaskResponse(
                **{
                    "id": task.get("_id"),  # Map Sanity's _id to our id field
                    "title": task.get("title"),
                    "description": task.get("description"),
                    "priority": task.get("priority", "medium"),
                    "category": task.get("category", "general"),
                    "isCompleted": task.get("isCompleted", False),
                    "dueDate": task.get("dueDate"),
                    "completedAt": task.get("completedAt"),
                    "generatedByGroq": task.get("generatedByGroq", False),
                    "createdAt": task.get("createdAt"),
                    "updatedAt": task.get("updatedAt")
                }
            )
            for task in tasks
        ]
        
        print(f"✅ Fetched {len(formatted_tasks)} tasks from Sanity for user {clerk_id}")
        print(f"📋 Formatted tasks with IDs: {[{'_id': t.id, 'title': t.title} for t in formatted_tasks]}")
        
        response_data = FetchTasksResponse(
            tasks=formatted_tasks,
            total=len(formatted_tasks),
            message=f"Retrieved {len(formatted_tasks)} tasks for today"
        )
        print(f"🔄 Returning JSON response: {response_data.json()}")
        return response_data
            
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        # Return empty list instead of error - frontend will handle fallback
        return FetchTasksResponse(
            tasks=[],
            total=0,
            message=f"Error: {str(e)}"
        )

@router.post("/generate-groq", response_model=GenerateTasksResponse)
async def generate_groq_tasks(
    request: GenerateTasksRequest,
    raw_request: Request
) -> GenerateTasksResponse:
    """
    Generate personalized daily tasks using Groq AI based on user health data
    
    This endpoint:
    1. Takes user health data
    2. Calls Groq AI to generate personalized tasks
    3. Returns structured task list ready to be saved to Sanity
    
    The frontend should then call the Sanity API to save these tasks.
    """
    try:
        if not request.clerkId:
            raise HTTPException(status_code=400, detail="clerkId is required")
        
        print(f"\n{'='*60}")
        print(f"🚀 GROQ TASK GENERATION REQUEST")
        print(f"{'='*60}")
        print(f"👤 User ID: {request.clerkId}")
        print(f"📋 Health Data: {request.userHealthData}")
        print(f"{'='*60}\n")
        
        # Generate tasks with Groq
        generated_tasks = generate_tasks_with_groq(request.userHealthData)
        
        # If Groq fails, provide default tasks
        if not generated_tasks:
            print(f"⚠️ Groq generation failed, using default tasks")
            generated_tasks = get_default_tasks()
        
        # Add clerkId to each task
        tasks_with_clerk_id = [
            {
                **task,
                "clerkId": request.clerkId,
                "isCompleted": False,
                "generatedByGroq": True
            }
            for task in generated_tasks
        ]
        
        print(f"\n{'='*60}")
        print(f"✅ GENERATION COMPLETE - {len(tasks_with_clerk_id)} TASKS")
        print(f"{'='*60}\n")
        
        return GenerateTasksResponse(
            tasks=tasks_with_clerk_id,
            message=f"Generated {len(tasks_with_clerk_id)} personalized tasks using Groq AI"
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"\n❌ ERROR IN GENERATE_GROQ_TASKS")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate tasks: {str(e)}"
        )

def get_default_tasks() -> List[dict]:
    """Fallback tasks when Groq generation fails - exactly 3 tasks"""
    return [
        {
            "title": "Take morning medication",
            "description": "Take prescribed medications with water",
            "priority": "high",
            "category": "medication"
        },
        {
            "title": "30-minute walk or exercise",
            "description": "Light physical activity for the day",
            "priority": "medium",
            "category": "exercise"
        },
        {
            "title": "Drink 8 glasses of water",
            "description": "Stay hydrated throughout the day",
            "priority": "medium",
            "category": "health-check"
        }
    ]
