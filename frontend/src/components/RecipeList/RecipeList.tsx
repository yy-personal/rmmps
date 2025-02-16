import Box from "@mui/material/Box";
import data from "./dummy-recipes.json";
import RecipeCard from "../RecipeCard/RecipeCard";
import { useEffect, useState } from "react";
import { useHttpClient } from "hooks/http-hook";

interface User {
  userId: number;
  email: string;
}

interface RecipeType {
  recipeId: number;
  title: string;
  description: string;
  user: User;
  preparationTime: number;
  cookingTime: number;
  difficultyLevel: string;
  servings: number;
  steps: string;
}

function RecipeList() {
  const { isLoading, sendRequest } = useHttpClient();
  const [recipes, setRecipes] = useState<RecipeType[]>();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/recipes`
        );

        const responseData = await response.json();

        if (response.ok) {
          setRecipes(responseData);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchRecipes();
  }, [setRecipes, sendRequest]);

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
            key={recipe.recipeId}
            recipeId={recipe.recipeId}
            title={recipe.title}
            description={recipe.description}
            user={recipe.user}
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
