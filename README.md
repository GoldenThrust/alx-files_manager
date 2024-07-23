# ALX Files Manager

## Overview

ALX Files Manager is a file management system built with Node.js, Express, Redis, and MongoDB. It provides functionalities for user authentication, file uploads, retrieval, and management. This project is designed to handle file-related operations efficiently and securely.

## Features

- **User Authentication**: Sign up and log in with hashed passwords.
- **File Upload**: Upload files of various types and sizes.
- **File Retrieval**: Retrieve and list uploaded files.
- **File Management**: Publish and unpublish files.
- **Statistics**: View system status and usage statistics.
- **Caching**: Leverage Redis for caching and session management.
- **Database**: Utilize MongoDB for persistent storage of files and user data.

## Endpoints

### User Endpoints

- `POST /users`: Create a new user.
- `GET /users/me`: Retrieve the authenticated user's information.
- `GET /connect`: Log in a user and return an authentication token.
- `GET /disconnect`: Log out the authenticated user.

### File Endpoints

- `POST /files`: Upload a new file.
- `GET /files/:id`: Retrieve a specific file by ID.
- `GET /files`: List all files for the authenticated user.
- `PUT /files/:id/publish`: Publish a specific file.
- `PUT /files/:id/unpublish`: Unpublish a specific file.

### System Endpoints

- `GET /status`: Get the status of the Redis and MongoDB servers.
- `GET /stats`: Retrieve the number of users and files in the system.

## Installation

### Prerequisites

- Node.js
- Redis
- MongoDB
- Bull

### Steps

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/alx-files_manager.git
    cd alx-files_manager
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start Redis and MongoDB servers.

4. Start the application:
    ```bash
    npm start
    ```

## Usage
### Example Requests

- **User Sign Up**:
    ```bash
    curl -X POST http://localhost:5000/users -d '{"email": "user@example.com", "password": "password123"}' -H "Content-Type: application/json"
    ```

- **File Upload**:
    ```bash
    curl -X POST http://localhost:5000/files -F "file=@/path/to/your/file" -H "X-Token: your-auth-token"
    ```

- **Publish File**:
    ```bash
    curl -X PUT http://localhost:5000/files/:id/publish -H "X-Token: your-auth-token"
    ```

- **Unpublish File**:
    ```bash
    curl -X PUT http://localhost:5000/files/:id/unpublish -H "X-Token: your-auth-token"
    ```
