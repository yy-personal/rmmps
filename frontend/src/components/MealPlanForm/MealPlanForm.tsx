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
import Autocomplete from "@mui/material/Autocomplete";

import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "hooks/http-hook";

// Define interfaces for meal types and ingredients
interface MealType {
	mealTypeId: number;
	name: string;
}

interface Ingredient {
	ingredientId?: number;
	name: string;
	quantity: string;
}

interface IngredientOption {
	ingredientId: number;
	name: string;
}

function MealPlanForm() {
	const auth = useContext(AuthContext);
	const navigate = useNavigate();
	const [mealPlanFormState, setMealPlanFormState] = useState({
		title: "",
		description: "",
		difficultyLevel: "",
		preparationTime: "",
		cookingTime: "",
		servings: "",
		steps: "",
	});

	// State for meal types and ingredients
	const [availableMealTypes, setAvailableMealTypes] = useState<MealType[]>(
		[]
	);
	const [selectedMealTypes, setSelectedMealTypes] = useState<number[]>([]);
	const [ingredients, setIngredients] = useState<Ingredient[]>([
		{ name: "", quantity: "" },
	]);
	const [availableIngredients, setAvailableIngredients] = useState<
		IngredientOption[]
	>([]);
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

	// Fetch available ingredients from API
	useEffect(() => {
		const fetchIngredients = async () => {
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/ingredients`
				);
				setAvailableIngredients(responseData);
			} catch (err) {
				console.log(err);
			}
		};

		fetchIngredients();
	}, [sendRequest]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		setMealPlanFormState({
			...mealPlanFormState,
			// For number inputs, allow empty string (when backspacing) or convert to number
			[name]:
				type === "number" ? (value === "" ? "" : Number(value)) : value,
		});
	};

	const handleDifficultyChange = (event: SelectChangeEvent) => {
		setMealPlanFormState({
			...mealPlanFormState,
			difficultyLevel: event.target.value,
		});
	};

	// Handle meal type selection
	const handleMealTypeChange = (
		event: SelectChangeEvent<typeof selectedMealTypes>
	) => {
		const {
			target: { value },
		} = event;

		// On autofill we get a stringified value
		setSelectedMealTypes(
			typeof value === "string" ? value.split(",").map(Number) : value
		);
	};

	// Handle ingredient name changes with autocomplete
	const handleIngredientNameChange = (
		index: number,
		newValue: string | IngredientOption | null
	) => {
		const updatedIngredients = [...ingredients];

		if (newValue === null) {
			// If cleared, set to empty string
			updatedIngredients[index] = {
				...updatedIngredients[index],
				name: "",
				ingredientId: undefined,
			};
		} else if (typeof newValue === "string") {
			// If just string input (custom value)
			updatedIngredients[index] = {
				...updatedIngredients[index],
				name: newValue,
				ingredientId: undefined,
			};
		} else {
			// If selected from dropdown
			updatedIngredients[index] = {
				...updatedIngredients[index],
				name: newValue.name,
				ingredientId: newValue.ingredientId,
			};
		}

		setIngredients(updatedIngredients);
	};

	// Handle ingredient quantity changes
	const handleIngredientQuantityChange = (index: number, value: string) => {
		const updatedIngredients = [...ingredients];
		updatedIngredients[index] = {
			...updatedIngredients[index],
			quantity: value,
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
			mealPlanFormState.title.trim() !== "" &&
			mealPlanFormState.difficultyLevel !== "" &&
			(mealPlanFormState.preparationTime === "" ||
				Number(mealPlanFormState.preparationTime) > 0) &&
			(mealPlanFormState.cookingTime === "" ||
				Number(mealPlanFormState.cookingTime) > 0) &&
			(mealPlanFormState.servings === "" ||
				Number(mealPlanFormState.servings) > 0) &&
			mealPlanFormState.steps.trim() !== "" &&
			selectedMealTypes.length > 0 &&
			ingredients.every(
				(ing) => ing.name.trim() !== "" && ing.quantity.trim() !== ""
			)
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
			(ing) => ing.name.trim() !== "" && ing.quantity.trim() !== ""
		);

		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/mealPlans`,
				"POST",
				JSON.stringify({
					title: mealPlanFormState.title,
					preparationTime:
						mealPlanFormState.preparationTime === ""
							? 0
							: Number(mealPlanFormState.preparationTime),
					cookingTime:
						mealPlanFormState.cookingTime === ""
							? 0
							: Number(mealPlanFormState.cookingTime),
					difficultyLevel: mealPlanFormState.difficultyLevel,
					servings:
						mealPlanFormState.servings === ""
							? 0
							: Number(mealPlanFormState.servings),
					steps: mealPlanFormState.steps,
					mealTypeIds: selectedMealTypes,
					ingredients: validIngredients.map((ing) => ({
						ingredientId: ing.ingredientId,
						name: ing.name,
						quantity: ing.quantity,
					})),
				}),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			alert("Successfully created mealPlan!");
			navigate("/mealPlans");
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
				pb: "40px",
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
								color: "#EB5A3C",
							}}
						>
							Create MealPlan
						</Typography>

						{submitAttempted && !validateForm() && (
							<Alert severity="error" sx={{ mb: 2 }}>
								Please fill in all required fields correctly.
							</Alert>
						)}

						{/* Basic MealPlan Information */}
						<TextField
							fullWidth
							label="MealPlan Title"
							name="title"
							value={mealPlanFormState.title}
							onChange={handleChange}
							required
							error={
								submitAttempted &&
								mealPlanFormState.title.trim() === ""
							}
							helperText={
								submitAttempted &&
								mealPlanFormState.title.trim() === ""
									? "Title is required"
									: ""
							}
							sx={{ mb: 2 }}
						/>

						<Grid container spacing={2} sx={{ mb: 2 }}>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="Preparation Time (Minutes)"
									name="preparationTime"
									value={mealPlanFormState.preparationTime}
									onChange={handleChange}
									required
									type="number"
									error={
										submitAttempted &&
										mealPlanFormState.preparationTime !==
											"" &&
										Number(
											mealPlanFormState.preparationTime
										) <= 0
									}
									helperText={
										submitAttempted &&
										mealPlanFormState.preparationTime !==
											"" &&
										Number(
											mealPlanFormState.preparationTime
										) <= 0
											? "Enter a valid time"
											: ""
									}
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
									value={mealPlanFormState.cookingTime}
									onChange={handleChange}
									required
									type="number"
									error={
										submitAttempted &&
										mealPlanFormState.cookingTime !== "" &&
										Number(mealPlanFormState.cookingTime) <= 0
									}
									helperText={
										submitAttempted &&
										mealPlanFormState.cookingTime !== "" &&
										Number(mealPlanFormState.cookingTime) <= 0
											? "Enter a valid time"
											: ""
									}
									InputProps={{
										inputProps: { min: 1, max: 720 },
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<FormControl
									fullWidth
									required
									error={
										submitAttempted &&
										mealPlanFormState.difficultyLevel === ""
									}
								>
									<InputLabel id="difficultyLabel">
										Difficulty Level
									</InputLabel>
									<Select
										labelId="difficultyLabel"
										value={mealPlanFormState.difficultyLevel}
										label="Difficulty Level"
										onChange={handleDifficultyChange}
									>
										<MenuItem value={"EASY"}>Easy</MenuItem>
										<MenuItem value={"MEDIUM"}>
											Medium
										</MenuItem>
										<MenuItem value={"HARD"}>Hard</MenuItem>
									</Select>
									{submitAttempted &&
										mealPlanFormState.difficultyLevel ===
											"" && (
											<Typography
												variant="caption"
												color="error"
											>
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
									value={mealPlanFormState.servings}
									onChange={handleChange}
									required
									type="number"
									error={
										submitAttempted &&
										mealPlanFormState.servings !== "" &&
										Number(mealPlanFormState.servings) <= 0
									}
									helperText={
										submitAttempted &&
										mealPlanFormState.servings !== "" &&
										Number(mealPlanFormState.servings) <= 0
											? "Enter a valid number"
											: ""
									}
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
							error={
								submitAttempted &&
								selectedMealTypes.length === 0
							}
						>
							<InputLabel id="meal-type-label">
								Meal Types
							</InputLabel>
							<Select
								labelId="meal-type-label"
								multiple
								value={selectedMealTypes}
								onChange={handleMealTypeChange}
								input={<OutlinedInput label="Meal Types" />}
								renderValue={(selected) => (
									<Box
										sx={{
											display: "flex",
											flexWrap: "wrap",
											gap: 0.5,
										}}
									>
										{selected.map((value) => {
											const mealType =
												availableMealTypes.find(
													(mt) =>
														mt.mealTypeId === value
												);
											return mealType ? (
												<Chip
													key={value}
													label={mealType.name}
													size="small"
												/>
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
									<MenuItem
										key={mealType.mealTypeId}
										value={mealType.mealTypeId}
									>
										<Checkbox
											checked={
												selectedMealTypes.indexOf(
													mealType.mealTypeId
												) > -1
											}
										/>
										<ListItemText primary={mealType.name} />
									</MenuItem>
								))}
							</Select>
							{submitAttempted &&
								selectedMealTypes.length === 0 && (
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
								<Grid
									container
									spacing={2}
									key={index}
									sx={{ mb: 1 }}
								>
									<Grid item xs={12} sm={5}>
										<Autocomplete
											id={`ingredient-name-${index}`}
											freeSolo
											options={availableIngredients}
											getOptionLabel={(option) =>
												typeof option === "string"
													? option
													: option.name
											}
											isOptionEqualToValue={(
												option,
												value
											) =>
												option.ingredientId ===
												value.ingredientId
											}
											value={
												ingredient.ingredientId
													? availableIngredients.find(
															(i) =>
																i.ingredientId ===
																ingredient.ingredientId
													  ) || null
													: ingredient.name
											}
											onChange={(_, newValue) =>
												handleIngredientNameChange(
													index,
													newValue
												)
											}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Ingredient Name"
													required
													error={
														submitAttempted &&
														ingredient.name.trim() ===
															""
													}
													helperText={
														submitAttempted &&
														ingredient.name.trim() ===
															""
															? "Required"
															: ""
													}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12} sm={5}>
										<TextField
											fullWidth
											label="Quantity (e.g., 2 cups, 200g)"
											value={ingredient.quantity}
											onChange={(e) =>
												handleIngredientQuantityChange(
													index,
													e.target.value
												)
											}
											required
											error={
												submitAttempted &&
												ingredient.quantity.trim() ===
													""
											}
											helperText={
												submitAttempted &&
												ingredient.quantity.trim() ===
													""
													? "Required"
													: ""
											}
										/>
									</Grid>
									<Grid
										item
										xs={12}
										sm={2}
										sx={{
											display: "flex",
											alignItems: "center",
										}}
									>
										<IconButton
											onClick={() =>
												handleRemoveIngredient(index)
											}
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

						{/* MealPlan Steps */}
						<TextField
							required
							fullWidth
							id="outlined-multiline-static"
							label="Steps"
							name="steps"
							value={mealPlanFormState.steps}
							onChange={handleChange}
							multiline
							rows={8}
							sx={{ mb: 2 }}
							error={
								submitAttempted &&
								mealPlanFormState.steps.trim() === ""
							}
							helperText={
								submitAttempted &&
								mealPlanFormState.steps.trim() === ""
									? "MealPlan steps are required"
									: ""
							}
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
							{isLoading ? (
								<CircularProgress size={24} />
							) : (
								"Create MealPlan"
							)}
						</Button>
					</CardActions>
				</Box>
			</Card>
		</Box>
	);
}

export default MealPlanForm;
