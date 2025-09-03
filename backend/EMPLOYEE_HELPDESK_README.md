# Employee Helpdesk - Backend Implementation

## Overview

The Employee Helpdesk is a new feature that extends the existing HR chatbot to support both new employee onboarding and existing employee support. This implementation adds a new scope to the `/api/ask` endpoint while maintaining backward compatibility with existing onboarding flows.

## Architecture

### New Models

#### EnhancedAskRequest
- **scope**: `"onboarding"` | `"employee"` (default: onboarding)
- **mode**: `"guided"` | `"global"` (only relevant if scope="onboarding")
- **message**: The question or message
- **context_hints**: Optional context hints for better AI responses
- **section_id**: Specific section ID for guided mode (only relevant if scope="onboarding")

#### EnhancedAskResponse
- **scope**: The scope that was used
- **mode_used**: Mode used (only for onboarding scope)
- **answer**: The AI-generated answer
- **context_info**: Context information about what was used
- **suggestions**: Suggested follow-up questions or actions
- **timestamp**: Response timestamp

#### EmployeeKB Models
- **EmployeeKB**: Full Employee Knowledge Base document model
- **EmployeeKBCreate**: Model for creating new documents
- **EmployeeKBUpdate**: Model for updating existing documents

### New Endpoints

#### Enhanced Ask Endpoint
```
POST /api/ask
```

**Features:**
- **Employee Scope**: Returns helpdesk information for insurance, payroll, holidays, IT, reimbursements
- **Onboarding Scope**: Maintains existing guided/global modes for new employee onboarding
- **Smart Validation**: Prevents invalid combinations (e.g., mode with employee scope)

#### Employee KB Management
```
POST   /employee-kb                    # Create new KB document
GET    /employee-kb                    # List documents (with filtering)
GET    /employee-kb/{doc_id}          # Get specific document
PUT    /employee-kb/{doc_id}          # Update document
DELETE /employee-kb/{doc_id}          # Delete document
GET    /employee-kb/categories        # Get available categories
GET    /employee-kb/stats             # Get document statistics
```

## Usage Examples

### Employee Helpdesk Mode

```bash
curl -X POST "http://localhost:8000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "employee",
    "message": "I need help with my insurance"
  }'
```

**Response:**
```json
{
  "scope": "employee",
  "answer": "✅ Employee Helpdesk Mode is active. Ask about insurance, payroll, holidays, IT, reimbursements, etc.",
  "context_info": "Employee Helpdesk - General support for existing employees",
  "suggestions": [
    "How do I update my insurance information?",
    "When is the next payroll date?",
    "How many vacation days do I have?",
    "I need IT support for my computer",
    "How do I submit an expense reimbursement?"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Onboarding Guided Mode

```bash
curl -X POST "http://localhost:8000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "onboarding",
    "mode": "guided",
    "section_id": "company_overview",
    "message": "What is this policy about?"
  }'
```

### Onboarding Global Mode

```bash
curl -X POST "http://localhost:8000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "onboarding",
    "mode": "global",
    "message": "Give me an overview of all policies"
  }'
```

### Creating Employee KB Documents

```bash
curl -X POST "http://localhost:8000/employee-kb" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Health Insurance Benefits",
    "content": "Comprehensive health insurance coverage including medical, dental, and vision...",
    "category": "insurance",
    "tags": ["health", "benefits", "coverage"],
    "visibility": "public"
  }'
```

## Data Model

### Employee KB Document Structure

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Document Title",
  "content": "Document content...",
  "category": "insurance|payroll|holidays|IT|reimbursements|general|benefits|policies",
  "audience": "employee",
  "tags": ["tag1", "tag2"],
  "version": "1.0",
  "effective_from": "2024-01-15T00:00:00Z",
  "visibility": "public|private|restricted",
  "source_url": "https://example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Categories

- **insurance**: Health, dental, vision, life insurance
- **payroll**: Salary, bonuses, deductions, tax information
- **holidays**: Vacation days, sick leave, company holidays
- **IT**: Computer support, software, access requests
- **reimbursements**: Expense reports, travel, training costs
- **general**: General HR questions and policies
- **benefits**: All employee benefits information
- **policies**: Company policies and procedures

## Validation Rules

### EnhancedAskRequest Validation

1. **Scope**: Must be either "onboarding" or "employee"
2. **Mode**: Only applicable for onboarding scope
3. **Section ID**: Only applicable for onboarding scope with guided mode
4. **Message**: Required, 1-1000 characters

### EmployeeKB Validation

1. **Category**: Must be one of the predefined categories
2. **Audience**: Must be "employee"
3. **Visibility**: Must be "public", "private", or "restricted"
4. **Content**: Maximum 50,000 characters
5. **Title**: Maximum 200 characters

## Error Handling

### Validation Errors (422)
- Invalid scope values
- Mode specified with employee scope
- Section ID with global mode
- Invalid category or visibility values

### Business Logic Errors (400)
- Missing required fields for guided mode
- Invalid combinations of parameters

### Not Found Errors (404)
- Policy section not found
- Employee KB document not found

### Server Errors (500)
- Database connection issues
- Service layer failures

## Testing

Run the comprehensive test suite:

```bash
cd backend
python test_employee_helpdesk.py
```

The test suite covers:
- ✅ Health endpoint
- ✅ Employee Helpdesk scope
- ✅ Onboarding guided scope
- ✅ Onboarding global scope
- ✅ Employee KB CRUD operations
- ✅ Validation error handling

## Future Enhancements

### Phase 2: AI Integration
- Integrate with Azure OpenAI for intelligent responses
- Use Employee KB documents as context for AI responses
- Implement semantic search for better document retrieval

### Phase 3: Advanced Features
- Document versioning and approval workflows
- User authentication and role-based access
- Analytics and usage tracking
- Integration with external HR systems

### Phase 4: Mobile Support
- Mobile-optimized responses
- Push notifications for updates
- Offline document caching

## Database Schema

### Collection: `employee_kb_docs`

```javascript
{
  "_id": ObjectId,
  "title": String,
  "content": String,
  "category": String,
  "audience": String,
  "tags": [String],
  "version": String,
  "effective_from": Date,
  "visibility": String,
  "source_url": String,
  "created_at": Date,
  "updated_at": Date
}
```

### Indexes
- `{ "audience": 1 }` - For filtering employee documents
- `{ "category": 1, "audience": 1 }` - For category-based queries
- `{ "tags": 1 }` - For tag-based search
- `{ "created_at": -1 }` - For chronological ordering

## Security Considerations

1. **Input Validation**: All inputs are validated using Pydantic models
2. **SQL Injection**: MongoDB operations use parameterized queries
3. **Access Control**: Future implementation should include user authentication
4. **Data Privacy**: Sensitive information should be properly classified and protected

## Performance Considerations

1. **Database Indexes**: Proper indexing on frequently queried fields
2. **Pagination**: Large result sets are paginated
3. **Caching**: Consider Redis for frequently accessed documents
4. **Search Optimization**: MongoDB text search or external search engine for production

## Monitoring and Logging

- All operations are logged with appropriate log levels
- Error tracking for debugging and monitoring
- Performance metrics for database operations
- User activity tracking for analytics

## Deployment

### Requirements
- Python 3.8+
- FastAPI
- MongoDB 4.4+
- Pydantic 2.0+

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/hr_onboarding
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint
```

### Startup
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Support

For technical support or questions about the Employee Helpdesk implementation, please refer to the main project documentation or contact the development team.
