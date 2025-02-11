# Recipe Management Backend

This is a Spring Boot backend for managing recipes, users, ingredients, and categories. It provides a REST API for creating, retrieving, and managing recipes and related entities.

## Features
- User authentication and management
- Recipe creation, retrieval, and deletion
- Categorization of recipes
- Ingredient tracking
- RESTful API endpoints

## Technologies Used
- Java 17
- Spring Boot 3
- Spring Data JPA
- Hibernate
- Lombok
- MySQL (hosted on Aiven)

## Getting Started

### Prerequisites
- Java 17 or later
- Maven
- MySQL (or a compatible database)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yy-personal/rmmps.git
   cd recipe-management
   ```
2. Configure the database in `.env`:
   ```environment variables
   DB_USERNAME=myuser
   DB_PASSWORD=mypassword
   ```
3. Build the project:
   ```sh
   mvn clean install
   ```
4. Run the application:
   ```sh
   mvn spring-boot:run
   ```

## API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/{id}` - Get a user by ID

### Recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/{id}` - Get a specific recipe
- `DELETE /api/recipes/{id}` - Delete a recipe

### Ingredients
- `POST /api/ingredients` - Add a new ingredient
- `GET /api/ingredients` - Get all ingredients

### Categories
- `POST /api/categories` - Create a category
- `GET /api/categories` - Get all categories

## License
This project is licensed under the MIT License.

