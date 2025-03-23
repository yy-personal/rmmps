# Recipe Management Backend

A robust Spring Boot backend for the Recipe Management and Meal Planning System that provides REST APIs for managing recipes, meal plans, shopping lists, and user authentication.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Recipe Management**: CRUD operations for recipes with ingredient management
- **Meal Planning**: Create and manage meal plans with recipe assignments
- **Ingredient Management**: Track and organize recipe ingredients
- **Meal Type Categories**: Organize recipes by meal types
- **RESTful API**: Well-documented API endpoints with proper HTTP methods

## Technologies Used

- **Java 17**: Core programming language
- **Spring Boot 3**: Application framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Data persistence
- **Hibernate**: ORM for database operations
- **JWT**: JSON Web Tokens for stateless authentication
- **MySQL**: Relational database (hosted on Aiven)
- **Swagger/OpenAPI**: API documentation
- **JUnit & Mockito**: Testing frameworks
- **Maven**: Dependency management and build tool

## Project Structure

```
recipe_management_backend/
├── src/
│   ├── main/
│   │   ├── java/com/nus_iss/recipe_management/
│   │   │   ├── config/             # Application configurations
│   │   │   ├── controller/         # REST controllers
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── exception/          # Custom exceptions
│   │   │   ├── model/              # Entity models
│   │   │   ├── repository/         # Data repositories
│   │   │   ├── service/            # Business logic implementations
│   │   │   │   └── impl/           # Service implementations
│   │   │   ├── util/               # Utility classes
│   │   │   └── RecipeManagementApplication.java # Main application class
│   │   └── resources/
│   │       ├── application.properties # Application configuration
│   │       └── db_scripts/            # Database scripts
│   └── test/                          # Test classes
├── .mvn/                              # Maven wrapper
├── mvnw                               # Maven wrapper script (Unix)
├── mvnw.cmd                           # Maven wrapper script (Windows)
└── pom.xml                            # Project dependencies
```

## Getting Started

### Prerequisites

- JDK 17 or later
- Maven
- MySQL Database

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

### Building the Project

```bash
# Using Maven
mvn clean install

# Using Maven Wrapper
./mvnw clean install
```

### Running the Application

```bash
# Using Maven
mvn spring-boot:run

# Using Maven Wrapper
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## Database Configuration

The application is configured to use MySQL. The connection details are specified in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://mysql-rmmps-recipe-management-and-meal-planning-system.f.aivencloud.com:27809/RecipeManagement
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

## Design Patterns

The application implements several design patterns:

1. **Observer Pattern**: For the notification system where users can subscribe to recipe-related updates
2. **Factory Pattern**: For recipe creation with different types
3. **Builder Pattern**: For constructing complex recipe objects

## API Documentation

API documentation is available through Swagger UI at:

```
http://localhost:8080/swagger-ui.html
```

## API Endpoints Reference

### Authentication API

#### Register User

```
POST /api/auth/register
```

Request Body:
```json
{
  "email": "user@example.com",
  "passwordHash": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

#### Login

```
POST /api/auth/login
```

Request Body:
```json
{
  "email": "user@example.com",
  "passwordHash": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

#### Refresh Token

```
POST /api/auth/refresh
```

Headers:
```
Authorization: Bearer <refresh_token>
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Recipe API

#### Create Recipe

```
POST /api/recipes
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "title": "Spaghetti Carbonara",
  "preparationTime": 15,
  "cookingTime": 20,
  "difficultyLevel": "MEDIUM",
  "servings": 4,
  "steps": "1. Boil pasta\n2. Fry bacon\n3. Mix eggs and cheese\n4. Combine all ingredients",
  "mealTypeIds": [2, 3],
  "ingredients": [
    {
      "name": "Spaghetti",
      "quantity": "200g"
    },
    {
      "name": "Eggs",
      "quantity": "2 large"
    },
    {
      "name": "Bacon",
      "quantity": "150g"
    }
  ]
}
```

Response: Recipe object

#### Get All Recipes

```
GET /api/recipes
```

Response: Array of Recipe objects

#### Get Recipe by ID

```
GET /api/recipes/{id}
```

Response: Recipe object

#### Update Recipe

```
PUT /api/recipes/{id}
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body: Same as Create Recipe

Response: Updated Recipe object

#### Delete Recipe

```
DELETE /api/recipes/{id}
```

Headers:
```
Authorization: Bearer <access_token>
```

#### Get Recipe Ingredients

```
GET /api/recipes/{id}/ingredients
```

Response: Array of ingredient objects

#### Update Recipe Ingredients

```
PUT /api/recipes/{id}/ingredients
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
[
  {
    "name": "Spaghetti",
    "quantity": "250g"
  },
  {
    "name": "Eggs",
    "quantity": "3 large"
  }
]
```

Response: Updated Recipe object

### Meal Types API

#### Get All Meal Types

```
GET /api/mealtypes
```

Response: Array of MealType objects

#### Get Meal Type by ID

```
GET /api/mealtypes/{id}
```

Response: MealType object

#### Create Meal Type

```
POST /api/mealtypes
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "name": "Brunch"
}
```

Response: MealType object

#### Delete Meal Type

```
DELETE /api/mealtypes/{id}
```

Headers:
```
Authorization: Bearer <access_token>
```

### Meal Plan API

#### Create Meal Plan

```
POST /api/mealPlans/create
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "title": "Weekly Healthy Meal Plan",
  "startDate": "2025-03-01T08:00:00",
  "endDate": "2025-03-07T20:00:00",
  "frequency": "DAILY",
  "mealsPerDay": 3,
  "user": {
    "userId": 1
  }
}
```

Response: MealPlan object

#### Add Recipe to Meal Plan

```
POST /api/mealPlans/add-recipe
```

Headers:
```
Authorization: Bearer <access_token>
```

Parameters:
```
mealPlanId: 1
recipeId: 2
```

Response: MealPlanRecipeMapping object

#### Get All Meal Plans

```
GET /api/mealPlans
```

Response: Array of MealPlan objects

#### Get Meal Plan by ID

```
GET /api/mealPlans/{id}
```

Response: MealPlan object

#### Update Meal Plan

```
PUT /api/mealPlans/{id}
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body: Same as Create Meal Plan

Response: Updated MealPlan object

#### Delete Meal Plan

```
DELETE /api/mealPlans/{id}
```

Headers:
```
Authorization: Bearer <access_token>
```

#### Remove Recipe from Meal Plan

```
DELETE /api/mealPlans
```

Headers:
```
Authorization: Bearer <access_token>
```

Parameters:
```
mealPlanId: 1
recipeId: 2
```

### Ingredients API

#### Get All Ingredients

```
GET /api/ingredients
```

Response: Array of Ingredient objects

#### Get Ingredient by ID

```
GET /api/ingredients/{id}
```

Response: Ingredient object

#### Create Ingredient

```
POST /api/ingredients
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "name": "Olive Oil"
}
```

Response: Ingredient object

#### Delete Ingredient

```
DELETE /api/ingredients/{id}
```

Headers:
```
Authorization: Bearer <access_token>
```

### Users API

#### Create User

```
POST /api/users
```

Request Body:
```json
{
  "email": "newuser@example.com",
  "passwordHash": "password123"
}
```

Response: User object

#### Get All Users

```
GET /api/users
```

Response: Array of User objects

#### Get User by ID

```
GET /api/users/{id}
```

Response: User object

#### Delete User

```
DELETE /api/users/{id}
```

## Data Models

### User

```json
{
  "userId": 1,
  "email": "user@example.com",
  "passwordHash": "$2a$10$...",
  "createdAt": "2025-02-13T14:30:00"
}
```

### Recipe

```json
{
  "recipeId": 1,
  "title": "Spaghetti Carbonara",
  "user": {
    "userId": 1,
    "email": "user@example.com"
  },
  "preparationTime": 15,
  "cookingTime": 20,
  "difficultyLevel": "MEDIUM",
  "servings": 4,
  "steps": "1. Boil pasta\n2. Fry bacon\n3. Mix eggs and cheese\n4. Combine all ingredients",
  "createdAt": "2025-02-13T16:12:00.097923",
  "mealTypes": [
    {
      "mealTypeId": 2,
      "name": "Lunch"
    },
    {
      "mealTypeId": 3,
      "name": "Dinner"
    }
  ]
}
```

### MealPlan

```json
{
  "mealPlanId": 1,
  "user": {
    "userId": 1,
    "email": "user@example.com"
  },
  "title": "Weekly Healthy Meal Plan",
  "startDate": "2025-03-01T08:00:00",
  "endDate": "2025-03-07T20:00:00",
  "frequency": "DAILY",
  "mealsPerDay": 3
}
```

### MealType

```json
{
  "mealTypeId": 1,
  "name": "Breakfast"
}
```

### Ingredient

```json
{
  "ingredientId": 1,
  "name": "Spaghetti"
}
```

## Authentication Flow

The authentication system uses JWT tokens:

1. **Registration/Login**: User registers or logs in to receive an access token and refresh token
2. **API Requests**: The access token is included in the `Authorization` header with the `Bearer` prefix
3. **Token Expiration**: When the access token expires (15 minutes), the client uses the refresh token to get a new access token
4. **Refresh**: The refresh token has a longer lifespan (7 days) and can be used to generate new access tokens

## Security Implementation

The security configuration is in `com.nus_iss.recipe_management.config.SecurityConfig`:

- JWT-based authentication
- Stateless session management
- CORS configured to allow requests from any origin
- Specific endpoints are protected with role-based access control

## Testing

Run tests with:

```bash
# Using Maven
mvn test

# Using Maven Wrapper
./mvnw test
```

The test suite includes:
- Unit tests for services
- Integration tests for repositories
- Controller tests for API endpoints

## Error Handling

The application includes a global exception handler that catches and processes exceptions:

- `RecipeNotFoundException`: When a recipe is not found
- `MealPlanNotFoundException`: When a meal plan is not found
- `RecipeAlreadyInMealPlanException`: When trying to add a recipe that's already in a meal plan
- `AccessDeniedException`: When a user attempts to access a resource they don't own

## Database Schema

The database schema includes the following tables:

- `users`: User accounts
- `recipes`: Recipe information
- `meal_types`: Types of meals (Breakfast, Lunch, etc.)
- `recipe_meal_type_mapping`: Mapping between recipes and meal types
- `ingredients`: Ingredient information
- `recipe_ingredients`: Mapping between recipes and ingredients with quantities
- `meal_plans`: Meal plan information
- `meal_plan_recipe_mapping`: Mapping between meal plans and recipes
- `dietary_restrictions`: Dietary restriction information
- `recipe_dietary_restriction_mapping`: Mapping between recipes and dietary restrictions

For a complete SQL schema, see `recipe_management_backend/src/main/resources/db_scripts/recipe_management_system_setup.sql`

## Troubleshooting

### Common Issues

1. **Database Connection Problems**:
   - Verify database credentials in `.env`
   - Confirm database server is running

2. **JWT Token Issues**:
   - Check token expiration times in `JwtUtil.java`
   - Ensure correct usage of access vs. refresh tokens

3. **Permission Errors**:
   - Confirm user has appropriate permissions for the resource
   - Check if JWT token is included in request headers
