# Policy CRUD Operations - Implementation Guide

## Overview
This document describes the implementation of full CRUD (Create, Read, Update, Delete) operations for HR policies in the HR Onboarding Bot system.

## Backend Implementation

### New API Endpoints

#### 1. Create Policy Section
- **Endpoint**: `POST /api/policies`
- **Request Body**:
  ```json
  {
    "section_id": "string",
    "title": "string",
    "content": "string",
    "order": "integer (1-17)"
  }
  ```
- **Response**: Success/error message with section ID
- **Validation**: 
  - All fields are required
  - Order must be between 1-17
  - Section ID must be unique

#### 2. Update Policy Section
- **Endpoint**: `PUT /api/policies/{section_id}`
- **Request Body**:
  ```json
  {
    "title": "string (optional)",
    "content": "string (optional)",
    "order": "integer (1-17, optional)"
  }
  ```
- **Response**: Success/error message
- **Validation**: At least one field must be provided for update

#### 3. Delete Policy Section
- **Endpoint**: `DELETE /api/policies/{section_id}`
- **Response**: Success/error message
- **Safety**: Confirmation required on frontend

### Existing Endpoints (Enhanced)
- `GET /api/policies` - Get all policies with filtering and pagination
- `GET /api/policies/{section_id}` - Get specific policy by ID
- `GET /api/policies/step/{order}` - Get policy by step order

## Frontend Implementation

### New Features

#### 1. Manage Policies Tab
- **Location**: New tab in PoliciesPage
- **Features**:
  - Create new policy sections
  - Edit existing policies
  - Delete policies with confirmation
  - Form validation
  - Success/error messaging

#### 2. Enhanced Browse Tab
- **Features**:
  - View policy details
  - Quick edit buttons
  - Delete buttons
  - Success/error messaging

#### 3. Form Components
- **Create Form**: 
  - Section ID input
  - Title input
  - Content textarea
  - Order selector (1-17)
  - Create/Cancel buttons

- **Edit Form**:
  - Pre-populated with existing data
  - Section ID (read-only)
  - Editable title, content, and order
  - Update/Cancel buttons

### State Management
```javascript
// CRUD state variables
const [isCreating, setIsCreating] = useState(false)
const [isEditing, setIsEditing] = useState(false)
const [editingPolicy, setEditingPolicy] = useState(null)
const [newPolicy, setNewPolicy] = useState({
  section_id: '',
  title: '',
  content: '',
  order: 1
})
const [successMessage, setSuccessMessage] = useState('')
```

### API Integration
```javascript
// New API endpoints
createPolicy: (policyData) => api.post('/policies', policyData),
updatePolicy: (sectionId, policyData) => api.put(`/policies/${sectionId}`, policyData),
deletePolicy: (sectionId) => api.delete(`/policies/${sectionId}`),
```

## Usage Examples

### Creating a New Policy
1. Navigate to Policies page
2. Click "Manage Policies" tab
3. Click "Create New Policy" button
4. Fill in the form:
   - Section ID: `company_culture`
   - Title: `Company Culture and Values`
   - Content: `Our company culture is built on...`
   - Order: `3`
5. Click "Create Policy"

### Editing an Existing Policy
1. Navigate to Policies page
2. Click "Manage Policies" tab
3. Click "Edit" button on any policy card
4. Modify the desired fields
5. Click "Update Policy"

### Deleting a Policy
1. Navigate to Policies page
2. Click "Manage Policies" tab
3. Click "Delete" button (trash icon) on any policy card
4. Confirm deletion in the popup dialog

## Error Handling

### Backend Validation
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Policy section doesn't exist
- **500 Internal Server Error**: Server-side processing error

### Frontend Validation
- Required field validation
- Order range validation (1-17)
- Duplicate section ID prevention
- User-friendly error messages

### Success Feedback
- Green success messages
- Auto-dismiss after 5 seconds
- Form reset after successful operations

## Security Considerations

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention (MongoDB)
- XSS prevention through proper escaping

### Access Control
- Currently no authentication required
- Consider adding role-based access control for production

## Testing

### Backend Testing
Run the test script to verify all CRUD operations:
```bash
cd backend
python test_policy_crud.py
```

### Frontend Testing
1. Start the backend server
2. Start the frontend development server
3. Navigate to Policies page
4. Test all CRUD operations through the UI

## Future Enhancements

### Planned Features
1. **Bulk Operations**: Import/export multiple policies
2. **Version Control**: Track policy changes over time
3. **Approval Workflow**: Require approval for policy changes
4. **Audit Logging**: Track who made what changes when
5. **Policy Templates**: Pre-defined policy structures

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Offline Support**: Service worker for offline editing
3. **Rich Text Editor**: WYSIWYG content editing
4. **File Attachments**: Support for policy documents and images

## Troubleshooting

### Common Issues

#### 1. Policy Creation Fails
- Check if section_id already exists
- Verify order is between 1-17
- Ensure all required fields are filled

#### 2. Update Not Working
- Verify the policy exists
- Check if any fields were actually changed
- Ensure proper JSON format in request

#### 3. Delete Confirmation
- Frontend requires user confirmation
- Check browser console for errors
- Verify backend server is running

### Debug Mode
Enable debug logging in the backend:
```python
logging.basicConfig(level=logging.DEBUG)
```

## API Documentation

### Complete API Reference
The full API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Testing with Postman
Import the provided Postman collection:
`hr_onboarding_postman_collection.json`

## Support

For technical support or questions about the Policy CRUD implementation:
1. Check the backend logs for error details
2. Verify API endpoints are accessible
3. Test with the provided test script
4. Review this documentation for usage examples
