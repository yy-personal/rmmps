START TRANSACTION;

INSERT INTO `dietary_restrictions` VALUES (7,'Gluten-free'),(6,'Halal'),(5,'Kosher'),(8,'Lactose-free'),(4,'Pescatarian'),(9,'Shellfish-free'),(1,'Vegan'),(2,'Vegetarian');
SAVEPOINT savepoint1;

INSERT INTO `ingredients` VALUES (31,'Bacon'),(34,'Black Pepper'),(12,'Car'),(37,'Chikan'),(20,'duck'),(3,'Eggs'),(7,'Hair'),(36,'Moo'),(6,'Olive Oil'),(2,'Pancetta'),(4,'Parmesan Cheese'),(18,'Pasta'),(16,'Pizza'),(38,'sadasd'),(35,'Salt'),(1,'Spaghetti'),(33,'Test Ingredient');
SAVEPOINT savepoint2;

INSERT INTO `meal_types` VALUES (1,'Breakfast'),(4,'Dessert'),(3,'Dinner'),(7,'Human'),(2,'Lunch'),(5,'Snack'),(6,'Soup');
SAVEPOINT savepoint3;

-- If everything is successful, commit the transaction
-- COMMIT;

-- If unsuccessful, rollback the transaction
-- ROLLBACK;

-- Rollback to a savepoint
-- ROLLBACK TO savepoint1;
