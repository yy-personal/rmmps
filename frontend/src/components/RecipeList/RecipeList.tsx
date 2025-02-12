import Box from "@mui/material/Box";
import data from "./dummy-recipes.json";
import RecipeCard from "../RecipeCard/RecipeCard";

function RecipeList() {
  const recipes = data.recipes;
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        pt: "10px",
      }}
    >
      {recipes.map((recipe) => {
        return (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            userId={recipe.user}
            preparationTime={recipe.preparationTime}
            cookingTime={recipe.cookingTime}
            difficultyLevel={recipe.difficultyLevel}
            servings={recipe.servings}
            steps={recipe.steps}
          />
        );
      })}
    </Box>
  );
}

export default RecipeList;
