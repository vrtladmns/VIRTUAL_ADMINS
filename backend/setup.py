#!/usr/bin/env python3
"""
Setup script for HR Onboarding Backend
This script helps create the .env file and verify the setup
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with default values"""
    env_content = """MONGO_URI=mongodb://localhost:27017
MONGO_DB=onboarding_bot
EXCEL_FILE=./data/onboarded_employees.xlsx
AZURE_AI_ENDPOINT=
AZURE_AI_API_KEY=
"""
    
    env_path = Path(".env")
    if env_path.exists():
        print(".env file already exists. Skipping creation.")
        return
    
    try:
        with open(env_path, "w") as f:
            f.write(env_content)
        print("✅ Created .env file with default values")
        print("⚠️  Please update AZURE_AI_ENDPOINT and AZURE_AI_API_KEY if needed")
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        "fastapi",
        "uvicorn",
        "pymongo",
        "pandas",
        "openpyxl",
        "httpx",
        "python-dotenv",
        "pydantic"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    else:
        print("✅ All required packages are installed")
        return True

def check_mongodb():
    """Check MongoDB connection"""
    try:
        from pymongo import MongoClient
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        client.close()
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("Make sure MongoDB is running on localhost:27017")
        return False

def main():
    """Main setup function"""
    print("🚀 HR Onboarding Backend Setup")
    print("=" * 40)
    
    # Create .env file
    create_env_file()
    print()
    
    # Check dependencies
    deps_ok = check_dependencies()
    print()
    
    # Check MongoDB
    mongo_ok = check_mongodb()
    print()
    
    if deps_ok and mongo_ok:
        print("🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Activate your virtual environment")
        print("2. Run: uvicorn app.main:app --reload --port 8000")
        print("3. Open: http://localhost:8000/docs")
    else:
        print("⚠️  Setup completed with warnings. Please resolve the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
