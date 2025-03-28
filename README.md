# Recipe Management and Meal Planning System (RMMPS)

## Project Overview
A comprehensive system for managing recipes, planning meals, and generating shopping lists. This project aims to streamline the meal planning process while providing an intuitive user experience.

## Tools and Technologies

| Category | Technology | Reference Link |
|----------|------------|----------------|
| Project Management | Jira | https://ncs-6ever.atlassian.net/jira/software/projects/RMMPS/boards/1 |
| Version Control | GitHub | https://github.com/yy-personal/rmmps/ |
| Communication | Telegram | - |
| CI/CD | GitHub Actions | https://github.com/yy-personal/rmmps/actions |
| Documentation | GitHub Wiki | https://docs.github.com/wiki |
| API Testing | Swagger | http://localhost:8080/swagger-ui.html |
| Code Quality | ESLint, Prettier | - |

## Technical Stack

### Frontend
- Framework: React 18 with TypeScript
- UI Library: Material-UI 6
- State Management: React Context API
- Routing: React Router v7

### Backend
- Language: Java 17
- Framework: Spring Boot 3 (LTS version)
- Security: Spring Security with JWT authentication
- Database: MySQL (hosted on Aiven)
- API Documentation: OpenAPI (Swagger)

### DevOps
- CI/CD: GitHub Actions with the following hooks:
  - Linting
  - Automated Testing
  - Test Coverage Analysis
  - Vulnerabilities Scanning

## Project Structure
```
project-root/
├── frontend/                 # React TypeScript application
│   ├── public/               # Static files
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts for state management
│   │   ├── hooks/            # Custom React hooks
│   │   └── templates/        # Template components
│   └── package.json          # Frontend dependencies
├── recipe_management_backend/ # Spring Boot application
│   ├── src/                  # Source code
│   │   ├── main/             # Main application code
│   │   │   ├── java/         # Java source files
│   │   │   └── resources/    # Application properties and resources
│   │   └── test/             # Test code
│   ├── pom.xml               # Maven project and dependencies
│   └── README.md             # Backend-specific documentation
├── docs/                     # Project documentation
└── README.md                 # Main project documentation
```

## Core Features

### 1. Recipe Management
- Create, view, update, and delete recipes
- Store recipe details including ingredients, preparation steps, cooking times
- Categorize recipes by meal types
- Track recipe difficulty levels

### 2. Meal Planning
- Create meal plans with specified date ranges
- Assign recipes to meal plans
- Manage meal frequency and portions
- View upcoming meal schedules

### 3. Shopping List Generation
- Create shopping lists based on recipes
- Organize ingredients by category
- Manage quantities
- Mark items as purchased

### 4. User Account Management
- User registration and authentication
- Secure password storage
- JWT-based authorization

### 5. Recipe Search and Discovery
- Browse recommended recipes
- Search for recipes by title, ingredients, or categories
- View detailed recipe information

## Development Setup

### Prerequisites
- Node.js (for frontend development)
- JDK 17
- MySQL
- Git

### Local Development Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/yy-personal/rmmps.git
   cd rmmps
   ```

2. Backend setup:
   ```sh
   cd recipe_management_backend
   
   # Create a .env file with the following variables
   # DB_USERNAME=your_db_username
   # DB_PASSWORD=your_db_password
   
   # Build and run
   mvn clean install
   mvn spring-boot:run
   ```

3. Frontend setup:
   ```sh
   cd frontend
   
   # Create a .env file with the following variables
   # REACT_APP_BACKEND_URL=http://localhost:8080/api
   # REACT_APP_ASSET_URL=http://localhost:8080
   
   # Install dependencies and run
   npm i
   npm start
   ```

## Git Workflow

### Branch Structure
- `main`: Production-ready code
- `development`: Integration branch for development work
- Feature branches:
  - `feature/<feature-name>`: For new features
  - `bugfix/<bug-description>`: For bug fixes
  - `docs/<documentation-description>`: For documentation updates

### Commit Message Format
- Use descriptive commit messages that explain the changes
- Prefix commit messages with the type of change: feat, fix, docs, etc.

## Testing Strategy
- Frontend Testing: Jest, React Testing Library
- Backend Testing: JUnit, Spring Test
- Integration Testing: REST-assured
- Manual Testing: Feature verification

## API Documentation
The backend API is documented using OpenAPI (Swagger). When running the application, you can access the documentation at:
```
http://localhost:8080/swagger-ui.html
```

## Database Schema
The database schema includes tables for users, recipes, meal plans, ingredients, and various mapping tables to establish relationships between entities. For detailed schema information, see the SQL scripts in `recipe_management_backend/src/main/resources/db_scripts/`.

## Design Patterns
The application implements several design patterns:
- Observer Pattern for notification systems
- Factory Pattern for recipe creation
- Builder Pattern for complex recipe construction

For more details on the implementation of these patterns, refer to the project documentation.