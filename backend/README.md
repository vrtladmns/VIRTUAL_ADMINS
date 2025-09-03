# HR Onboarding Backend

A FastAPI-based backend for an HR Onboarding Chatbot that handles employee onboarding data and AI-powered Q&A.

## Features

- **Employee Onboarding**: Collect and store 13 required employee fields
- **Data Persistence**: MongoDB storage + Excel file export
- **AI Integration**: Azure AI service integration (configurable)
- **RESTful API**: Clean, documented endpoints
- **CORS Support**: Frontend integration ready
- **Onboarding Automation**: Complete automated onboarding flow with progress tracking
- **Progress Analytics**: Detailed tracking of employee learning and understanding
- **Session Management**: Onboarding session lifecycle management
- **Smart AI Context**: AI responses with onboarding-aware context

## Prerequisites

- Python 3.11+
- MongoDB running locally (or accessible via MONGO_URI)
- Virtual environment (recommended)

## Setup

### 1. Environment Configuration

Create a `.env` file in the backend directory:

```bash
MONGO_URI=mongodb://localhost:27017
MONGO_DB=onboarding_bot
EXCEL_FILE=onboarded_employees.xlsx
AZURE_AI_ENDPOINT=
AZURE_AI_API_KEY=
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# Start MongoDB service
mongod
```

## Running the Application

```bash
# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
- **GET** `/api/health`
- **Response**: `{"status": "ok"}`

### Employee Onboarding
- **POST** `/api/onboard`
- **Body**: Employee JSON with 13 required fields
- **Response**: `{"status": "success", "id": "<mongodb_object_id>"}`

### AI Question
- **POST** `/api/ask`
- **Form Data**: `question: <string>`
- **Response**: `{"answer": "<ai_response>"}`

### Onboarding Automation
- **POST** `/api/onboarding/start` - Start new onboarding session
- **GET** `/api/onboarding/progress/{session_id}` - Get onboarding progress
- **POST** `/api/onboarding/next-step` - Move to next policy step
- **POST** `/api/onboarding/previous-step` - Move to previous policy step
- **POST** `/api/onboarding/complete-step` - Mark current step as understood
- **POST** `/api/onboarding/skip-step` - Skip current policy step
- **POST** `/api/onboarding/ask` - Ask questions during onboarding
- **GET** `/api/onboarding/status/{session_id}` - Get comprehensive status


### Policy Management
- **POST** `/api/ingest` - Bulk ingest HR policy sections
- **GET** `/api/policies` - Get policies with filtering and pagination

- **POST** `/api/ask-policy` - AI-powered policy Q&A

## Onboarding Automation System

The system provides a complete automated onboarding experience:

### **Onboarding Flow**
1. **Start Session**: Employee begins onboarding with unique session ID
2. **Step-by-Step Learning**: Progress through 17 company policies systematically
3. **Interactive Q&A**: Ask questions about any policy with AI assistance
4. **Progress Tracking**: Monitor completion status and understanding
5. **Flexible Navigation**: Move forward, backward, skip, or complete steps
6. **Completion Certificate**: Mark onboarding as complete when finished

### **Key Benefits**
- **100% Automation**: No manual HR involvement required
- **Self-Paced Learning**: Employees learn at their own speed
- **24/7 Availability**: Complete onboarding anytime, anywhere
- **Progress Analytics**: Track understanding and completion rates
- **AI-Powered Support**: Get instant answers to policy questions
- **Compliance Tracking**: Ensure all policies are reviewed

### **Employee Experience**
```
Welcome to Company Onboarding! 🎯
Step 1 of 17: About the Company

[Policy content displayed]

✅ I understand this policy
❓ I have a question
⏭️ Skip to next policy

[AI answers questions with context]
[Progress bar shows completion]
[Navigation controls available]
```

## Employee Data Schema

The API expects the following 13 fields:

```json
{
  "employee_code": "EMP001",
  "employee_name": "John Doe",
  "gender": "Male",
  "date_of_birth": "1990-01-01",
  "date_of_joining": "2024-01-15",
  "designation": "Software Engineer",
  "aadhaar_number": "123456789012",
  "uan": "123456789012",
  "personal_email_id": "john.doe@email.com",
  "official_email_id": "john.doe@company.com",
  "contact_number": "+91-9876543210",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_number": "+91-9876543211"
}
```

## Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. Employee Onboarding
```bash
curl -X POST "http://localhost:8000/api/onboard" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_code": "EMP001",
    "employee_name": "John Doe",
    "gender": "Male",
    "date_of_birth": "1990-01-01",
    "date_of_joining": "2024-01-15",
    "designation": "Software Engineer",
    "aadhaar_number": "123456789012",
    "uan": "123456789012",
    "personal_email_id": "john.doe@email.com",
    "official_email_id": "john.doe@company.com",
    "contact_number": "+91-9876543210",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_number": "+91-9876543211"
  }'
```

### 3. AI Question
```bash
curl -X POST "http://localhost:8000/api/ask" \
  -F "question=What is the company leave policy?"
```

## Data Storage

### MongoDB
- **Database**: `onboarding_bot`
- **Collection**: `employees`
- **Additional Field**: `created_at` (UTC timestamp)

### Excel File
- **File**: `onboarded_employees.xlsx`
- **Location**: Backend root directory
- **Columns**: Fixed order as specified in the schema

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py        # API endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── employee.py      # Pydantic models
│   └── services/
│       ├── __init__.py
│       ├── mongo_ops.py     # MongoDB operations
│       ├── excel_writer.py  # Excel file operations
│       └── ai_connector.py  # Azure AI integration
├── requirements.txt
├── .env
└── README.md
```

## Configuration

### Environment Variables
- `MONGO_URI`: MongoDB connection string
- `MONGO_DB`: Database name
- `EXCEL_FILE`: Excel file name
- `AZURE_AI_ENDPOINT`: Azure AI service endpoint
- `AZURE_AI_API_KEY`: Azure AI service API key

### CORS Origins
- http://localhost:3000 (React default)
- http://localhost:5173 (Vite default)
- * (all origins)

## Error Handling

- **Validation Errors**: 422 Unprocessable Entity (FastAPI automatic)
- **Server Errors**: 500 Internal Server Error
- **MongoDB Errors**: Logged and returned as 500
- **Excel Errors**: Logged and returned as 500

## Security Features

- Input validation via Pydantic
- No sensitive data logging
- CORS configuration
- Environment variable configuration

## Extending the Application

### Adding New Endpoints
1. Add route in `app/api/routes.py`
2. Update models if needed in `app/models/`
3. Add business logic in `app/services/`

### Frontend Integration
- CORS is configured for common development ports
- API endpoints are RESTful and well-documented
- Swagger documentation available at `/docs`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network connectivity

### Excel File Issues
- Check file permissions
- Ensure `openpyxl` is installed
- Verify column order matches schema

### AI Service Issues
- Check Azure AI configuration
- Verify API keys and endpoints
- Check network connectivity

## Support

For issues and questions:
1. Check the logs for error messages
2. Verify environment configuration
3. Test individual components
4. Check MongoDB and Excel file permissions
