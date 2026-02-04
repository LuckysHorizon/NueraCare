from __future__ import annotations

import os
import sys
from typing import List, Tuple

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()  # Load .env file from current directory
except ImportError:
    print("⚠️  python-dotenv not installed. Install it with: pip install python-dotenv")
    print("    Checking system environment variables only...\n")


def check_environment() -> Tuple[bool, List[str]]:
    """Check if all required environment variables are set."""
    errors: List[str] = []
    warnings: List[str] = []
    
    # Critical environment variables
    required_vars = {
        "GROQ_API_KEY": "Groq AI API key for generating explanations",
        "SANITY_PROJECT_ID": "Sanity project ID for data storage",
        "SANITY_DATASET": "Sanity dataset name",
        "SANITY_API_TOKEN": "Sanity API token for mutations",
    }
    
    # Optional but recommended
    optional_vars = {
        "GROQ_MODEL": "Groq model selection (defaults to llama-3.1-8b-instant)",
    }
    
    print("=" * 60)
    print("NueraCare Backend Environment Configuration Check")
    print("=" * 60)
    print()
    
    # Check required variables
    print("Required Environment Variables:")
    print("-" * 60)
    all_set = True
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            print(f"✗ {var:<20} MISSING - {description}")
            errors.append(f"{var} is not set")
            all_set = False
        else:
            masked_value = value[:4] + "..." + value[-4:] if len(value) > 8 else "***"
            print(f"✓ {var:<20} SET ({masked_value})")
    
    print()
    
    # Check optional variables
    print("Optional Environment Variables:")
    print("-" * 60)
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if not value:
            print(f"○ {var:<20} NOT SET - {description}")
            warnings.append(f"{var} not set (using defaults)")
        else:
            print(f"✓ {var:<20} SET ({value})")
    
    print()
    print("=" * 60)
    
    if errors:
        print("ERRORS FOUND:")
        for error in errors:
            print(f"  • {error}")
        print()
        print("Please create a .env file in the backend directory with:")
        print("  GROQ_API_KEY=your_groq_key_here")
        print("  SANITY_PROJECT_ID=your_project_id")
        print("  SANITY_DATASET=production")
        print("  SANITY_API_TOKEN=your_token_here")
        print()
        return False, errors
    
    if warnings:
        print("WARNINGS:")
        for warning in warnings:
            print(f"  • {warning}")
        print()
    
    print("✓ All required environment variables are configured!")
    print("=" * 60)
    return True, []


def check_dependencies() -> bool:
    """Check if all required Python packages are installed."""
    required_packages = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("pydantic", "pydantic"),
        ("httpx", "httpx"),
        ("pdfplumber", "pdfplumber"),
        ("pytesseract", "pytesseract"),
        ("pillow", "PIL"),  # PIL is the import name for pillow
        ("python-multipart", "multipart"),
        ("python-dotenv", "dotenv"),
    ]
    
    print()
    print("Checking Python Dependencies:")
    print("-" * 60)
    
    missing = []
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
            print(f"✓ {package_name:<20} INSTALLED")
        except ImportError:
            print(f"✗ {package_name:<20} MISSING")
            missing.append(package_name)
    
    print()
    
    if missing:
        print(f"ERROR: {len(missing)} package(s) missing!")
        print("Install with: pip install -r requirements.txt")
        return False
    
    print("✓ All required packages are installed!")
    return True


if __name__ == "__main__":
    print()
    env_ok, env_errors = check_environment()
    deps_ok = check_dependencies()
    
    print()
    if env_ok and deps_ok:
        print("🎉 Backend configuration is complete! Ready to start server.")
        print("Run: uvicorn main:app --reload")
        sys.exit(0)
    else:
        print("❌ Configuration incomplete. Please fix the errors above.")
        sys.exit(1)
