CREATE DATABASE RecipeManagement;
USE RecipeManagement;

-- User Accounts
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes
CREATE TABLE Recipes (
    RecipeID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    PreparationTime INT NOT NULL, -- in minutes
    CookingTime INT NOT NULL, -- in minutes
    DifficultyLevel ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    Servings INT NOT NULL,
    Steps TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Recipe Categories
CREATE TABLE RecipeCategories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) UNIQUE NOT NULL
);

-- Recipe-Category Mapping
CREATE TABLE RecipeCategoryMapping (
    RecipeID INT,
    CategoryID INT,
    PRIMARY KEY (RecipeID, CategoryID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES RecipeCategories(CategoryID) ON DELETE CASCADE
);

-- Ingredients
CREATE TABLE Ingredients (
    IngredientID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL
);

-- Recipe-Ingredient Mapping
CREATE TABLE RecipeIngredients (
    RecipeID INT,
    IngredientID INT,
    Quantity VARCHAR(100) NOT NULL,
    PRIMARY KEY (RecipeID, IngredientID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
);

-- Meal Plans
CREATE TABLE MealPlans (
    MealPlanID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    MealFrequency ENUM('Daily', 'Weekly') NOT NULL,
    MealsPerDay INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Meal Plan-Recipe Mapping
CREATE TABLE MealPlanRecipes (
    MealPlanID INT,
    RecipeID INT,
    PRIMARY KEY (MealPlanID, RecipeID),
    FOREIGN KEY (MealPlanID) REFERENCES MealPlans(MealPlanID) ON DELETE CASCADE,
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
);

-- Shopping Lists
CREATE TABLE ShoppingLists (
    ShoppingListID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Shopping List Items
CREATE TABLE ShoppingListItems (
    ShoppingListID INT,
    IngredientID INT,
    Quantity VARCHAR(100) NOT NULL,
    Category ENUM('Produce', 'Dairy', 'Meat', 'Grains', 'Other') NOT NULL,
    Purchased BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ShoppingListID, IngredientID),
    FOREIGN KEY (ShoppingListID) REFERENCES ShoppingLists(ShoppingListID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
);

-- Meal Reminders
CREATE TABLE MealReminders (
    ReminderID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    MealPlanID INT NOT NULL,
    ReminderTime DATETIME NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MealPlanID) REFERENCES MealPlans(MealPlanID) ON DELETE CASCADE
);

-- Recipe Search Subscriptions
CREATE TABLE RecipeSearchSubscriptions (
    SubscriptionID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    SearchCriteria TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);CREATE SCHEMA `rmmps` ;
CREATE DATABASE RecipeManagement;
USE RecipeManagement;

-- User Accounts
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes
CREATE TABLE Recipes (
    RecipeID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    PreparationTime INT NOT NULL, -- in minutes
    CookingTime INT NOT NULL, -- in minutes
    DifficultyLevel ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    Servings INT NOT NULL,
    Steps TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Recipe Categories
CREATE TABLE RecipeCategories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) UNIQUE NOT NULL
);

-- Recipe-Category Mapping
CREATE TABLE RecipeCategoryMapping (
    RecipeID INT,
    CategoryID INT,
    PRIMARY KEY (RecipeID, CategoryID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES RecipeCategories(CategoryID) ON DELETE CASCADE
);

-- Ingredients
CREATE TABLE Ingredients (
    IngredientID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL
);

-- Recipe-Ingredient Mapping
CREATE TABLE RecipeIngredients (
    RecipeID INT,
    IngredientID INT,
    Quantity VARCHAR(100) NOT NULL,
    PRIMARY KEY (RecipeID, IngredientID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
);

-- Meal Plans
CREATE TABLE MealPlans (
    MealPlanID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    MealFrequency ENUM('Daily', 'Weekly') NOT NULL,
    MealsPerDay INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Meal Plan-Recipe Mapping
CREATE TABLE MealPlanRecipes (
    MealPlanID INT,
    RecipeID INT,
    PRIMARY KEY (MealPlanID, RecipeID),
    FOREIGN KEY (MealPlanID) REFERENCES MealPlans(MealPlanID) ON DELETE CASCADE,
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
);

-- Shopping Lists
CREATE TABLE ShoppingLists (
    ShoppingListID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Shopping List Items
CREATE TABLE ShoppingListItems (
    ShoppingListID INT,
    IngredientID INT,
    Quantity VARCHAR(100) NOT NULL,
    Category ENUM('Produce', 'Dairy', 'Meat', 'Grains', 'Other') NOT NULL,
    Purchased BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ShoppingListID, IngredientID),
    FOREIGN KEY (ShoppingListID) REFERENCES ShoppingLists(ShoppingListID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
);

-- Meal Reminders
CREATE TABLE MealReminders (
    ReminderID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    MealPlanID INT NOT NULL,
    ReminderTime DATETIME NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MealPlanID) REFERENCES MealPlans(MealPlanID) ON DELETE CASCADE
);

-- Recipe Search Subscriptions
CREATE TABLE RecipeSearchSubscriptions (
    SubscriptionID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    SearchCriteria TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);