CREATE DATABASE RecipeManagement;
USE RecipeManagement;

-- User Account
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe
CREATE TABLE recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    preparation_time INT NOT NULL, -- in minutes
    cooking_time INT NOT NULL, -- in minutes
    difficulty_level ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    servings INT NOT NULL,
    steps TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Recipe Category
CREATE TABLE recipe_category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

-- Recipe-Category Mapping
CREATE TABLE recipe_category_mapping (
    recipe_id INT,
    category_id INT,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES recipe_category(category_id) ON DELETE CASCADE
);

-- Ingredient
CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Recipe-Ingredient Mapping
CREATE TABLE recipe_ingredient (
    recipe_id INT,
    ingredient_id INT,
    quantity VARCHAR(100) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE CASCADE
);

-- Meal Plan
CREATE TABLE meal_plan (
    meal_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    meal_frequency ENUM('DAILY', 'WEEKLY') NOT NULL,
    meals_per_day INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Meal Plan-Recipe Mapping
CREATE TABLE meal_plan_recipe (
    meal_plan_id INT,
    recipe_id INT,
    PRIMARY KEY (meal_plan_id, recipe_id),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plan(meal_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id) ON DELETE CASCADE
);

-- Shopping List
CREATE TABLE shopping_list (
    shopping_list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Shopping List Item
CREATE TABLE shopping_list_item (
    shopping_list_id INT,
    ingredient_id INT,
    quantity VARCHAR(100) NOT NULL,
    category ENUM('PRODUCE', 'DAIRY', 'MEAT', 'GRAINS', 'OTHER') NOT NULL,
    purchased BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (shopping_list_id, ingredient_id),
    FOREIGN KEY (shopping_list_id) REFERENCES shopping_list(shopping_list_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE CASCADE
);

-- Meal Reminder
CREATE TABLE meal_reminder (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_plan_id INT NOT NULL,
    reminder_time DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plan(meal_plan_id) ON DELETE CASCADE
);

-- Recipe Search Subscription
CREATE TABLE recipe_search_subscription (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    search_criteria TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Notification
CREATE TABLE notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);
