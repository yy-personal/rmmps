import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import { AuthContext } from "../../contexts/auth-context";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

// Icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import KitchenIcon from "@mui/icons-material/Kitchen";
import React from "react";

interface ShoppingListItem {
	ingredientId: number;
	ingredientName: string;
	quantity: string;
	purchased: boolean;
	recipeId?: number;
	recipeTitle?: string;
	servings?: number;
}

interface ShoppingList {
	id: number;
	title: string;
	userEmail: string;
	createdAt: string;
	items: ShoppingListItem[];
}

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

function ShoppingLists() {
	const auth = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [pageSize] = useState(5);
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortDir, setSortDir] = useState("desc");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedListId, setSelectedListId] = useState<number | null>(null);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const initialLoadDone = useRef(false);

	// New states for modal functionality
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [newListTitle, setNewListTitle] = useState("");
	const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
	const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
	const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
	const [loadingRecipes, setLoadingRecipes] = useState(false);
	const [submitAttempted, setSubmitAttempted] = useState(false);
	const [creatingList, setCreatingList] = useState(false);

	// States for expandable ingredients
	const [expandedRecipes, setExpandedRecipes] = useState<
		Record<number, boolean>
	>({});
	const [recipeIngredients, setRecipeIngredients] = useState<
		Record<number, RecipeIngredient[]>
	>({});
	const [loadingIngredients, setLoadingIngredients] = useState<
		Record<number, boolean>
	>({});

	// Auto refresh on navigation
	useEffect(() => {
		// Check if this is a navigation to shopping list from elsewhere
		const fromNavigation =
			sessionStorage.getItem("lastPath") !== "/shopping" &&
			location.pathname === "/shopping";

		if (fromNavigation && !initialLoadDone.current) {
			// Refresh the page, but only once
			window.location.reload();
		}

		// Always update the last path
		sessionStorage.setItem("lastPath", location.pathname);

		// Mark initial load as done
		initialLoadDone.current = true;
	}, [location]);

	// Fetch shopping lists when component mounts
	useEffect(() => {
		if (auth.isLoggedIn) {
			fetchShoppingLists();
		} else {
			setFetchError("You must be logged in to view shopping lists");
		}
	}, [page, sortBy, sortDir, auth.isLoggedIn]);

	// Update filtered recipes when search query changes
	useEffect(() => {
		if (availableRecipes.length > 0) {
			filterRecipes();
		}
	}, [recipeSearchQuery]);

	const fetchShoppingLists = async () => {
		if (!auth.isLoggedIn || !auth.accessToken) {
			setFetchError("Authentication required");
			return;
		}

		setFetchError(null);

		try {
			console.log("Fetching shopping lists...");

			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists?page=${page}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`,
				"GET",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			console.log("Response received:", responseData);

			if (Array.isArray(responseData)) {
				console.log(
					"Setting shopping lists from array:",
					responseData.length
				);
				setShoppingLists(responseData);
				setTotalPages(Math.ceil(responseData.length / pageSize) || 1);
			} else if (responseData && typeof responseData === "object") {
				if (Array.isArray(responseData.content)) {
					console.log(
						"Setting shopping lists from paginated response:",
						responseData.content.length
					);
					setShoppingLists(responseData.content);
					setTotalPages(responseData.totalPages || 1);
				} else {
					// If we get an object but it's not paginated, try to adapt
					console.log("Received object response without pagination");
					setShoppingLists([responseData]);
					setTotalPages(1);
				}
			} else {
				console.warn("Unexpected response format:", responseData);
				setShoppingLists([]);
				setTotalPages(1);
			}
		} catch (err) {
			console.error("Error fetching shopping lists:", err);
			setFetchError(serverError || "Failed to fetch shopping lists");
		}
	};

	// Function to fetch recipes for the modal
	const fetchRecipes = async () => {
		if (!auth.isLoggedIn || !auth.accessToken) return;

		setLoadingRecipes(true);
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes`,
				"GET",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			if (Array.isArray(responseData)) {
				setAvailableRecipes(responseData);
				setFilteredRecipes(responseData);
			}
		} catch (err) {
			console.error("Error fetching recipes:", err);
		} finally {
			setLoadingRecipes(false);
		}
	};

	// Function to fetch ingredients for a specific recipe
	const fetchRecipeIngredients = async (recipeId: number) => {
		if (!auth.isLoggedIn || !auth.accessToken) return;

		// Mark as loading
		setLoadingIngredients((prev) => ({
			...prev,
			[recipeId]: true,
		}));

		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes/${recipeId}/ingredients`,
				"GET",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			if (Array.isArray(responseData)) {
				setRecipeIngredients((prev) => ({
					...prev,
					[recipeId]: responseData,
				}));
			}
		} catch (err) {
			console.error(
				`Error fetching ingredients for recipe ${recipeId}:`,
				err
			);
		} finally {
			setLoadingIngredients((prev) => ({
				...prev,
				[recipeId]: false,
			}));
		}
	};

	// Toggle recipe expansion
	const handleToggleExpand = (recipeId: number) => {
		const newExpandedState = !expandedRecipes[recipeId];

		setExpandedRecipes((prev) => ({
			...prev,
			[recipeId]: newExpandedState,
		}));

		// Fetch ingredients if expanding and we don't have them yet
		if (newExpandedState && !recipeIngredients[recipeId]) {
			fetchRecipeIngredients(recipeId);
		}
	};

	// Function to filter recipes based on search
	const filterRecipes = () => {
		if (!recipeSearchQuery.trim()) {
			setFilteredRecipes(availableRecipes);
			return;
		}

		const filtered = availableRecipes.filter((recipe) =>
			recipe.title.toLowerCase().includes(recipeSearchQuery.toLowerCase())
		);
		setFilteredRecipes(filtered);
	};

	// Handle recipe search
	const handleRecipeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRecipeSearchQuery(e.target.value);
	};

	// Toggle recipe selection
	const handleToggleRecipe = (recipeId: number) => {
		setSelectedRecipes((prev) => {
			if (prev.includes(recipeId)) {
				return prev.filter((id) => id !== recipeId);
			} else {
				return [...prev, recipeId];
			}
		});
	};

	// Create shopping list function
	const handleCreateShoppingList = async () => {
		setSubmitAttempted(true);

		// Validate
		if (!newListTitle.trim() || selectedRecipes.length === 0) {
			return;
		}

		setCreatingList(true);
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists`,
				"POST",
				JSON.stringify({
					title: newListTitle,
					recipeIds: selectedRecipes,
				}),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			setCreateModalOpen(false);

			// Refresh shopping lists
			fetchShoppingLists();

			// If creation was successful and returned an ID, navigate to the new list
			if (responseData && responseData.id) {
				navigate(`/shopping/${responseData.id}`);
			}
		} catch (err) {
			console.error("Error creating shopping list:", err);
		} finally {
			setCreatingList(false);
		}
	};

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setPage(value - 1);
	};

	const handleSortChange = (event: SelectChangeEvent) => {
		setSortBy(event.target.value);
	};

	const handleSortDirChange = (event: SelectChangeEvent) => {
		setSortDir(event.target.value);
	};

	const handleCreateNewList = () => {
		// Clear previous data
		setNewListTitle("");
		setSelectedRecipes([]);
		setRecipeSearchQuery("");
		setSubmitAttempted(false);
		setExpandedRecipes({});
		setRecipeIngredients({});
		// Fetch recipes
		fetchRecipes();
		// Open modal
		setCreateModalOpen(true);
	};

	const handleViewList = (id: number) => {
		// Store current path before navigation
		sessionStorage.setItem("returnToShoppingList", "true");
		navigate(`/shopping/${id}`);
	};

	const handleOpenDeleteDialog = (id: number) => {
		setSelectedListId(id);
		setDeleteDialogOpen(true);
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setSelectedListId(null);
	};

	const handleDeleteList = async () => {
		if (!selectedListId) return;

		try {
			await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${selectedListId}`,
				"DELETE",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			// Remove from state
			setShoppingLists(
				shoppingLists.filter((list) => list.id !== selectedListId)
			);
			handleCloseDeleteDialog();
		} catch (err) {
			console.error("Error deleting shopping list:", err);
		}
	};

	// Count purchased items in a list
	const countPurchasedItems = (items: ShoppingListItem[]) => {
		return items.filter((item) => item.purchased).length;
	};

	// Format date to be more user-friendly
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return (
			date.toLocaleDateString() +
			" " +
			date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		);
	};

	// If not logged in, show login prompt
	if (!auth.isLoggedIn) {
		return (
			<Box sx={{ padding: 3, minHeight: "calc(100vh - 70px)" }}>
				<Typography
					variant="h4"
					component="h1"
					sx={{ color: "#EB5A3C", fontWeight: "bold", mb: 3 }}
				>
					Shopping Lists
				</Typography>
				<Alert severity="info" sx={{ mb: 3 }}>
					Please log in to view and manage your shopping lists.
				</Alert>
				<Button
					variant="contained"
					onClick={() => navigate("/login")}
					sx={{
						backgroundColor: "#EB5A3C",
						"&:hover": { backgroundColor: "#d23c22" },
					}}
				>
					Go to Login
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ padding: 3, minHeight: "calc(100vh - 70px)" }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
				}}
			>
				<Typography
					variant="h4"
					component="h1"
					sx={{ color: "#EB5A3C", fontWeight: "bold" }}
				>
					Shopping Lists
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleCreateNewList}
					sx={{
						backgroundColor: "#EB5A3C",
						"&:hover": { backgroundColor: "#d23c22" },
					}}
				>
					Create Shopping List
				</Button>
			</Box>

			{/* Sorting Controls */}
			<Box sx={{ display: "flex", mb: 3, alignItems: "center" }}>
				<SortIcon sx={{ mr: 1, color: "#666" }} />
				<FormControl sx={{ minWidth: 150, mr: 2 }} size="small">
					<InputLabel id="sort-by-label">Sort By</InputLabel>
					<Select
						labelId="sort-by-label"
						value={sortBy}
						label="Sort By"
						onChange={handleSortChange}
					>
						<MenuItem value="createdAt">Created Date</MenuItem>
						<MenuItem value="title">Title</MenuItem>
					</Select>
				</FormControl>
				<FormControl sx={{ minWidth: 150 }} size="small">
					<InputLabel id="sort-dir-label">Order</InputLabel>
					<Select
						labelId="sort-dir-label"
						value={sortDir}
						label="Order"
						onChange={handleSortDirChange}
					>
						<MenuItem value="desc">Newest First</MenuItem>
						<MenuItem value="asc">Oldest First</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress sx={{ color: "#EB5A3C" }} />
				</Box>
			) : fetchError ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					{fetchError}
					<Button
						variant="outlined"
						color="inherit"
						size="small"
						onClick={fetchShoppingLists}
						sx={{ ml: 2 }}
					>
						Retry
					</Button>
				</Alert>
			) : shoppingLists.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 6 }}>
					<ShoppingCartIcon
						sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
					/>
					<Typography variant="h6" color="text.secondary">
						No shopping lists found
					</Typography>
					<Typography color="text.secondary" sx={{ mb: 3 }}>
						Create your first shopping list to get started
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleCreateNewList}
						sx={{
							backgroundColor: "#EB5A3C",
							"&:hover": { backgroundColor: "#d23c22" },
						}}
					>
						Create Shopping List
					</Button>
				</Box>
			) : (
				<>
					<Grid container spacing={3}>
						{shoppingLists.map((list) => (
							<Grid item xs={12} sm={6} md={4} key={list.id}>
								<Card
									sx={{
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
											{list.title}
										</Typography>
										<Typography
											color="text.secondary"
											variant="body2"
											gutterBottom
										>
											Created:{" "}
											{formatDate(list.createdAt)}
										</Typography>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												mt: 2,
											}}
										>
											<ShoppingCartIcon
												fontSize="small"
												sx={{ mr: 1, color: "#666" }}
											/>
											<Typography variant="body2">
												{countPurchasedItems(
													list.items
												)}
												/{list.items.length} items
												purchased
											</Typography>
										</Box>
									</CardContent>
									<CardActions>
										<Button
											size="small"
											startIcon={<VisibilityIcon />}
											onClick={() =>
												handleViewList(list.id)
											}
										>
											View
										</Button>
										<IconButton
											size="small"
											color="error"
											onClick={() =>
												handleOpenDeleteDialog(list.id)
											}
											sx={{ ml: "auto" }}
										>
											<DeleteIcon />
										</IconButton>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>

					{totalPages > 1 && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								mt: 4,
							}}
						>
							<Pagination
								count={totalPages}
								page={page + 1}
								onChange={handlePageChange}
								color="primary"
							/>
						</Box>
					)}
				</>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
				<DialogTitle>Delete Shopping List</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this shopping list? This
						action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleDeleteList}
						color="error"
						startIcon={<DeleteIcon />}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Create Shopping List Modal */}
			<Dialog
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<Box
					sx={{
						p: 2,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottom: "1px solid #eee",
					}}
				>
					<Typography variant="h6">Create Shopping List</Typography>
					<IconButton
						edge="end"
						color="inherit"
						onClick={() => setCreateModalOpen(false)}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>
				</Box>
				<DialogContent>
					<Box
						component="form"
						onSubmit={(e) => {
							e.preventDefault();
							handleCreateShoppingList();
						}}
					>
						<TextField
							fullWidth
							label="Shopping List Title"
							value={newListTitle}
							onChange={(e) => setNewListTitle(e.target.value)}
							required
							error={submitAttempted && !newListTitle.trim()}
							helperText={
								submitAttempted && !newListTitle.trim()
									? "Title is required"
									: ""
							}
							sx={{ mb: 3, mt: 1 }}
						/>

						<Typography variant="subtitle1" gutterBottom>
							Select Recipes to Include
						</Typography>
						{submitAttempted && selectedRecipes.length === 0 && (
							<Alert severity="error" sx={{ mb: 2 }}>
								Please select at least one recipe
							</Alert>
						)}

						<TextField
							fullWidth
							label="Search Recipes"
							value={recipeSearchQuery}
							onChange={handleRecipeSearch}
							sx={{ mb: 2 }}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
								endAdornment: recipeSearchQuery && (
									<InputAdornment position="end">
										<IconButton
											size="small"
											onClick={() => {
												setRecipeSearchQuery("");
												setFilteredRecipes(
													availableRecipes
												);
											}}
										>
											<ClearIcon />
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						{loadingRecipes ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									py: 4,
								}}
							>
								<CircularProgress sx={{ color: "#EB5A3C" }} />
							</Box>
						) : availableRecipes.length === 0 ? (
							<Alert severity="info" sx={{ mb: 2 }}>
								No recipes available. Please create some recipes
								first.
							</Alert>
						) : filteredRecipes.length === 0 ? (
							<Alert severity="info">
								No recipes found matching your search.
							</Alert>
						) : (
							<Grid
								container
								spacing={2}
								sx={{ maxHeight: "400px", overflow: "auto" }}
							>
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
													<RestaurantIcon
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

												{/* Ingredients section */}
												<Box sx={{ mt: 1 }}>
													<Button
														size="small"
														onClick={() =>
															handleToggleExpand(
																recipe.recipeId
															)
														}
														endIcon={
															expandedRecipes[
																recipe.recipeId
															] ? (
																<ExpandLessIcon />
															) : (
																<ExpandMoreIcon />
															)
														}
														sx={{
															color: "#666",
															textTransform:
																"none",
															pl: 0,
														}}
													>
														<KitchenIcon
															fontSize="small"
															sx={{ mr: 1 }}
														/>
														{expandedRecipes[
															recipe.recipeId
														]
															? "Hide ingredients"
															: "Show ingredients"}
													</Button>

													<Collapse
														in={
															expandedRecipes[
																recipe.recipeId
															]
														}
														timeout="auto"
														unmountOnExit
													>
														{loadingIngredients[
															recipe.recipeId
														] ? (
															<Box
																sx={{
																	display:
																		"flex",
																	justifyContent:
																		"center",
																	py: 2,
																}}
															>
																<CircularProgress
																	size={24}
																	sx={{
																		color: "#EB5A3C",
																	}}
																/>
															</Box>
														) : recipeIngredients[
																recipe.recipeId
														  ]?.length > 0 ? (
															<List
																dense
																sx={{ py: 0 }}
															>
																{recipeIngredients[
																	recipe
																		.recipeId
																].map(
																	(
																		ingredient,
																		index
																	) => (
																		<React.Fragment
																			key={
																				ingredient.ingredientId ||
																				index
																			}
																		>
																			<ListItem
																				sx={{
																					py: 0.5,
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
																			{index <
																				recipeIngredients[
																					recipe
																						.recipeId
																				]
																					.length -
																					1 && (
																				<Divider
																					component="li"
																					variant="inset"
																				/>
																			)}
																		</React.Fragment>
																	)
																)}
															</List>
														) : (
															<Typography
																variant="body2"
																color="text.secondary"
																sx={{
																	ml: 4,
																	mt: 1,
																}}
															>
																No ingredients
																found
															</Typography>
														)}
													</Collapse>
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
							<Button
								variant="outlined"
								onClick={() => setCreateModalOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								startIcon={<ShoppingCartIcon />}
								disabled={creatingList}
								sx={{
									backgroundColor: "#EB5A3C",
									"&:hover": { backgroundColor: "#d23c22" },
								}}
							>
								{creatingList ? (
									<CircularProgress
										size={24}
										color="inherit"
									/>
								) : (
									"Create Shopping List"
								)}
							</Button>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
		</Box>
	);
}

export default ShoppingLists;
