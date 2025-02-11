import Box from "@mui/material/Box";
import data from "./dummy-recipes.json";
import RecipeCard from "../RecipeCard/RecipeCard";

function RecipeList() {
  const recipes = data.recipes;
  return (
    <Box
      sx={{
        width: { sm: "100%", md: "75%", lg: "50%" },
        pt: "10px",
        border: "1px solid red",
      }}
    >
      {recipes.map((recipe) => {
        return (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            creatorName={recipe.creatorName}
            creatorId={recipe.creatorId}
            ingredients={recipe.ingredients}
            steps={recipe.steps}
          />
        );
      })}
    </Box>
  );
}

export default RecipeList;
