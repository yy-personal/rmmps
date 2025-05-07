import { useContext, useEffect, useState, useMemo } from "react";
import { useHttpClient } from "hooks/http-hook";
import { AuthContext } from "../../contexts/auth-context";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import DateRangeIcon from "@mui/icons-material/DateRange";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import Chip from "@mui/material/Chip";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import KitchenIcon from "@mui/icons-material/Kitchen";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Autocomplete from "@mui/material/Autocomplete";
import OutlinedInput from "@mui/material/OutlinedInput";
import TimerIcon from "@mui/icons-material/Timer"; // Added for better visual distinction
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

interface User {
	userId: number;
	email: string;
	passwordHash?: string;
	createdAt?: string;
}

interface MealType {
	mealTypeId: number;
	name: string;
}

interface RecipeIngredient {
	ingredientId?: number;
	name: string;
	quantity: string;
}

interface IngredientOption {
	ingredientId: number;
	name: string;
}

interface RecipeDetailProps {
	recipeId: number | null;
	open: boolean;
	onClose: () => void;
	onRecipeDeleted?: (deletedRecipeId: number) => void;
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
	createdAt: string;
	mealTypes: MealType[];
}

function RecipeDetail({
	recipeId,
	open,
	onClose,
	onRecipeDeleted,
}: RecipeDetailProps) {
	const auth = useContext(AuthContext);
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [recipe, setRecipe] = useState<RecipeType | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [editFormState, setEditFormState] = useState<Partial<RecipeType>>({});
	const [availableMealTypes, setAvailableMealTypes] = useState<MealType[]>(
		[]
	);
	const [selectedMealTypes, setSelectedMealTypes] = useState<number[]>([]);
	const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
	const [loadingIngredients, setLoadingIngredients] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteStatus, setDeleteStatus] = useState<
		"idle" | "deleting" | "success"
	>("idle");
	// For available ingredients dropdown
	const [availableIngredients, setAvailableIngredients] = useState<
		IngredientOption[]
	>([]);
	const [loadingAvailableIngredients, setLoadingAvailableIngredients] =
		useState(false);

	// Fetch available meal types
	useEffect(() => {
		const fetchMealTypes = async () => {
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/mealtypes`
				);
				setAvailableMealTypes(responseData);
			} catch (err) {
				console.log(err.message || serverError);
			}
		};

		fetchMealTypes();
	}, [sendRequest, serverError]);

	// Fetch available ingredients for dropdown
	useEffect(() => {
		const fetchAvailableIngredients = async () => {
			if (!isEditing) return; // Only fetch when editing

			setLoadingAvailableIngredients(true);
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/ingredients`
				);
				setAvailableIngredients(responseData);
			} catch (err) {
				console.log(err.message || serverError);
			} finally {
				setLoadingAvailableIngredients(false);
			}
		};

		if (isEditing) {
			fetchAvailableIngredients();
		}
	}, [isEditing, sendRequest, serverError]);

	// Fetch recipe details
	useEffect(() => {
		const fetchRecipe = async () => {
			if (
				!recipeId ||
				deleteStatus === "deleting" ||
				deleteStatus === "success"
			)
				return;

			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/recipes/${recipeId}`
				);
				setRecipe(responseData);
				// Initialize edit form state with current recipe data
				setEditFormState({
					title: responseData.title,
					preparationTime: responseData.preparationTime,
					cookingTime: responseData.cookingTime,
					difficultyLevel: responseData.difficultyLevel,
					servings: responseData.servings,
					steps: responseData.steps,
					mealTypes: responseData.mealTypes || [],
				});

				// Set selected meal types based on the recipe's meal types
				if (
					responseData.mealTypes &&
					responseData.mealTypes.length > 0
				) {
					setSelectedMealTypes(
						responseData.mealTypes.map(
							(mt: MealType) => mt.mealTypeId
						)
					);
				} else {
					setSelectedMealTypes([]);
				}

				// Fetch ingredients for the recipe
				fetchIngredients(recipeId);
			} catch (err) {
				console.log(err.message || serverError);
			}
		};

		if (open && recipeId) {
			fetchRecipe();
			setIsEditing(false); // Reset editing mode when opening modal
		}
	}, [recipeId, open, sendRequest, serverError]);

	// Fetch ingredients
	const fetchIngredients = async (recipeId: number) => {
		setLoadingIngredients(true);
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes/${recipeId}/ingredients`
			);
			setIngredients(responseData || []);
		} catch (err) {
			console.log(err.message || serverError);
		} finally {
			setLoadingIngredients(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		setEditFormState({
			...editFormState,
			// Convert to number if it's a number input
			[name]: type === "number" ? Number(value) : value,
		});
	};

	const handleDifficultyChange = (event: SelectChangeEvent) => {
		setEditFormState({
			...editFormState,
			difficultyLevel: event.target.value,
		});
	};

	const handleMealTypeChange = (
		event: SelectChangeEvent<typeof selectedMealTypes>
	) => {
		const {
			target: { value },
		} = event;

		// On autofill we get a stringified value.
		const selectedValues =
			typeof value === "string" ? value.split(",").map(Number) : value;
		setSelectedMealTypes(selectedValues);

		// Update the form state with the selected meal types
		const selectedMealTypeObjects = availableMealTypes
			.filter((mt) => selectedValues.includes(mt.mealTypeId))
			.map((mt) => ({ mealTypeId: mt.mealTypeId, name: mt.name }));

		setEditFormState({
			...editFormState,
			mealTypes: selectedMealTypeObjects,
		});
	};

	// Handle ingredient name change with autocomplete
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
		const updatedIngredients = [...ingredients];
		updatedIngredients.splice(index, 1);
		setIngredients(updatedIngredients);
	};

	const handleStartEditing = () => {
		setIsEditing(true);
	};

	const handleCancelEditing = () => {
		if (recipe) {
			// Reset form to current recipe data
			setEditFormState({
				title: recipe.title,
				preparationTime: recipe.preparationTime,
				cookingTime: recipe.cookingTime,
				difficultyLevel: recipe.difficultyLevel,
				servings: recipe.servings,
				steps: recipe.steps,
				mealTypes: recipe.mealTypes || [],
			});

			// Reset selected meal types
			if (recipe.mealTypes && recipe.mealTypes.length > 0) {
				setSelectedMealTypes(
					recipe.mealTypes.map((mt) => mt.mealTypeId)
				);
			} else {
				setSelectedMealTypes([]);
			}

			// Reset ingredients by re-fetching them
			if (recipe.recipeId) {
				fetchIngredients(recipe.recipeId);
			}
		}
		setIsEditing(false);
	};

	const handleSaveEditing = async () => {
		if (!recipe || !recipeId) return;

		setIsSaving(true);
		try {
			// Filter out empty ingredients
			const validIngredients = ingredients.filter(
				(ing) => ing.name.trim() !== "" && ing.quantity.trim() !== ""
			);

			// Prepare data for update
			const updateData = {
				...recipe,
				title: editFormState.title,
				preparationTime: editFormState.preparationTime,
				cookingTime: editFormState.cookingTime,
				difficultyLevel: editFormState.difficultyLevel,
				servings: editFormState.servings,
				steps: editFormState.steps,
				mealTypeIds: selectedMealTypes,
				ingredients: validIngredients,
			};

			// Send update request
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes/${recipeId}`,
				"PUT",
				JSON.stringify(updateData),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			// Update local recipe state with response
			setRecipe(responseData);
			setIsEditing(false);

			// Refresh the ingredients
			fetchIngredients(recipeId);
		} catch (err) {
			console.log(err.message || serverError);
		} finally {
			setIsSaving(false);
		}
	};

	const getDifficultyColor = (level: string) => {
		switch (level) {
			case "EASY":
				return "#4caf50"; // green
			case "MEDIUM":
				return "#ff9800"; // orange
			case "HARD":
				return "#f44336"; // red
			default:
				return "#757575"; // grey
		}
	};

	const handleDeleteRecipe = async () => {
		if (!recipeId) return;

		setDeleteStatus("deleting");
		try {
			await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes/${recipeId}`,
				"DELETE",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			setDeleteStatus("success");
		} catch (err) {
			console.log(err.message || serverError);
			setDeleteStatus("idle");
		}
	};

	const handleCloseAfterSuccess = () => {
		setDeleteModalOpen(false);
		onClose();
		if (onRecipeDeleted && recipeId) {
			onRecipeDeleted(recipeId);
		}
		setDeleteStatus("idle"); // Reset for next time
	};

	const isOwner = useMemo(() => {
		if (!auth.isLoggedIn || !recipe || !recipe.user) return false;

		// Check if the logged-in user is the creator of this recipe
		return recipe.user.email === auth.userEmail;
	}, [auth.isLoggedIn, auth.userEmail, recipe]);

	return (
		<>
			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteModalOpen}
				onClose={() =>
					deleteStatus === "idle" && setDeleteModalOpen(false)
				}
				aria-labelledby="delete-dialog-title"
			>
				{deleteStatus !== "success" ? (
					<>
						<DialogTitle id="delete-dialog-title">
							Delete Recipe
						</DialogTitle>
						<DialogContent>
							<DialogContentText>
								Are you sure you want to delete this recipe?
								This action cannot be undone.
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={() => setDeleteModalOpen(false)}
								disabled={deleteStatus === "deleting"}
							>
								Cancel
							</Button>
							<Button
								onClick={handleDeleteRecipe}
								disabled={deleteStatus === "deleting"}
								color="error"
								startIcon={
									deleteStatus === "deleting" ? (
										<CircularProgress size={20} />
									) : (
										<DeleteIcon />
									)
								}
							>
								{deleteStatus === "deleting"
									? "Deleting..."
									: "Delete"}
							</Button>
						</DialogActions>
					</>
				) : (
					<>
						<DialogTitle>Recipe Deleted</DialogTitle>
						<DialogContent>
							<DialogContentText>
								The recipe was successfully deleted.
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={handleCloseAfterSuccess}
								color="primary"
								autoFocus
							>
								Close
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
			<Modal
				open={open}
				onClose={onClose}
				aria-labelledby="recipe-detail-modal"
			>
				<Paper
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: { xs: "90%", sm: "550px", md: "650px" },
						maxHeight: "85vh",
						borderRadius: 2,
						boxShadow: 24,
						p: 0,
						overflow: "auto",
						bgcolor: "#fafafa",
					}}
				>
					{/* Header with colored background */}
					<Box
						sx={{
							bgcolor: "#EB5A3C",
							color: "white",
							py: 2,
							px: 3,
							position: "relative",
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8,
						}}
					>
						{isEditing ? (
							<TextField
								fullWidth
								name="title"
								value={editFormState.title}
								onChange={handleChange}
								variant="standard"
								autoFocus
								InputProps={{
									style: {
										color: "white",
										fontSize: "1.5rem",
										fontWeight: 500,
									},
								}}
								sx={{ mb: 1 }}
							/>
						) : (
							<Typography
								variant="h5"
								component="h2"
								sx={{ fontWeight: 500, mr: 4 }}
							>
								{recipe?.title}
							</Typography>
						)}

						<IconButton
							aria-label="close"
							onClick={onClose}
							sx={{
								position: "absolute",
								right: 8,
								top: 8,
								color: "white",
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					{isLoading && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								py: 6,
							}}
						>
							<CircularProgress sx={{ color: "#EB5A3C" }} />
						</Box>
					)}

					{!isLoading && !recipe && serverError && (
						<Box sx={{ p: 3 }}>
							<Typography
								color="error"
								align="center"
								variant="h6"
							>
								Error loading recipe
							</Typography>
							<Typography color="text.secondary" align="center">
								{serverError}
							</Typography>
						</Box>
					)}

					{!isLoading && recipe && (
						<>
							<Box sx={{ p: 3 }}>
								{/* Recipe metadata in a grid */}
								<Grid container spacing={2} sx={{ mb: 3 }}>
									{/* Preparation Time with clear label */}
									<Grid item xs={6} sm={3}>
										<Stack
											direction="column"
											alignItems="center"
											spacing={0.5}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
												}}
											>
												<AccessTimeIcon
													color="primary"
													sx={{ mr: 1 }}
												/>
												<Typography
													variant="caption"
													fontWeight="medium"
													color="primary.main"
												>
													Prep Time
												</Typography>
											</Box>
											{isEditing ? (
												<TextField
													name="preparationTime"
													type="number"
													value={
														editFormState.preparationTime
													}
													onChange={handleChange}
													variant="outlined"
													size="small"
													fullWidth
													InputProps={{
														inputProps: { min: 1 },
													}}
												/>
											) : (
												<Typography>
													{recipe.preparationTime} min
												</Typography>
											)}
										</Stack>
									</Grid>

									{/* Cooking Time with clear label */}
									<Grid item xs={6} sm={3}>
										<Stack
											direction="column"
											alignItems="center"
											spacing={0.5}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
												}}
											>
												<TimerIcon
													color="secondary"
													sx={{ mr: 1 }}
												/>
												<Typography
													variant="caption"
													fontWeight="medium"
													color="secondary.main"
												>
													Cook Time
												</Typography>
											</Box>
											{isEditing ? (
												<TextField
													name="cookingTime"
													type="number"
													value={
														editFormState.cookingTime
													}
													onChange={handleChange}
													variant="outlined"
													size="small"
													fullWidth
													InputProps={{
														inputProps: { min: 1 },
													}}
												/>
											) : (
												<Typography>
													{recipe.cookingTime} min
												</Typography>
											)}
										</Stack>
									</Grid>

									<Grid item xs={6} sm={3}>
										<Stack
											direction="row"
											alignItems="center"
											spacing={1}
										>
											<RestaurantIcon
												sx={{ color: "#2e7d32" }}
											/>
											{isEditing ? (
												<TextField
													name="servings"
													label="Servings"
													type="number"
													value={
														editFormState.servings
													}
													onChange={handleChange}
													variant="outlined"
													size="small"
													fullWidth
													InputProps={{
														inputProps: { min: 1 },
													}}
												/>
											) : (
												<Typography
													sx={{
														whiteSpace: "pre-line",
													}}
												>
													{recipe.servings} servings
												</Typography>
											)}
										</Stack>
									</Grid>

									<Grid item xs={6} sm={3}>
										<Stack
											direction="row"
											alignItems="center"
											spacing={1}
										>
											<SignalCellularAltIcon
												sx={{
													color: getDifficultyColor(
														recipe.difficultyLevel
													),
												}}
											/>
											{isEditing ? (
												<FormControl
													fullWidth
													size="small"
												>
													<InputLabel id="difficulty-label">
														Difficulty
													</InputLabel>
													<Select
														labelId="difficulty-label"
														value={
															editFormState.difficultyLevel
														}
														label="Difficulty"
														onChange={
															handleDifficultyChange
														}
													>
														<MenuItem value="EASY">
															Easy
														</MenuItem>
														<MenuItem value="MEDIUM">
															Medium
														</MenuItem>
														<MenuItem value="HARD">
															Hard
														</MenuItem>
													</Select>
												</FormControl>
											) : (
												<Chip
													label={
														recipe.difficultyLevel
													}
													size="small"
													sx={{
														bgcolor:
															getDifficultyColor(
																recipe.difficultyLevel
															),
														color: "white",
														fontWeight: 500,
													}}
												/>
											)}
										</Stack>
									</Grid>
								</Grid>

								{/* Meal Types Section */}
								<Box sx={{ mb: 2 }}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
										sx={{ mb: 1 }}
									>
										<LocalDiningIcon
											sx={{ color: "#9c27b0" }}
										/>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
										>
											Meal Types
										</Typography>
									</Stack>

									{isEditing ? (
										<FormControl fullWidth sx={{ mb: 2 }}>
											<InputLabel id="meal-type-label">
												Meal Types
											</InputLabel>
											<Select
												labelId="meal-type-label"
												id="meal-type-select"
												multiple
												value={selectedMealTypes}
												onChange={handleMealTypeChange}
												input={
													<OutlinedInput label="Meal Types" />
												}
												renderValue={(selected) => (
													<Box
														sx={{
															display: "flex",
															flexWrap: "wrap",
															gap: 0.5,
														}}
													>
														{selected.map(
															(value) => {
																const mealType =
																	availableMealTypes.find(
																		(mt) =>
																			mt.mealTypeId ===
																			value
																	);
																return mealType ? (
																	<Chip
																		key={
																			value
																		}
																		label={
																			mealType.name
																		}
																		size="small"
																	/>
																) : null;
															}
														)}
													</Box>
												)}
											>
												{availableMealTypes.map(
													(mealType) => (
														<MenuItem
															key={
																mealType.mealTypeId
															}
															value={
																mealType.mealTypeId
															}
														>
															<Checkbox
																checked={
																	selectedMealTypes.indexOf(
																		mealType.mealTypeId
																	) > -1
																}
															/>
															<ListItemText
																primary={
																	mealType.name
																}
															/>
														</MenuItem>
													)
												)}
											</Select>
										</FormControl>
									) : (
										<Box
											sx={{
												display: "flex",
												gap: 1,
												flexWrap: "wrap",
											}}
										>
											{recipe.mealTypes &&
											recipe.mealTypes.length > 0 ? (
												recipe.mealTypes.map(
													(mealType) => (
														<Chip
															key={
																mealType.mealTypeId
															}
															label={
																mealType.name
															}
															size="small"
															color="secondary"
														/>
													)
												)
											) : (
												<Typography
													variant="body2"
													color="text.secondary"
												>
													No meal types specified
												</Typography>
											)}
										</Box>
									)}
								</Box>

								{/* Ingredients Section */}
								<Box sx={{ mb: 2 }}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
										sx={{ mb: 1 }}
									>
										<KitchenIcon
											sx={{ color: "#2196f3" }}
										/>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
										>
											Ingredients
										</Typography>
									</Stack>

									{loadingIngredients ? (
										<Box
											sx={{
												display: "flex",
												justifyContent: "center",
												my: 2,
											}}
										>
											<CircularProgress size={24} />
										</Box>
									) : isEditing ? (
										<Paper
											variant="outlined"
											sx={{ p: 2, mb: 2 }}
										>
											{ingredients.map(
												(ingredient, index) => (
													<Grid
														container
														spacing={2}
														key={index}
														sx={{ mb: 1 }}
													>
														<Grid item xs={5}>
															{/* Ingredient dropdown with autocomplete */}
															<Autocomplete
																freeSolo
																options={
																	availableIngredients
																}
																getOptionLabel={(
																	option
																) =>
																	typeof option ===
																	"string"
																		? option
																		: option.name
																}
																isOptionEqualToValue={(
																	option,
																	value
																) => {
																	if (
																		typeof value ===
																		"string"
																	)
																		return false;
																	return (
																		option.ingredientId ===
																		value.ingredientId
																	);
																}}
																value={
																	ingredient.ingredientId
																		? availableIngredients.find(
																				(
																					i
																				) =>
																					i.ingredientId ===
																					ingredient.ingredientId
																		  ) ||
																		  ingredient.name
																		: ingredient.name
																}
																onChange={(
																	_,
																	newValue
																) =>
																	handleIngredientNameChange(
																		index,
																		newValue
																	)
																}
																loading={
																	loadingAvailableIngredients
																}
																renderInput={(
																	params
																) => (
																	<TextField
																		{...params}
																		label="Ingredient Name"
																		size="small"
																		required
																		InputProps={{
																			...params.InputProps,
																			endAdornment:
																				(
																					<>
																						{loadingAvailableIngredients ? (
																							<CircularProgress
																								color="inherit"
																								size={
																									20
																								}
																							/>
																						) : null}
																						{
																							params
																								.InputProps
																								.endAdornment
																						}
																					</>
																				),
																		}}
																	/>
																)}
															/>
														</Grid>
														<Grid item xs={5}>
															<TextField
																fullWidth
																label="Quantity"
																value={
																	ingredient.quantity
																}
																onChange={(e) =>
																	handleIngredientQuantityChange(
																		index,
																		e.target
																			.value
																	)
																}
																size="small"
																required
															/>
														</Grid>
														<Grid
															item
															xs={2}
															sx={{
																display: "flex",
																alignItems:
																	"center",
															}}
														>
															<IconButton
																onClick={() =>
																	handleRemoveIngredient(
																		index
																	)
																}
																color="error"
																size="small"
															>
																<DeleteIcon />
															</IconButton>
														</Grid>
														{index <
															ingredients.length -
																1 && (
															<Grid item xs={12}>
																<Divider
																	sx={{
																		my: 1,
																	}}
																/>
															</Grid>
														)}
													</Grid>
												)
											)}
											<Button
												startIcon={<AddIcon />}
												onClick={handleAddIngredient}
												variant="outlined"
												size="small"
												sx={{ mt: 1 }}
											>
												Add Ingredient
											</Button>
										</Paper>
									) : (
										<Box sx={{ mb: 3 }}>
											{ingredients &&
											ingredients.length > 0 ? (
												<Paper
													variant="outlined"
													sx={{ p: 2 }}
												>
													<Grid container spacing={1}>
														{ingredients.map(
															(
																ingredient,
																index
															) => (
																<Grid
																	item
																	xs={12}
																	key={index}
																>
																	<Stack
																		direction="row"
																		justifyContent="space-between"
																		alignItems="center"
																		sx={{
																			borderBottom:
																				index <
																				ingredients.length -
																					1
																					? "1px solid #eee"
																					: "none",
																			py: 1,
																		}}
																	>
																		<Typography variant="body1">
																			{
																				ingredient.name
																			}
																		</Typography>
																		<Typography
																			variant="body2"
																			color="text.secondary"
																		>
																			{
																				ingredient.quantity
																			}
																		</Typography>
																	</Stack>
																</Grid>
															)
														)}
													</Grid>
												</Paper>
											) : (
												<Typography
													variant="body2"
													color="text.secondary"
												>
													No ingredients specified
												</Typography>
											)}
										</Box>
									)}
								</Box>

								<Divider sx={{ my: 2 }} />

								<Box sx={{ mb: 2 }}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
										sx={{ mb: 1 }}
									>
										<PersonIcon sx={{ color: "#0288d1" }} />
										<Typography
											variant="subtitle1"
											fontWeight="medium"
										>
											Created by {recipe.user.email}
										</Typography>
									</Stack>

									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
									>
										<DateRangeIcon
											sx={{ color: "#0288d1" }}
										/>
										<Typography
											variant="subtitle2"
											color="text.secondary"
										>
											Created on{" "}
											{new Date(
												recipe.createdAt
											).toLocaleDateString()}
										</Typography>
									</Stack>
								</Box>

								<Divider sx={{ my: 2 }} />

								{/* Recipe steps */}
								<Box>
									<Typography
										variant="h6"
										gutterBottom
										sx={{ color: "#EB5A3C" }}
									>
										Preparation Steps
									</Typography>

									{isEditing ? (
										<TextField
											name="steps"
											value={editFormState.steps}
											onChange={handleChange}
											variant="outlined"
											multiline
											rows={6}
											fullWidth
											placeholder="Enter step-by-step instructions"
											error={
												editFormState.steps?.trim() ===
												""
											}
											helperText={
												editFormState.steps?.trim() ===
												""
													? "Preparation steps cannot be empty"
													: ""
											}
											required
										/>
									) : (
										<Typography
											variant="body1"
											sx={{
												whiteSpace: "pre-wrap",
												bgcolor: "white",
												p: 2,
												borderRadius: 1,
												border: "1px solid #e0e0e0",
											}}
										>
											{recipe.steps ||
												"No steps provided for this recipe."}
										</Typography>
									)}
								</Box>

								{/* Action buttons */}
								<Box
									sx={{
										mt: 3,
										display: "flex",
										justifyContent: "flex-end",
										gap: 1,
									}}
								>
									{isOwner && !isEditing && (
										<>
											<Button
												variant="outlined"
												color="primary"
												startIcon={<EditIcon />}
												onClick={handleStartEditing}
											>
												Edit Recipe
											</Button>
											<Button
												variant="outlined"
												color="error"
												startIcon={<DeleteIcon />}
												onClick={() =>
													setDeleteModalOpen(true)
												}
											>
												Delete Recipe
											</Button>
										</>
									)}

									{isEditing && (
										<>
											<Button
												variant="outlined"
												color="inherit"
												onClick={handleCancelEditing}
												disabled={isSaving}
											>
												Cancel
											</Button>
											<Button
												variant="contained"
												color="primary"
												onClick={handleSaveEditing}
												disabled={isSaving}
												sx={{
													bgcolor: "#EB5A3C",
													"&:hover": {
														bgcolor: "#d23c22",
													},
												}}
											>
												{isSaving
													? "Saving..."
													: "Save Changes"}
											</Button>
										</>
									)}

									{!isEditing && (
										<Button
											variant="outlined"
											color="inherit"
											onClick={onClose}
										>
											Close
										</Button>
									)}
								</Box>
							</Box>
						</>
					)}
				</Paper>
			</Modal>
		</>
	);
}

export default RecipeDetail;
