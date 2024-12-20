# Release Notes

## Version 1.0.0 (2024-12-20)

### New Features

- Implemented RESTful API for in-memory directory management
- Implemented directory creation with automatic parent creation
- Implemented directory movement with case-insensitive conflict prevention
- Implemented recursive directory deletion
- Implemented hierarchical directory listing

### API Endpoints

- GET /api/v1/directory - Returns formatted directory structure
- POST /api/v1/directory - Creates directories with parent creation
- PATCH /api/v1/directory - Moves directories with conflict detection
- DELETE /api/v1/directory - Removes directories and their contents

### Known Limitations

- Storage Persistence: All data is lost on server restart
- Storage Type: Memory-only storage
- Authentication: No user authentication implemented
- Rate Limiting: No request rate limiting implemented

### Documentation

- Provided API documentation with curl examples
- Included implementation notes
- Detailed path rules
- Comprehensive error handling documentation

### Testing

- Implemented integration tests for API endpoints
- Implemented unit tests for directory service
- Implemented error handling tests
