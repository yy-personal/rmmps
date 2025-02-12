import Box from "@mui/material/Box";
import data from "./dummy-recipes.json";
import RecipeCard from "../RecipeCard/RecipeCard";
import { useEffect, useState } from "react";

interface RecipeType {
  id: number;
  title: string;
  description: string;
  userId: number;
  preparationTime: number;
  cookingTime: number;
  difficultyLevel: string;
  servings: number;
  steps: string;
}

function RecipeList() {
  const [recipes, setRecipes] = useState<RecipeType[]>();

  useEffect(() => {
    setRecipes(
      data.recipes.map((currRecipe) => {
        return {
          ...currRecipe,
          userId: currRecipe.user,
        };
      })
    );
  }, []);

  if (!recipes) {
    return <Box></Box>;
  }
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
            userId={recipe.userId}
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
