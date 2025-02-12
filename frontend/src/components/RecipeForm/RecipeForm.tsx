import { useState } from "react";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useHttpClient } from "hooks/http-hook";

function RecipeForm() {
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    difficulty: "",
    preparationTime: 1,
    cookingTime: 1,
    servings: 1,
    steps: "",
  });

  const { isLoading, sendRequest } = useHttpClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setRecipe({
      ...recipe,
      [name]: type === "number" ? Number(value) : value, // Convert to number if it's a number input
    });
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setRecipe({
      ...recipe,
      difficulty: event.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("test");
    console.log("Recipe Submitted:", recipe);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        pt: "10px",
      }}
    >
      <Card
        sx={{
          width: { xs: "100%", sm: "100%", md: "75%", lg: "50%" },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <CardContent>
            <Typography
              sx={{
                fontSize: "1.7rem",
                fontWeight: "bold",
                textAlign: "left",
                mb: "25px",
              }}
            >
              Create Recipe
            </Typography>
            <TextField
              fullWidth
              label="Recipe Title"
              name="title"
              value={recipe.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Preparation Time (Minutes)"
              name="preparationTime"
              value={recipe.preparationTime}
              onChange={handleChange}
              required
              type="number"
              sx={{ mb: 2 }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 240,
                },
              }}
            />
            <TextField
              fullWidth
              label="Cooking Time (Minutes)"
              name="cookingTime"
              value={recipe.cookingTime}
              onChange={handleChange}
              required
              type="number"
              sx={{ mb: 2 }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 720,
                },
              }}
            />
            <FormControl fullWidth required sx={{ mb: 2, textAlign: "left" }}>
              <InputLabel id="difficultyLabel">Difficulty Level</InputLabel>
              <Select
                labelId="difficultyLabel"
                // id="demo-simple-select"
                value={recipe.difficulty}
                label="Difficulty Level"
                onChange={handleDifficultyChange}
              >
                <MenuItem value={"EASY"}>Easy</MenuItem>
                <MenuItem value={"MEDIUM"}>Medium</MenuItem>
                <MenuItem value={"HARD"}>Hard</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Servings"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
              required
              type="number"
              sx={{ mb: 2 }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 100,
                },
              }}
            />

            <TextField
              required
              fullWidth
              id="outlined-multiline-static"
              label="Steps"
              multiline
              rows={8}
              sx={{ mb: 2 }}
            />
          </CardContent>
          <CardActions>
            <Button variant="contained" type="submit" fullWidth>
              Add Recipe
            </Button>
          </CardActions>
        </Box>
      </Card>
    </Box>
  );
}

export default RecipeForm;
