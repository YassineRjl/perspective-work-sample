# Backend Engineer Work Sample

This project skeleton contains a basic Express setup one endpoint to create a user and one endpoint to fetch all users, as well as a basic empty unit test.

## Goal

1. Adjust POST /users that it accepts a user and stores it in a database.
    - The user should have a unique id, a name, a unique email address and a creation date
2. Adjust GET /users that it returns (all) users from the database.
    - This endpoint should be able to receive a query parameter `created` which sorts users by creation date ascending or descending.

## Added Features

-   User authentication with JWT tokens
-   Session management for user login and logout
-   Only 1 authenticated device allowed per user (to simulate some real-world scenario)

## Features

-   User creation and retrieval endpoints
-   User authentication with JWT tokens
-   Session management for user login and logout
-   Input validation using express-validator
-   Database integration with Prisma ORM
-   Unit tests using Jest
-   Integration tests for API endpoints

## Scripts

-   `yarn start`: Starts the server
-   `yarn test`: Executes the tests
-   `yarn prisma:init`: Generates Prisma client
-   `yarn prisma:migrate`: Runs Prisma database migrations

## Endpoints

### User Endpoints

-   `POST /users`: Create a new user

    -   Request body:
        ```json
        {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
        ```
    -   Response: Created user object (password excluded)
    -   Status codes:
        -   201: User created successfully
        -   409: User already exists
        -   422: Validation error

-   `GET /users`: Retrieve users sorted by creation date (ascending or descending)
    -   Query parameters:
        -   `created`: Sorting order ("asc" or "desc")
    -   Response: Array of user objects (password excluded)
    -   Status codes:
        -   200: Users retrieved successfully
        -   401: Unauthorized (missing or invalid token)
        -   422: Validation error

### Authentication Endpoints

-   `POST /signin`: User login

    -   Request body:
        ```json
        {
            "email": "john@example.com",
            "password": "password123"
        }
        ```
    -   Response: JWT token
    -   Status codes:
        -   200: Login successful
        -   400: Invalid username or password
        -   409: Active session already exists

-   `DELETE /logout`: User logout (terminates user active session)
    -   Headers:
        -   `Authorization: Bearer <token>`
    -   Response: Success message
    -   Status codes:
        -   200: Logout successful
        -   401: Unauthorized (missing or invalid token)
        -   403: User already logged out

## Authentication

Some endpoints require authentication using JWT tokens. To access them, please include the token in the `Authorization` header as follows:

```
Authorization: Bearer <token>
```

Obtain the token by making a POST request to the `/signin` endpoint.

## Error Handling and Data Validation

We use express-validator middleware for input validation. If a request fails validation, a 422 status code is returned along with an array of validation errors.

Error handling is implemented using try-catch blocks in the route handlers. If an error occurs, a 500 status code is returned with an error message.

## Technologies Used

-   Node.js
-   Express.js
-   TypeScript
-   Prisma ORM
-   PostgreSQL
-   JSON Web Tokens (JWT)
-   Jest
-   Supertest

## Project Structure

-   `src/`: Contains the main source code
    -   `controllers/`: Contains the route handler functions
    -   `middlewares/`: Contains custom middleware functions
    -   `services/`: Contains business logic and database operations
    -   `utils/`: Contains utility functions
    -   `index.ts`: Entry point of the application
-   `test/`: Contains test files
    -   `unit/`: Contains unit tests for controllers, middlewares, and services
    -   `integration/`: Contains integration tests for API endpoints
-   `prisma/`: Contains Prisma schema and migration files

## Getting Started

1. Install dependencies: `yarn`
2. Set up the database connection in the `.env` file
3. Run database migrations: `yarn prisma:migrate`
4. Start the server: `yarn start`
5. Run tests: `yarn test`
