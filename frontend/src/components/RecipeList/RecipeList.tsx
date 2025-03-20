import Box from "@mui/material/Box";
import data from "./dummy-recipes.json";
import RecipeCard from "../RecipeCard/RecipeCard";
import { useEffect, useState } from "react";
import { useHttpClient } from "hooks/http-hook";

interface User {
  userId: number;
  email: string;
}

interface MealType {
	mealTypeId: number;
	name: string;
}

interface RecipeType {
	recipeId: number;
	title: string;
	user: User;
	preparationTime: number;
	cookingTime: number;
	difficultyLevel: string;
	servings: number;
	steps: string;
	mealTypes?: MealType[];
}

function RecipeList() {
  const { sendRequest } = useHttpClient();
  const [recipes, setRecipes] = useState<RecipeType[]>();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/recipes`
        );

        setRecipes(responseData);
      } catch (err) {
        console.log(err.message);
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
				user={recipe.user}
				preparationTime={recipe.preparationTime}
				cookingTime={recipe.cookingTime}
				difficultyLevel={recipe.difficultyLevel}
				servings={recipe.servings}
				steps={recipe.steps}
				mealTypes={recipe.mealTypes}
			/>
		);
      })}
    </Box>
  );
}

export default RecipeList;
