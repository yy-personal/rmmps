// src/components/ShoppingList/ShoppingListCreate.tsx

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "../../hooks/http-hook";
import { ShoppingListCreateRequest } from "../../types/shopping-list";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";

interface Recipe {
	recipeId: number;
	title: string;
	preparationTime: number;
	cookingTime: number;
	servings: number;
	difficultyLevel: string;
	user: {
		userId: number;
		email: string;
	};
}

function ShoppingListCreate() {
	const navigate = useNavigate();
	const auth = useContext(AuthContext);
	const { isLoading, sendRequest, serverError } = useHttpClient();

	const [title, setTitle] = useState("");
	const [titleError, setTitleError] = useState(false);
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
	const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch recipes
	useEffect(() => {
		const fetchRecipes = async () => {
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/recipes`,
					"GET",
					null,
					auth.isLoggedIn
						? { Authorization: `Bearer ${auth.accessToken}` }
						: undefined
				);
				setRecipes(responseData);
				setFilteredRecipes(responseData);
			} catch (err) {
				console.error(err);
				setError("Failed to load recipes");
			}
		};

		fetchRecipes();
	}, [sendRequest, auth.accessToken, auth.isLoggedIn]);

	// Filter recipes based on search term
	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredRecipes(recipes);
		} else {
			const filtered = recipes.filter((recipe) =>
				recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredRecipes(filtered);
		}
	}, [searchTerm, recipes]);

	const handleBack = () => {
		navigate("/shopping");
	};

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
		setTitleError(false);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleRecipeSelect = (recipeId: number) => {
		setSelectedRecipes((prev) => {
			if (prev.includes(recipeId)) {
				return prev.filter((id) => id !== recipeId);
			} else {
				return [...prev, recipeId];
			}
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate inputs
		if (title.trim() === "") {
			setTitleError(true);
			return;
		}

		if (selectedRecipes.length === 0) {
			setError("Please select at least one recipe");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const shoppingListData: ShoppingListCreateRequest = {
				title: title.trim(),
				recipeIds: selectedRecipes,
			};

			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists`,
				"POST",
				JSON.stringify(shoppingListData),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			// Redirect to the newly created shopping list
			navigate(`/shopping/${responseData.id}`);
		} catch (err) {
			console.error(err);
			setError("Failed to create shopping list");
			setIsSubmitting(false);
		}
	};

	if (!auth.isLoggedIn) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="info">
					Please log in to create a shopping list.
				</Alert>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				p: 3,
				backgroundColor: "#f5f5f5",
				minHeight: "calc(100vh - 70px)",
			}}
		>
			<Paper elevation={2} sx={{ p: 3 }}>
				<Box sx={{ mb: 3 }}>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={handleBack}
						sx={{ mb: 2 }}
					>
						Back to Shopping Lists
					</Button>

					<Typography
						variant="h5"
						sx={{ color: "#EB5A3C", fontWeight: "bold", mb: 3 }}
					>
						Create New Shopping List
					</Typography>

					{error && (
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					)}

					<Box component="form" onSubmit={handleSubmit}>
						<TextField
							fullWidth
							label="Shopping List Title"
							value={title}
							onChange={handleTitleChange}
							margin="normal"
							required
							error={titleError}
							helperText={
								titleError ? "Please enter a title" : ""
							}
							disabled={isSubmitting}
							sx={{ mb: 3 }}
						/>

						<Typography variant="h6" gutterBottom>
							Select Recipes for Your Shopping List
						</Typography>

						<TextField
							fullWidth
							label="Search Recipes"
							value={searchTerm}
							onChange={handleSearchChange}
							margin="normal"
							disabled={isSubmitting}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
							sx={{ mb: 3 }}
						/>

						<Box sx={{ mb: 3 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 2,
								}}
							>
								<Typography variant="subtitle1">
									Selected Recipes: {selectedRecipes.length}
								</Typography>

								{selectedRecipes.length > 0 && (
									<Button
										variant="outlined"
										size="small"
										onClick={() => setSelectedRecipes([])}
									>
										Clear Selection
									</Button>
								)}
							</Box>

							{isLoading ? (
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										py: 4,
									}}
								>
									<CircularProgress
										sx={{ color: "#EB5A3C" }}
									/>
								</Box>
							) : filteredRecipes.length === 0 ? (
								<Box sx={{ textAlign: "center", py: 4 }}>
									<Typography color="textSecondary">
										No recipes found matching your search.
									</Typography>
								</Box>
							) : (
								<Grid container spacing={3}>
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
													position: "relative",
													border: selectedRecipes.includes(
														recipe.recipeId
													)
														? "2px solid #EB5A3C"
														: "2px solid transparent",
												}}
											>
												<CardActionArea
													onClick={() =>
														handleRecipeSelect(
															recipe.recipeId
														)
													}
												>
													<CardMedia
														component="img"
														height="140"
														image={`/images/food/${recipe.difficultyLevel.toLowerCase()}.jpeg`}
														alt={recipe.title}
													/>
													<Checkbox
														checked={selectedRecipes.includes(
															recipe.recipeId
														)}
														sx={{
															position:
																"absolute",
															top: 8,
															right: 8,
															backgroundColor:
																"rgba(255, 255, 255, 0.7)",
															borderRadius: "50%",
															p: 0.5,
															color: "#EB5A3C",
															"&.Mui-checked": {
																color: "#EB5A3C",
															},
														}}
													/>
													<CardContent>
														<Typography
															variant="h6"
															component="div"
															noWrap
														>
															{recipe.title}
														</Typography>

														<Box
															sx={{
																display: "flex",
																flexWrap:
																	"wrap",
																gap: 1,
																mt: 1,
															}}
														>
															<Chip
																icon={
																	<AccessTimeIcon />
																}
																label={`${
																	recipe.preparationTime +
																	recipe.cookingTime
																} min`}
																size="small"
																variant="outlined"
															/>
															<Chip
																icon={
																	<PeopleIcon />
																}
																label={`${recipe.servings} servings`}
																size="small"
																variant="outlined"
															/>
															<Chip
																label={
																	recipe.difficultyLevel
																}
																size="small"
																color={
																	recipe.difficultyLevel ===
																	"EASY"
																		? "success"
																		: recipe.difficultyLevel ===
																		  "MEDIUM"
																		? "warning"
																		: "error"
																}
															/>
														</Box>

														<Typography
															variant="body2"
															color="text.secondary"
															sx={{ mt: 1 }}
														>
															by{" "}
															{
																recipe.user.email.split(
																	"@"
																)[0]
															}
														</Typography>
													</CardContent>
												</CardActionArea>
											</Card>
										</Grid>
									))}
								</Grid>
							)}
						</Box>

						<Divider sx={{ my: 3 }} />

						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<Button
								variant="outlined"
								onClick={handleBack}
								disabled={isSubmitting}
							>
								Cancel
							</Button>

							<Button
								type="submit"
								variant="contained"
								disabled={
									isSubmitting || selectedRecipes.length === 0
								}
								startIcon={
									isSubmitting ? (
										<CircularProgress size={20} />
									) : (
										<ShoppingCartIcon />
									)
								}
								sx={{
									backgroundColor: "#EB5A3C",
									"&:hover": { backgroundColor: "#d23c22" },
									"&.Mui-disabled": {
										backgroundColor: "#f5a898",
									},
								}}
							>
								{isSubmitting
									? "Creating..."
									: "Create Shopping List"}
							</Button>
						</Box>
					</Box>
				</Box>
			</Paper>
		</Box>
	);
}

export default ShoppingListCreate;
