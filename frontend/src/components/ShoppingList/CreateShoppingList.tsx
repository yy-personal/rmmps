import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHttpClient } from "../../hooks/http-hook"; // Adjust path if needed
import { AuthContext } from "../../contexts/auth-context"; // Adjust path if needed

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ClearIcon from "@mui/icons-material/Clear";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import KitchenIcon from "@mui/icons-material/Kitchen";
import CloseIcon from "@mui/icons-material/Close";

// Interfaces
interface Recipe {
	recipeId: number;
	title: string;
	preparationTime: number;
	cookingTime: number;
	difficultyLevel: string;
	servings: number;
	user: {
		userId: number;
		email: string;
	};
}

interface RecipeIngredient {
	ingredientId: number;
	name: string;
	quantity: string;
}

// Component Props
interface CreateShoppingListModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: (newListId: number) => void;
}

// Refactored Component
function CreateShoppingListModal({
	open,
	onClose,
	onSuccess,
}: CreateShoppingListModalProps) {
	const auth = useContext(AuthContext);
	// Removed clearError from destructuring as it's not in the provided hook
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [title, setTitle] = useState("");
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
	const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showValidationError, setShowValidationError] = useState(false);
	// Local error state specifically for submission/validation issues within the modal
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [expandedRecipeIds, setExpandedRecipeIds] = useState<number[]>([]);
	const [recipeIngredients, setRecipeIngredients] = useState<{
		[key: number]: RecipeIngredient[];
	}>({});
	const [loadingIngredients, setLoadingIngredients] = useState<number[]>([]);

	// State Reset Logic
	const resetModalState = useCallback(() => {
		setTitle("");
		setSelectedRecipes([]);
		setSearchQuery("");
		setShowValidationError(false);
		setSubmitError(null); // Clear local submission errors
		// serverError from the hook will be reset automatically on the next sendRequest call in the hook
		setExpandedRecipeIds([]);
		setRecipeIngredients({});
		setLoadingIngredients([]);
		// Keep fetched recipes if desired, or clear them:
		// setRecipes([]);
		// setFilteredRecipes([]);
	}, []); // No dependencies needed here if only setting state

	// Close Handler
	const handleClose = () => {
		resetModalState();
		onClose();
	};

	// Fetch Recipes
	const fetchRecipes = useCallback(async () => {
		if (!auth.isLoggedIn || !open) return;

		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes`,
				"GET",
				null,
				auth.accessToken
					? { Authorization: `Bearer ${auth.accessToken}` }
					: {}
			);

			if (Array.isArray(responseData)) {
				setRecipes(responseData);
				setFilteredRecipes(responseData);
			} else {
				setRecipes([]);
				setFilteredRecipes([]);
			}
		} catch (err) {
			setRecipes([]);
			setFilteredRecipes([]);
		}
	}, [auth.isLoggedIn, auth.accessToken, sendRequest, open]); // Dependencies

	useEffect(() => {
		if (open && auth.isLoggedIn) {
			fetchRecipes();
		}
		if (!open) {
			resetModalState();
		}
	}, [open, auth.isLoggedIn, fetchRecipes, resetModalState]);

	// Filter Recipes
	useEffect(() => {
		filterRecipes();
	}, [searchQuery, recipes]);

	const filterRecipes = () => {
		if (!searchQuery.trim()) {
			setFilteredRecipes(recipes);
			return;
		}
		const filtered = recipes.filter((recipe) =>
			recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
		);
		setFilteredRecipes(filtered);
	};

	// Handlers
	const handleToggleIngredients = async (
		recipeId: number,
		event: React.MouseEvent
	) => {
		event.preventDefault();
		event.stopPropagation();
		// ... (rest of function is unchanged) ...
		if (expandedRecipeIds.includes(recipeId)) {
			setExpandedRecipeIds((prev) =>
				prev.filter((id) => id !== recipeId)
			);
			return;
		}

		setExpandedRecipeIds((prev) => [...prev, recipeId]);

		if (!recipeIngredients[recipeId]) {
			setLoadingIngredients((prev) => [...prev, recipeId]);
			try {
				const response = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/recipes/${recipeId}/ingredients`,
					"GET",
					null,
					auth.accessToken
						? { Authorization: `Bearer ${auth.accessToken}` }
						: {}
				);
				setRecipeIngredients((prev) => ({
					...prev,
					[recipeId]: response,
				}));
			} catch (err) {
				/* Error handled by hook */
			} finally {
				setLoadingIngredients((prev) =>
					prev.filter((id) => id !== recipeId)
				);
			}
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleClearSearch = () => {
		setSearchQuery("");
	};

	const handleToggleRecipe = (recipeId: number, event?: React.MouseEvent) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		// ... (rest of function is unchanged) ...
		setSelectedRecipes((prevSelected) => {
			if (prevSelected.includes(recipeId)) {
				return prevSelected.filter((id) => id !== recipeId);
			} else {
				return [...prevSelected, recipeId];
			}
		});
	};

	// Adjusted Submit Handler
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null); // Clear previous local errors
		// No clearError() call needed here for the hook

		if (!title.trim() || selectedRecipes.length === 0) {
			setShowValidationError(true);
			setSubmitError(
				"Please provide a title and select at least one recipe."
			); // Set specific local error
			return;
		}
		setShowValidationError(false);
		setIsSubmitting(true);

		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists`,
				"POST",
				JSON.stringify({ title: title, recipeIds: selectedRecipes }),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			if (responseData && responseData.id) {
				onSuccess?.(responseData.id);
				handleClose(); // Close modal on success
			} else {
				console.error("Invalid response format:", responseData);
				setSubmitError(
					"Created list but received invalid response format."
				);
			}
		} catch (err: any) {
			// serverError is set by the hook, setSubmitError can show hook error or fallback
			setSubmitError(
				serverError || err.message || "Failed to create shopping list"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render Logic
	if (!open) return null;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
			aria-labelledby="create-shopping-list-dialog-title"
			PaperProps={{
				component: "form",
				onSubmit: handleSubmit,
				id: "create-shopping-list-form",
			}}
		>
			<DialogTitle id="create-shopping-list-dialog-title">
				Create Shopping List
				<IconButton
					aria-label="close"
					onClick={handleClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: (theme) => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				{/* Display hook errors OR local submission errors */}
				{(serverError || submitError) && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{
							submitError ||
								serverError /* Show local error first if it exists */
						}
					</Alert>
				)}

				<TextField
					fullWidth
					label="Shopping List Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					error={showValidationError && !title.trim()}
					helperText={
						showValidationError && !title.trim()
							? "Title is required"
							: ""
					}
					sx={{ mb: 3 }}
					autoFocus
				/>

				<Typography variant="subtitle1" gutterBottom>
					Select Recipes to Include
				</Typography>
				{showValidationError && selectedRecipes.length === 0 && (
					<Alert severity="error" sx={{ mb: 2 }}>
						Please select at least one recipe
					</Alert>
				)}

				<TextField
					fullWidth
					label="Search Recipes"
					value={searchQuery}
					onChange={handleSearchChange}
					sx={{ mb: 2 }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
						endAdornment: searchQuery && (
							<InputAdornment position="end">
								<IconButton
									size="small"
									type="button"
									onClick={handleClearSearch}
								>
									<ClearIcon />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>

				{/* Recipe Loading/Display Logic */}
				{isLoading && !isSubmitting ? ( // Show loading only if not submitting
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							py: 4,
						}}
					>
						<CircularProgress sx={{ color: "#EB5A3C" }} />
					</Box>
				) : recipes.length === 0 && !serverError ? ( // Check for no recipes only if no error loading them
					<Alert severity="info" sx={{ mb: 2 }}>
						No recipes available to add.
					</Alert>
				) : filteredRecipes.length === 0 && searchQuery ? (
					<Alert severity="info">
						No recipes found matching "{searchQuery}".
					</Alert>
				) : (
					// Grid for recipes (Check if serverError occurred during fetch)
					!serverError && (
						<Grid
							container
							spacing={2}
							sx={{ maxHeight: "40vh", overflowY: "auto", pr: 1 }}
						>
							{filteredRecipes.map((recipe) => (
								<Grid item xs={12} sm={6} key={recipe.recipeId}>
									<Card
										sx={{
											border: selectedRecipes.includes(
												recipe.recipeId
											)
												? 2
												: 0,
											borderColor:
												selectedRecipes.includes(
													recipe.recipeId
												)
													? "#EB5A3C"
													: "transparent",
											height: "100%",
											display: "flex",
											flexDirection: "column",
											transition:
												"border-color 0.2s ease-in-out",
										}}
										variant="outlined"
									>
										<CardContent
											sx={{ flexGrow: 1, pb: 1 }}
										>
											{/* Recipe Title and Details */}
											<Box
												onClick={(e) =>
													handleToggleRecipe(
														recipe.recipeId,
														e
													)
												}
												sx={{ cursor: "pointer" }}
											>
												<Typography
													variant="h6"
													component="h2"
													gutterBottom
												>
													{recipe.title}
												</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														mb: 1,
													}}
												>
													<AccessTimeIcon
														fontSize="small"
														sx={{
															mr: 1,
															color: "#666",
														}}
													/>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{recipe.preparationTime +
															recipe.cookingTime}{" "}
														min
													</Typography>
												</Box>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														mb: 1,
													}}
												>
													<RestaurantMenuIcon
														fontSize="small"
														sx={{
															mr: 1,
															color: "#666",
														}}
													/>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{recipe.servings}{" "}
														servings
													</Typography>
												</Box>
											</Box>
											{/* Ingredient Toggle Button */}
											<Box sx={{ mt: 1 }}>
												<Button
													size="small"
													type="button"
													startIcon={
														expandedRecipeIds.includes(
															recipe.recipeId
														) ? (
															<ExpandLessIcon />
														) : (
															<ExpandMoreIcon />
														)
													}
													onClick={(e) =>
														handleToggleIngredients(
															recipe.recipeId,
															e
														)
													}
													sx={{
														color: "#666",
														justifyContent:
															"flex-start",
													}}
													fullWidth
													variant="text"
												>
													{expandedRecipeIds.includes(
														recipe.recipeId
													)
														? "Hide Ingredients"
														: "Show Ingredients"}
												</Button>
											</Box>
										</CardContent>
										{/* Expandable Ingredients Section */}
										<Collapse
											in={expandedRecipeIds.includes(
												recipe.recipeId
											)}
											timeout="auto"
											unmountOnExit
										>
											<Box sx={{ px: 2, pb: 2 }}>
												<Divider sx={{ mb: 1 }} />
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														mb: 1,
													}}
												>
													<KitchenIcon
														fontSize="small"
														sx={{
															mr: 1,
															color: "#666",
														}}
													/>
													<Typography variant="subtitle2">
														Ingredients
													</Typography>
												</Box>
												{loadingIngredients.includes(
													recipe.recipeId
												) ? (
													<Box
														sx={{
															display: "flex",
															justifyContent:
																"center",
															py: 1,
														}}
													>
														<CircularProgress
															size={20}
															sx={{
																color: "#EB5A3C",
															}}
														/>
													</Box>
												) : recipeIngredients[
														recipe.recipeId
												  ]?.length ? (
													<List
														dense
														disablePadding
														sx={{
															maxHeight: 150,
															overflowY: "auto",
														}}
													>
														{recipeIngredients[
															recipe.recipeId
														].map(
															(
																ingredient,
																idx
															) => (
																<ListItem
																	key={idx}
																	disablePadding
																	sx={{
																		py: 0.2,
																	}}
																>
																	<ListItemText
																		primary={
																			ingredient.name
																		}
																		secondary={
																			ingredient.quantity
																		}
																		primaryTypographyProps={{
																			variant:
																				"body2",
																		}}
																		secondaryTypographyProps={{
																			variant:
																				"caption",
																		}}
																	/>
																</ListItem>
															)
														)}
													</List>
												) : (
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ pl: 1 }}
													>
														No ingredients listed.
													</Typography>
												)}
											</Box>
										</Collapse>
										{/* Select Button */}
										<CardActions sx={{ pt: 0 }}>
											<Button
												fullWidth
												type="button"
												variant={
													selectedRecipes.includes(
														recipe.recipeId
													)
														? "contained"
														: "outlined"
												}
												onClick={(e) =>
													handleToggleRecipe(
														recipe.recipeId,
														e
													)
												}
												sx={{
													bgcolor:
														selectedRecipes.includes(
															recipe.recipeId
														)
															? "#EB5A3C"
															: "transparent",
													color: selectedRecipes.includes(
														recipe.recipeId
													)
														? "white"
														: "#EB5A3C",
													borderColor: "#EB5A3C",
													"&:hover": {
														bgcolor:
															selectedRecipes.includes(
																recipe.recipeId
															)
																? "#d23c22"
																: "rgba(235, 90, 60, 0.08)",
														borderColor: "#d23c22",
													},
												}}
											>
												{selectedRecipes.includes(
													recipe.recipeId
												)
													? "Selected"
													: "Select"}
											</Button>
										</CardActions>
									</Card>
								</Grid>
							))}
						</Grid>
					)
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button variant="outlined" onClick={handleClose}>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="contained"
					startIcon={<ShoppingCartIcon />}
					disabled={
						isSubmitting ||
						isLoading ||
						!title.trim() ||
						selectedRecipes.length === 0
					}
					sx={{
						backgroundColor: "#EB5A3C",
						"&:hover": { backgroundColor: "#d23c22" },
						"&:disabled": { backgroundColor: "grey.300" },
					}}
				>
					{isSubmitting ? (
						<CircularProgress size={24} color="inherit" />
					) : (
						"Create Shopping List"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default CreateShoppingListModal; // Exporting as Modal, but filename might be CreateShoppingList.tsx
