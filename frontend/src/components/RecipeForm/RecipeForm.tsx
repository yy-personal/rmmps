import { useContext, useState, useEffect } from "react";
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
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "hooks/http-hook";

// Define interfaces for meal types and ingredients
interface MealType {
  mealTypeId: number;
  name: string;
}

interface Ingredient {
  name: string;
  quantity: string;
}

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

  // State for meal types and ingredients
  const [availableMealTypes, setAvailableMealTypes] = useState<MealType[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<number[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" }
  ]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { isLoading, sendRequest, statusCode, serverError } = useHttpClient();

  // Fetch available meal types from API
  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/mealtypes`
        );
        setAvailableMealTypes(responseData);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMealTypes();
  }, [sendRequest]);

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

  // Handle meal type selection
  const handleMealTypeChange = (event: SelectChangeEvent<typeof selectedMealTypes>) => {
    const {
      target: { value },
    } = event;
    
    // On autofill we get a stringified value
    setSelectedMealTypes(
      typeof value === "string" ? value.split(",").map(Number) : value
    );
  };

  // Handle ingredient changes
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setIngredients(updatedIngredients);
  };

  // Add a new ingredient field
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  // Remove an ingredient field
  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  // Validate the form
  const validateForm = () => {
    return (
      recipeFormState.title.trim() !== "" &&
      recipeFormState.difficultyLevel !== "" &&
      Number(recipeFormState.preparationTime) > 0 &&
      Number(recipeFormState.cookingTime) > 0 &&
      Number(recipeFormState.servings) > 0 &&
      recipeFormState.steps.trim() !== "" &&
      selectedMealTypes.length > 0 &&
      ingredients.every(ing => ing.name.trim() !== "" && ing.quantity.trim() !== "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      return;
    }

    // Filter out empty ingredients
    const validIngredients = ingredients.filter(
      ing => ing.name.trim() !== "" && ing.quantity.trim() !== ""
    );

    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/recipes`,
        "POST",
        JSON.stringify({
          title: recipeFormState.title,
          preparationTime: Number(recipeFormState.preparationTime),
          cookingTime: Number(recipeFormState.cookingTime),
          difficultyLevel: recipeFormState.difficultyLevel,
          servings: Number(recipeFormState.servings),
          steps: recipeFormState.steps,
          mealTypeIds: selectedMealTypes,
          ingredients: validIngredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity
          }))
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        }
      );

      alert("Successfully created recipe!");
      navigate("/recipes");
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
        pt: "20px",
        pb: "40px"
      }}
    >
      <Card
        sx={{
          width: { xs: "100%", sm: "100%", md: "85%", lg: "70%" },
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
                color: "#EB5A3C"
              }}
            >
              Create Recipe
            </Typography>

            {submitAttempted && !validateForm() && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Please fill in all required fields correctly.
              </Alert>
            )}

            {/* Basic Recipe Information */}
            <TextField
              fullWidth
              label="Recipe Title"
              name="title"
              value={recipeFormState.title}
              onChange={handleChange}
              required
              error={submitAttempted && recipeFormState.title.trim() === ""}
              helperText={submitAttempted && recipeFormState.title.trim() === "" ? "Title is required" : ""}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Preparation Time (Minutes)"
                  name="preparationTime"
                  value={recipeFormState.preparationTime}
                  onChange={handleChange}
                  required
                  type="number"
                  error={submitAttempted && (Number(recipeFormState.preparationTime) <= 0 || recipeFormState.preparationTime === "")}
                  helperText={submitAttempted && (Number(recipeFormState.preparationTime) <= 0 || recipeFormState.preparationTime === "") ? "Enter a valid time" : ""}
                  InputProps={{
                    inputProps: { min: 1, max: 240 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Cooking Time (Minutes)"
                  name="cookingTime"
                  value={recipeFormState.cookingTime}
                  onChange={handleChange}
                  required
                  type="number"
                  error={submitAttempted && (Number(recipeFormState.cookingTime) <= 0 || recipeFormState.cookingTime === "")}
                  helperText={submitAttempted && (Number(recipeFormState.cookingTime) <= 0 || recipeFormState.cookingTime === "") ? "Enter a valid time" : ""}
                  InputProps={{
                    inputProps: { min: 1, max: 720 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl 
                  fullWidth 
                  required 
                  error={submitAttempted && recipeFormState.difficultyLevel === ""}
                >
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
                  {submitAttempted && recipeFormState.difficultyLevel === "" && (
                    <Typography variant="caption" color="error">
                      Please select a difficulty level
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Servings"
                  name="servings"
                  value={recipeFormState.servings}
                  onChange={handleChange}
                  required
                  type="number"
                  error={submitAttempted && (Number(recipeFormState.servings) <= 0 || recipeFormState.servings === "")}
                  helperText={submitAttempted && (Number(recipeFormState.servings) <= 0 || recipeFormState.servings === "") ? "Enter a valid number" : ""}
                  InputProps={{
                    inputProps: { min: 1, max: 100 },
                  }}
                />
              </Grid>
            </Grid>

            {/* Meal Type Selection */}
            <FormControl 
              fullWidth 
              sx={{ mb: 3 }}
              required
              error={submitAttempted && selectedMealTypes.length === 0}
            >
              <InputLabel id="meal-type-label">Meal Types</InputLabel>
              <Select
                labelId="meal-type-label"
                multiple
                value={selectedMealTypes}
                onChange={handleMealTypeChange}
                input={<OutlinedInput label="Meal Types" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const mealType = availableMealTypes.find(mt => mt.mealTypeId === value);
                      return mealType ? (
                        <Chip key={value} label={mealType.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                      width: 250,
                    },
                  },
                }}
              >
                {availableMealTypes.map((mealType) => (
                  <MenuItem key={mealType.mealTypeId} value={mealType.mealTypeId}>
                    <Checkbox checked={selectedMealTypes.indexOf(mealType.mealTypeId) > -1} />
                    <ListItemText primary={mealType.name} />
                  </MenuItem>
                ))}
              </Select>
              {submitAttempted && selectedMealTypes.length === 0 && (
                <Typography variant="caption" color="error">
                  Please select at least one meal type
                </Typography>
              )}
            </FormControl>

            {/* Ingredients Section */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: "500",
                textAlign: "left",
                mb: 1,
                color: "#6c757d",
              }}
            >
              Ingredients
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              {ingredients.map((ingredient, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Ingredient Name"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                      required
                      error={submitAttempted && ingredient.name.trim() === ""}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Quantity (e.g., 2 cups, 200g)"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                      required
                      error={submitAttempted && ingredient.quantity.trim() === ""}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={ingredients.length === 1}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  {index < ingredients.length - 1 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                  )}
                </Grid>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddIngredient}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Ingredient
              </Button>
            </Paper>

            {/* Recipe Steps */}
            <TextField
              required
              fullWidth
              id="outlined-multiline-static"
              label="Steps"
              name="steps"
              value={recipeFormState.steps}
              onChange={handleChange}
              multiline
              rows={8}
              sx={{ mb: 2 }}
              error={submitAttempted && recipeFormState.steps.trim() === ""}
              helperText={submitAttempted && recipeFormState.steps.trim() === "" ? "Recipe steps are required" : ""}
              placeholder="1. First step&#10;2. Second step&#10;3. Third step"
            />
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button 
              variant="contained" 
              type="submit" 
              fullWidth
              disabled={isLoading}
              sx={{
                backgroundColor: "#EB5A3C",
                "&:hover": {
                  backgroundColor: "#d23c22",
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Create Recipe"}
            </Button>
          </CardActions>
        </Box>
      </Card>
    </Box>
  );
}

export default RecipeForm;