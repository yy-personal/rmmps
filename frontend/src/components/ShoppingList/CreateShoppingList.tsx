import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import { AuthContext } from "../../contexts/auth-context";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ClearIcon from "@mui/icons-material/Clear";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

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

function CreateShoppingList() {
	const auth = useContext(AuthContext);
	const navigate = useNavigate();
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [title, setTitle] = useState("");
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
	const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showValidationError, setShowValidationError] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const isMounted = useRef(true);

	// Ensure we don't update state after component unmounts
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		fetchRecipes();
	}, []);

	useEffect(() => {
		if (recipes.length > 0) {
			filterRecipes();
		}
	}, [searchQuery, recipes]);

	const fetchRecipes = async () => {
		setFetchError(null);
		try {
			// Try a direct fetch approach without using the hook first
			console.log(
				"Fetching recipes from:",
				`${process.env.REACT_APP_BACKEND_URL}/recipes`
			);
			console.log(
				"Auth token available:",
				auth.accessToken ? "Yes" : "No"
			);

			// Attempt direct fetch first for debugging
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/recipes`,
				{
					method: "GET",
					headers: auth.accessToken
						? { Authorization: `Bearer ${auth.accessToken}` }
						: {},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch recipes: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();
			console.log("Recipe response:", data);

			if (isMounted.current) {
				if (Array.isArray(data)) {
					setRecipes(data);
					setFilteredRecipes(data);
				} else {
					console.error("Expected array of recipes but got:", data);
					setFetchError("Invalid response format");
				}
			}
		} catch (err) {
			console.error("Error fetching recipes:", err);

			// If direct fetch failed, try with the hook as fallback
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/recipes`,
					"GET",
					null,
					auth.accessToken
						? { Authorization: `Bearer ${auth.accessToken}` }
						: {}
				);

				if (isMounted.current) {
					if (Array.isArray(responseData)) {
						setRecipes(responseData);
						setFilteredRecipes(responseData);
					} else {
						setFetchError("Invalid response format");
					}
				}
			} catch (fallbackErr) {
				if (isMounted.current) {
					setFetchError(serverError || "Failed to fetch recipes");
				}
			}
		}
	};

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

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleClearSearch = () => {
		setSearchQuery("");
	};

	const handleToggleRecipe = (recipeId: number) => {
		setSelectedRecipes((prevSelected) => {
			if (prevSelected.includes(recipeId)) {
				return prevSelected.filter((id) => id !== recipeId);
			} else {
				return [...prevSelected, recipeId];
			}
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!title.trim() || selectedRecipes.length === 0) {
			setShowValidationError(true);
			return;
		}

		setIsSubmitting(true);

		try {
			console.log("Creating shopping list with:", {
				title,
				recipeIds: selectedRecipes,
			});

			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists`,
				"POST",
				JSON.stringify({
					title: title,
					recipeIds: selectedRecipes,
				}),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			console.log("Shopping list created:", responseData);

			// Navigate to the new shopping list
			navigate(`/shopping/${responseData.id}`);
		} catch (err) {
			console.error("Error creating shopping list:", err);
			setIsSubmitting(false);
		}
	};

	const handleGoBack = () => {
		navigate("/shopping");
	};

	return (
		<Box sx={{ padding: 3, minHeight: "calc(100vh - 70px)" }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
					<ArrowBackIcon />
				</IconButton>
				<Typography
					variant="h4"
					component="h1"
					sx={{ color: "#EB5A3C", fontWeight: "bold" }}
				>
					Create Shopping List
				</Typography>
			</Box>

			<Box component="form" onSubmit={handleSubmit}>
				<Paper elevation={2} sx={{ p: 3, mb: 4 }}>
					<Typography variant="h6" gutterBottom>
						Shopping List Details
					</Typography>
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
										onClick={handleClearSearch}
									>
										<ClearIcon />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					{isLoading ? (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								py: 4,
							}}
						>
							<CircularProgress sx={{ color: "#EB5A3C" }} />
						</Box>
					) : fetchError ? (
						<Alert severity="error" sx={{ mb: 2 }}>
							{fetchError}
						</Alert>
					) : recipes.length === 0 ? (
						<Alert severity="info" sx={{ mb: 2 }}>
							No recipes available. Please create some recipes
							first.
						</Alert>
					) : filteredRecipes.length === 0 ? (
						<Alert severity="info">
							No recipes found matching your search. Try modifying
							your search.
						</Alert>
					) : (
						<Grid container spacing={2}>
							{filteredRecipes.map((recipe) => (
								<Grid
									item
									xs={12}
									sm={6}
									md={4}
									key={recipe.recipeId}
								>
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
										}}
									>
										<CardContent sx={{ flexGrow: 1 }}>
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
													{recipe.servings} servings
												</Typography>
											</Box>
										</CardContent>
										<CardActions>
											<Button
												fullWidth
												variant={
													selectedRecipes.includes(
														recipe.recipeId
													)
														? "contained"
														: "outlined"
												}
												onClick={() =>
													handleToggleRecipe(
														recipe.recipeId
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
																: "rgba(235, 90, 60, 0.1)",
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
					)}

					<Box
						sx={{
							mt: 4,
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Button variant="outlined" onClick={handleGoBack}>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							startIcon={<ShoppingCartIcon />}
							disabled={
								isSubmitting || selectedRecipes.length === 0
							}
							sx={{
								backgroundColor: "#EB5A3C",
								"&:hover": { backgroundColor: "#d23c22" },
							}}
						>
							{isSubmitting ? (
								<CircularProgress size={24} color="inherit" />
							) : (
								"Create Shopping List"
							)}
						</Button>
					</Box>
				</Paper>
			</Box>
		</Box>
	);
}

export default CreateShoppingList;
