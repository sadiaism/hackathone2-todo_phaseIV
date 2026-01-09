# Data Model: Todo Backend API

**Feature**: Todo Full-Stack Web Application – Spec 1 (Backend API & Database)
**Date**: 2026-01-08

## Task Entity

### Fields
- **id**: Integer (Primary Key, Auto-generated)
  - Type: `int`
  - Constraints: Primary Key, Auto-increment
  - Description: Unique identifier for each task

- **title**: String (Required)
  - Type: `str`
  - Constraints: Max length 255, Not Null
  - Description: Brief title of the task

- **description**: String (Optional)
  - Type: `str`
  - Constraints: Max length 1000, Nullable
  - Description: Detailed description of the task

- **completed**: Boolean
  - Type: `bool`
  - Constraints: Default False, Not Null
  - Description: Status indicating if the task is completed

- **user_id**: Integer (Foreign Key Reference)
  - Type: `int`
  - Constraints: Not Null, Foreign Key to User
  - Description: Identifier of the user who owns this task

- **created_at**: DateTime
  - Type: `datetime`
  - Constraints: Default current timestamp, Not Null
  - Description: Timestamp when the task was created

- **updated_at**: DateTime
  - Type: `datetime`
  - Constraints: Default current timestamp, Updated on change, Not Null
  - Description: Timestamp when the task was last updated

### Relationships
- **user_id** links to User entity (stubbed for now, to be implemented in future spec)

### Validation Rules
- Title must not exceed 255 characters
- Description must not exceed 1000 characters
- All tasks default to incomplete (completed = False)
- user_id must exist in the User table (when implemented)

### State Transitions
- New task: `completed = False` by default
- Completed task: `completed` can be changed to `True`
- Reopened task: `completed` can be changed back to `False`

## User Entity (Stubbed)

### Fields
- **id**: Integer (Primary Key, Auto-generated)
  - Type: `int`
  - Constraints: Primary Key, Auto-increment
  - Description: Unique identifier for each user
  - Note: Actual user authentication will be implemented in future spec

### Relationships
- Tasks: One user can have multiple tasks (one-to-many relationship)