# Directory Tree API Documentation

## Overview

REST API for managing an in-memory directory structure. All endpoints return JSON responses.

## Base Path

```
http://localhost:3000/api/v1/directory
```

## Path Rules

- Must start with forward slash (/)
- Case-sensitive for exact matches (read/write operations)
- Case-insensitive for conflict checking (creating/moving directories)
- Example: `/documents/reports`
- Parent directories are created automatically

## Implementation Notes

- Directory structure is maintained in memory only
- State resets on server restart
- No persistence between restarts
- No file system interaction

## Endpoints

### List Directories

```http
GET /api/v1/directory
```

```bash
curl http://localhost:3000/api/v1/directory
```

#### Success (200)

```json
{
  "structure": "folder1\n  subfolder1\n  subfolder2"
}
```

#### Error (500)

```json
{
  "error": "Failed to retrieve directories"
}
```

### Create Directory

```http
POST /api/v1/directory
```

```bash
curl -X POST http://localhost:3000/api/v1/directory \
  -H "Content-Type: application/json" \
  -d '{"path": "/documents/reports"}'
```

#### Success (201)

```json
{
  "message": "Directory created"
}
```

#### Errors

- `415`: Invalid JSON format
- `400`: Path is required
- `400`: Directory already exists
- `500`: Failed to create directory

### Move Directory

```http
PATCH /api/v1/directory
```

```bash
curl -X PATCH http://localhost:3000/api/v1/directory \
  -H "Content-Type: application/json" \
  -d '{"path": "/source/path", "destPath": "/target/path"}'
```

#### Success (200)

```json
{
  "message": "Directory updated"
}
```

#### Errors

- `415`: Invalid JSON format
- `400`: Both path and destination path are required
- `404`: Cannot move directory - path does not exist
- `500`: Failed to update directory

### Delete Directory

```http
DELETE /api/v1/directory?path=/path/to/delete
```

```bash
curl -X DELETE "http://localhost:3000/api/v1/directory?path=/documents/reports"
```

#### Success (200)

```json
{
  "message": "Directory removed"
}
```

#### Errors

- `400`: Path is required
- `404`: Cannot delete directory - path does not exist
- `500`: Failed to remove directory

## Error Response Format

```json
{
  "error": "Error message"
}
```

## Requirements

- POST and PATCH endpoints require `Content-Type: application/json` header as they send JSON request bodies
- - The API runs on port 3000 by default when using Next.js development server

## Constraints

- Cannot move a directory into its own subdirectory
- Cannot create or move to a path where a directory exists with the same name (case-insensitive)
- Source and destination paths must be valid for move operations
