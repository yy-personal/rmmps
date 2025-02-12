# Recipe Management and Meal Planning System (RMMPS)

## Project Overview
A comprehensive system for managing recipes, planning meals, and generating shopping lists. This project aims to streamline the meal planning process while providing an intuitive user experience.

## Tools and Technologies

| Category | Tool Options | Reference Link |
|----------|--------------|----------------|
| Project Management | Jira | https://ncs-6ever.atlassian.net/jira/software/projects/RMMPS/boards/1 |
| Version Control | GitHub | https://github.com/yy-personal/rmmps/ |
| Communication | Discord | - |
| CI/CD | GitHub Actions | https://github.com/features/actions |
| Documentation | GitHub Wiki | https://docs.github.com/wiki |
| API Testing | Postman | https://www.postman.com |
| Code Quality | ESLint, Prettier | - |

## Technical Stack

### Frontend
- Framework: React with TypeScript
- UI Library: Material-UI

### Backend
- Language: Java 17
- Framework: Spring Boot 3(LTS version)
- Database: MySQL (hosted on AWS)

### DevOps
- CI/CD: GitHub Actions with the following hooks:
  - Linting
  - Automated Testing
  - Test Coverage Analysis
  - Vulnerabilities Scanning
- Future Implementation: Docker containerization for local development

## Project Structure(To Be Updated)
```
project-root/
├── frontend/          # React TypeScript application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/          # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── docs/            # Documentation
└── .github/         # GitHub Actions workflows
```

## Development Setup
[To be updated after environment setup is complete]

### Prerequisites
- Node.js (for frontend development)
- JDK 17
- MySQL
- Git

### Local Development Steps
1. [Repository setup steps]
2. [Environment configuration]
3. [Build and run instructions]

## Git Workflow

### Branch Structure(To Be Updated)
- main (production)
- development
- feature/[feature-name]
- bugfix/[bug-name]

### Commit Message Format
[To be decided - e.g., Conventional Commits]

## Sprint 1 Features (Feb 3 - Feb 14)

### Recipe Management Module

#### 1. Recipe Creation
- Create recipe with following attributes:
  - Recipe title
  - Preparation time
  - Cooking time
  - Difficulty level
  - Servings
  - Ingredients list
  - Steps
  - Categories (cuisine type, meal type, dietary restrictions)
- System generates unique recipe ID

#### 2. Recipe Modification
- Edit existing recipe attributes:
  - Recipe title
  - Preparation time
  - Cooking time
  - Difficulty level
  - Servings
  - Ingredients list
  - Steps
  - Categories
- Owner-only modification access

#### 3. Recipe Deletion
- Owner-only deletion capability
- Confirmation prompt before deletion
- Soft deletion implementation

## Testing Strategy
- Frontend Testing: [Framework to be decided]
- Backend Testing: JUnit, Spring Test
- Integration Testing: [Approach to be decided]
- E2E Testing: [Tools to be decided]

## Deployment Strategy
[To be determined]
- Development Environment: Local setup
- Staging Environment: [Details pending]
- Production Environment: Local

## Documentation Guidelines
[To be developed with team input]

## Contributing Guidelines
[To be developed with team input]
