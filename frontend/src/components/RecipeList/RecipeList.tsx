import Box from "@mui/material/Box";
import Header from "components/Header/Header";
import data from "./dummy-recipes.json";

function RecipeList() {
  const recipes = data.recipes;
  return (
    <Box>
      <Header />
    </Box>
  );
}

export default RecipeList;
