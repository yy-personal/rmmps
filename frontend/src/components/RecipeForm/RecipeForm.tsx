import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [recipeFormState, setRecipeFormState] = useState({
    title: "",
    description: "",
    difficultyLevel: "",
    preparationTime: "",
    cookingTime: "",
    servings: "",
    steps: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const { isLoading, sendRequest, statusCode, serverError } = useHttpClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setRecipeFormState({
      ...recipeFormState,
      // Convert to number if it's a number input
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setRecipeFormState({
      ...recipeFormState,
      difficultyLevel: event.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recipe Submitted:", recipeFormState);

    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/recipes`,
        "POST",
        JSON.stringify({
          title: recipeFormState.title,
          // description: recipeFormState.description,
          user: {
            // TODO: use current authenticated user instead of hard-coding
            userId: 3,
          },
          difficultyLevel: recipeFormState.difficultyLevel,
          preparationTime: recipeFormState.preparationTime,
          cookingTime: recipeFormState.cookingTime,
          servings: recipeFormState.servings,
          steps: recipeFormState.steps,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_ACCESS_TOKEN}`,
        }
      );

      alert("successfully created recipe");
      navigate("/");
    } catch (err) {
      setErrorMessage(err.message);
    }
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
                fontWeight: "600",
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
              value={recipeFormState.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Preparation Time (Minutes)"
              name="preparationTime"
              value={recipeFormState.preparationTime}
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
              value={recipeFormState.cookingTime}
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
                value={recipeFormState.difficultyLevel}
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
              value={recipeFormState.servings}
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
