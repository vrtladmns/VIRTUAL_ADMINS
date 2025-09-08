# HR Onboarding Chatbot

An AI-powered chatbot system for streamlining employee onboarding, answering HR policy questions, and managing structured employee data. Built with modern web technologies and deployed on Azure cloud infrastructure.

## 🚀 Overview

The HR Onboarding Chatbot is a comprehensive solution that automates the employee onboarding process while providing intelligent assistance for HR policy questions. The system combines structured data collection, AI-powered Q&A capabilities, and a modern web interface to create a seamless onboarding experience.

### Key Capabilities

- **Automated Onboarding Flow**: Step-by-step guided onboarding with 13+ employee data fields
- **AI-Powered Policy Q&A**: Intelligent responses to HR policy questions using Azure AI services
- **Dual Operation Modes**: Onboarding assistant + informational HR helpdesk
- **Data Management**: MongoDB storage with Excel export capabilities
- **Real-time Progress Tracking**: Visual progress indicators and completion status
- **Responsive Web Interface**: Modern, mobile-first design with dark mode support

## ✨ Features

### 🎯 Structured Onboarding
- **13 Required Fields**: Complete employee information collection
- **Progress Tracking**: Real-time onboarding status and completion metrics
- **Flexible Navigation**: Move forward, backward, skip, or complete steps
- **Session Management**: Persistent onboarding sessions with unique IDs
- **Data Validation**: Comprehensive input validation and error handling

### 🤖 AI-Powered Assistance
- **Policy Q&A**: Intelligent answers to HR policy questions
- **Context-Aware Responses**: AI responses with onboarding-aware context
- **Azure AI Integration**: GPT-powered natural language processing
- **Real-time Chat**: Interactive chat interface for instant support

### 📊 Data Management
- **MongoDB Storage**: Scalable NoSQL database for employee records
- **Excel Export**: Automated Excel file generation for HR records
- **Cosmos DB Support**: Azure Cosmos DB integration for production
- **Data Analytics**: Comprehensive tracking and reporting capabilities

### 🎨 Modern User Interface
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Dark Mode Support**: Light and dark theme options
- **Component Library**: Built with shadcn/ui components
- **Real-time Updates**: Live progress tracking and status updates

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn + Gunicorn
- **Database**: MongoDB (local) / Azure Cosmos DB (production)
- **AI Integration**: Azure AI Playground (GPT)
- **Data Processing**: Pandas + OpenPyXL
- **Validation**: Pydantic models
- **Deployment**: Azure App Service

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Deployment**: Azure Static Web Apps

### Infrastructure
- **Cloud Platform**: Microsoft Azure
- **Backend Hosting**: Azure App Service
- **Frontend Hosting**: Azure Static Web Apps
- **Database**: Azure Cosmos DB (MongoDB API)
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights

## 📁 Project Structure

```
hr-onboarding-bot/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py      # API endpoints and routing
│   │   ├── models/
│   │   │   ├── employee.py    # Employee data models
│   │   │   └── policy.py      # Policy and KB models
│   │   ├── services/
│   │   │   ├── mongo_ops.py   # MongoDB operations
│   │   │   ├── excel_writer.py # Excel file operations
│   │   │   ├── ai_connector.py # Azure AI integration
│   │   │   ├── policy_service.py # Policy management
│   │   │   └── employee_kb_service.py # Employee KB service
│   │   ├── config.py          # Configuration settings
│   │   └── main.py           # FastAPI application entry point
│   ├── data/
│   │   └── onboarded_employees.xlsx # Excel export file
│   ├── requirements.txt       # Python dependencies
│   ├── startup.py            # Azure App Service startup script
│   ├── web.config            # IIS configuration
│   ├── app_settings.json     # Azure App Service settings
│   ├── azure-pipelines.yml   # Azure DevOps pipeline
│   └── ZIP_DEPLOY_CONFIG.md  # Deployment configuration
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── Layout.jsx   # Main layout wrapper
│   │   │   ├── Header.jsx   # Application header
│   │   │   └── Sidebar.jsx  # Navigation sidebar
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── PoliciesPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── store/
│   │   │   └── useStore.js  # Zustand state management
│   │   ├── lib/
│   │   │   ├── api.js       # API client configuration
│   │   │   ├── validations.js # Zod validation schemas
│   │   │   └── utils.js     # Utility functions
│   │   └── App.jsx          # Main application component
│   ├── dist/                # Production build output
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── staticwebapp.config.json # Azure Static Web Apps config
└── requirements.txt          # Root-level dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB** (local development)
- **Azure Account** (for production deployment)

### Local Development

#### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-onboarding-bot/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Unix/MacOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   Create a `.env` file:
   ```env
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB=onboarding_bot
   EXCEL_FILE=onboarded_employees.xlsx
   AZURE_AI_ENDPOINT=your-azure-ai-endpoint
   AZURE_AI_API_KEY=your-azure-ai-key
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Deployment

#### Azure App Service (Backend)

1. **Create Azure App Service**
   - Python 3.11 runtime
   - Standard tier or higher

2. **Configure Application Settings**
   ```env
   COSMOS_DB_CONNECTION_STRING=your-cosmos-connection-string
   COSMOS_DB_DATABASE_NAME=hr-onboarding-db
   OPENAI_API_KEY=your-openai-api-key
   AI_MODEL=gpt-3.5-turbo
   EXCEL_FILE_PATH=/tmp/onboarded_employees.xlsx
   ```

3. **Set Startup Command**
   ```
   python startup.py
   ```

4. **Configure Health Check**
   - Path: `/api/health`

#### Azure Static Web Apps (Frontend)

1. **Create Static Web App**
   - Source: GitHub repository
   - Build command: `npm run build`
   - App location: `frontend`

2. **Configure API Integration**
   - Update API base URL in environment variables
   - Configure CORS settings in backend

## 📚 API Documentation

### Core Endpoints

#### Health Check
- **GET** `/api/health` - Service health status
- **GET** `/api/ready` - Readiness check

#### Employee Management
- **POST** `/api/onboard` - Create new employee record

#### Policy Management
- **GET** `/api/policies` - List all policy sections
- **POST** `/api/policies` - Create new policy section
- **GET** `/api/policies/validation/used-orders` - Get used order numbers
- **GET** `/api/policies/validation/used-section-ids` - Get used section IDs

#### Employee Knowledge Base
- **POST** `/api/employee-kb` - Create employee knowledge base entry
- **GET** `/api/employee-kb` - List all employee KB entries
- **GET** `/api/employee-kb/{doc_id}` - Get specific employee KB entry
- **GET** `/api/employee-kb/stats` - Get employee KB statistics

#### AI Services
- **POST** `/api/ask` - Enhanced AI question answering (supports both onboarding and employee helpdesk)

### Data Models

#### Employee Schema
```json
{
  "employee_code": "EMP001",
  "employee_name": "John Doe",
  "gender": "Male",
  "date_of_birth": "1990-01-01",
  "date_of_joining": "2024-01-15",
  "designation": "Software Engineer",
  "ctc_at_joining": 800000.0,
  "aadhaar_number": "123456789012",
  "uan": "123456789012",
  "personal_email_id": "john.doe@email.com",
  "official_email_id": "john.doe@company.com",
  "contact_number": "+91-9876543210",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_number": "+91-9876543211"
}
```

## ⚙️ Configuration

### Environment Variables

#### Backend
- `MONGO_URI` - MongoDB connection string
- `MONGO_DB` - Database name
- `EXCEL_FILE` - Excel file path
- `AZURE_AI_ENDPOINT` - Azure AI service endpoint
- `AZURE_AI_API_KEY` - Azure AI API key
- `COSMOS_DB_CONNECTION_STRING` - Azure Cosmos DB connection
- `DEBUG` - Debug mode flag
- `LOG_LEVEL` - Logging level

#### Frontend
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_APP_TITLE` - Application title

### CORS Configuration
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `https://icy-rock-023916e1e.2.azurestaticapps.net` (Production)

## 🧪 Testing

### API Testing Examples

#### Health Check
```bash
curl http://localhost:8000/api/health
```

#### Employee Onboarding
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
    "ctc_at_joining": 800000.0,
    "aadhaar_number": "123456789012",
    "uan": "123456789012",
    "personal_email_id": "john.doe@email.com",
    "official_email_id": "john.doe@company.com",
    "contact_number": "+91-9876543210",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_number": "+91-9876543211"
  }'
```

#### AI Question (Enhanced Ask)
```bash
curl -X POST "http://localhost:8000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the company leave policy?",
    "scope": "employee_helpdesk"
  }'
```

#### Get Policies
```bash
curl http://localhost:8000/api/policies
```

#### Get Employee KB Statistics
```bash
curl http://localhost:8000/api/employee-kb/stats
```

### Backend Testing
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

## 📊 Monitoring & Analytics

### Health Monitoring
- **Health Check**: `/api/health` endpoint for Azure monitoring
- **Readiness Check**: `/api/ready` for load balancer health
- **Application Insights**: Azure monitoring and logging

### Analytics Features
- Employee onboarding completion rates
- Policy engagement metrics
- AI response accuracy tracking
- User interaction analytics

## 🔒 Security Features

- **Input Validation**: Pydantic models with comprehensive validation
- **CORS Protection**: Configured cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Data Encryption**: MongoDB/Cosmos DB encryption at rest
- **API Rate Limiting**: Built-in FastAPI rate limiting
- **HTTPS Enforcement**: SSL/TLS encryption in production

## 🚀 Deployment Method

### Azure Zip Deploy (Current Implementation)

This project uses **Azure Zip Deploy** for production deployment, which is the recommended and currently implemented deployment method.

#### Backend Deployment (Azure App Service)

1. **Azure App Service Configuration**
   ```bash
   # App Settings (configured in Azure Portal)
   PYTHONPATH = /home/site/wwwroot:/home/site/wwwroot/.python_packages/lib/site-packages:/home/site/wwwroot/.python_packages/lib/python3.11/site-packages
   WEBSITES_CONTAINER_START_TIME_LIMIT = 180
   WEBSITE_HEALTHCHECK_MAXPINGFAILURES = 10
   ```

2. **Startup Command**
   ```bash
   python startup.py
   ```

3. **Health Check Configuration**
   - Path: `/api/health`
   - Used for Azure monitoring and load balancer health checks

4. **Deployment Process**
   ```bash
   # Zip the backend directory
   cd backend
   zip -r backend-deploy.zip . -x "*.pyc" "__pycache__/*" "*.log"
   
   # Deploy using Azure CLI
   az webapp deployment source config-zip \
     --resource-group your-resource-group \
     --name your-app-service-name \
     --src backend-deploy.zip
   ```

#### Frontend Deployment (Azure Static Web Apps)

1. **Build Configuration**
   ```bash
   # Build command
   npm run build
   
   # Output directory
   dist/
   ```

2. **Static Web App Configuration**
   - Source: GitHub repository
   - Build command: `npm run build`
   - App location: `frontend`
   - API location: `backend` (for Azure Functions integration)

#### Deployment Features
- ✅ **Zero-downtime deployments**
- ✅ **Automatic dependency installation**
- ✅ **Health check monitoring**
- ✅ **GitHub Actions CI/CD integration**
- ✅ **Environment-specific configurations**
- ✅ **Rollback capabilities**

#### Current Production URLs
- **Backend API**: `https://your-backend.azurewebsites.net`
- **Frontend**: `https://icy-rock-023916e1e.2.azurestaticapps.net`
- **Health Check**: `https://your-backend.azurewebsites.net/api/health`
- **API Documentation**: `https://your-backend.azurewebsites.net/docs`


### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write comprehensive tests
- Update documentation for new features

## 📄 License & Copyright

**Copyright © 2025 Sankalp Gupta, Virtual Admins. All rights reserved.**

This project is proprietary software developed by Sankalp for Virtual Admins. This software is confidential and proprietary. No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright holder.

**Unauthorized copying, distribution, or use of this software is strictly prohibited and may result in severe civil and criminal penalties.**

For licensing inquiries, please contact: [Your Contact Information]

## 🆘 Support & Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB Connection**: Ensure MongoDB is running and accessible
- **Azure AI Integration**: Verify API keys and endpoint configuration
- **Excel Export**: Check file permissions and openpyxl installation

#### Frontend Issues
- **API Connection**: Verify backend URL and CORS configuration
- **Build Errors**: Check Node.js version and dependency installation
- **Styling Issues**: Ensure Tailwind CSS is properly configured


## 📈 Version History

- **v1.0.0** - Initial release with core onboarding features
- **v1.1.0** - Added AI-powered policy Q&A
- **v1.2.0** - Enhanced UI with dark mode support
- **v1.3.0** - Azure deployment optimization



**Developed by Sankalp for Virtual Admins**

- Built using modern web technologies
- Powered by Azure AI services
- UI components from shadcn/ui
- Icons from Lucide React
- Deployed on Microsoft Azure cloud infrastructure

---

**© Virtual Admins. All rights reserved.**

