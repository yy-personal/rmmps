import Box from "@mui/material/Box";

interface RecipeStep {
  text: string;
  image: string | null;
}
interface RecipeType {
  id: number;
  title: string;
  creatorName: string;
  creatorId: number;
  ingredients: string;
  steps: RecipeStep[];
}

function Recipe(props: RecipeType) {
  return <Box></Box>;
}

export default Recipe;
