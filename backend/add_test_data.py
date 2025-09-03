#!/usr/bin/env python3
"""
Script to add test data to employee_kb_docs collection
Run this to populate the database with sample data for testing
"""

import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.employee_kb_service import employee_kb_service
from app.models.policy import EmployeeKBCreate
from datetime import datetime, timezone

async def add_test_data():
    """Add test data to employee_kb_docs collection"""
    
    test_documents = [
        {
            "title": "Paid Time Off Policy",
            "content": "Employees are entitled to 20 PTO days per year. PTO can be used for vacation, sick leave, or personal time. Requests must be submitted 2 weeks in advance for vacation and 24 hours for sick leave. Unused PTO carries over to the next year up to a maximum of 5 days.",
            "effective_from": "2024-01-01T00:00:00.000Z"
        },
        {
            "title": "IT Support Guidelines",
            "content": "For IT support, contact helpdesk@company.com or call ext. 1234. Common issues: password reset, software installation, hardware problems. Response time: 2-4 hours during business hours. Emergency support available 24/7 for critical system issues. Please provide your employee ID and describe the problem clearly.",
            "effective_from": "2024-01-01T00:00:00.000Z"
        },
        {
            "title": "Expense Reimbursement Process",
            "content": "Submit expense reports within 30 days of purchase. Use the expense management system or submit receipts to finance@company.com. Include: receipt, business purpose, date, amount. Reimbursements processed within 5 business days. Maximum daily meal allowance: $25 for lunch, $50 for dinner. Travel expenses require pre-approval for amounts over $500.",
            "effective_from": "2024-01-01T00:00:00.000Z"
        },
        {
            "title": "Payroll Schedule and Direct Deposit",
            "content": "Payroll is processed bi-weekly on Fridays. Direct deposit is mandatory and processed by 9 AM on payday. Pay periods run from Monday to Sunday. Overtime is calculated for hours worked over 40 per week. Holiday pay is 1.5x regular rate. Contact payroll@company.com for questions about deductions, taxes, or pay stubs.",
            "effective_from": "2024-01-01T00:00:00.000Z"
        },
        {
            "title": "Remote Work Policy",
            "content": "Remote work is available for eligible positions with manager approval. Core hours: 10 AM - 3 PM EST for team collaboration. Use company VPN and secure communication tools. Home office setup must meet ergonomic standards. Internet speed requirement: minimum 25 Mbps. Regular check-ins with manager required. Equipment provided by company.",
            "effective_from": "2024-01-01T00:00:00.000Z"
        }
    ]
    
    print("🚀 Adding test data to employee_kb_docs collection...")
    
    added_count = 0
    for doc_data in test_documents:
        try:
            # Create EmployeeKBCreate model
            kb_doc = EmployeeKBCreate(**doc_data)
            
            # Add to database
            doc_id = employee_kb_service.create_document(kb_doc)
            print(f"✅ Added: {doc_data['title']} (ID: {doc_id})")
            added_count += 1
            
        except Exception as e:
            print(f"❌ Failed to add {doc_data['title']}: {str(e)}")
    
    print(f"\n🎉 Successfully added {added_count} out of {len(test_documents)} test documents!")
    
    # Show current stats
    try:
        stats = employee_kb_service.get_document_stats()
        print(f"\n📊 Current Collection Stats:")
        print(f"   Total documents: {stats['total_documents']}")
    except Exception as e:
        print(f"⚠️ Could not retrieve stats: {str(e)}")

if __name__ == "__main__":
    print("🧪 Employee Knowledge Base Test Data Generator")
    print("=" * 50)
    
    try:
        asyncio.run(add_test_data())
    except KeyboardInterrupt:
        print("\n⏹️ Operation cancelled by user")
    except Exception as e:
        print(f"\n💥 Error: {str(e)}")
        print("Make sure the backend is running and MongoDB is accessible")
