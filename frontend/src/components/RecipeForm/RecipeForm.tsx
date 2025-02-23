import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material/Select";

import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "hooks/http-hook";

function RecipeForm() {
  const auth = useContext(AuthContext);
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
          Authorization: `Bearer ${auth.accessToken}`,
        }
      );

      alert("successfully created recipe");
      navigate("/");
    } catch (err) {
      console.log(`Status code: ${statusCode}`);
      console.log(serverError);
    }
  };
  if (!auth.isLoggedIn) {
    return <Box>Unauthorized Access. Please login.</Box>;
  }

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
