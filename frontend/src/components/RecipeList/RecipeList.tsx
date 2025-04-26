import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "hooks/http-hook";

// Material UI imports
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Autocomplete from "@mui/material/Autocomplete";
import FormControlLabel from "@mui/material/FormControlLabel";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KitchenIcon from "@mui/icons-material/Kitchen";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PersonIcon from "@mui/icons-material/Person";

// Components
import RecipeCard from "../RecipeCard/RecipeCard";

// Interfaces
interface User {
	userId: number;
	email: string;
}

interface MealType {
	mealTypeId: number;
	name: string;
}

interface Ingredient {
	ingredientId: number;
	name: string;
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
	mealTypes?: MealType[];
}

interface SearchParams {
	title: string;
	ingredientIds: number[];
	difficultyLevel: string;
	maxTotalTime: number | null;
	minTotalTime: number | null;
	userId: number | null;
	username: string;
	mealTypeIds: number[];
	servings: number | null;
	page: number;
	size: number;
	sortBy: string;
	sortDirection: string;
}

interface SearchResponse {
	content: RecipeType[];
	totalElements: number;
	totalPages: number;
	number: number; // current page
	size: number; // page size
}

function RecipeList() {
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const auth = useContext(AuthContext); // Get auth context for user info
	const [recipes, setRecipes] = useState<RecipeType[]>([]);
	const [displayedRecipes, setDisplayedRecipes] = useState<RecipeType[]>([]);
	const [searchMode, setSearchMode] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(
		null
	);
	const [showFilters, setShowFilters] = useState(false);
	const [availableMealTypes, setAvailableMealTypes] = useState<MealType[]>(
		[]
	);
	const [availableIngredients, setAvailableIngredients] = useState<
		Ingredient[]
	>([]);

	const [searchParams, setSearchParams] = useState<SearchParams>({
		title: "",
		ingredientIds: [],
		difficultyLevel: "",
		maxTotalTime: null,
		minTotalTime: null,
		userId: null,
		username: "",
		mealTypeIds: [],
		servings: null,
		page: 0,
		size: 9,
		sortBy: "title",
		sortDirection: "asc",
	});

	// Update the getUserIdFromAuth function to be more reliable
	const getUserIdFromAuth = (): number | null => {
		if (!auth.isLoggedIn) return null;

		try {
			// In a real app, we would probably have the user ID directly in the auth context
			// For now, let's try to extract it from the stored userData
			const userData = localStorage.getItem("rmmps-userData");
			if (userData) {
				const parsedData = JSON.parse(userData);

				// Debug what's in the stored data
				console.log("UserData from localStorage:", parsedData);

				// Check if we have a direct user object with ID
				if (parsedData.user && parsedData.user.userId) {
					return parsedData.user.userId;
				}

				// Try to get the userId from the API
				if (auth.userEmail) {
					// We could do a lookup by email here if needed
					console.log(
						"Using email to identify user:",
						auth.userEmail
					);
					// You might need to add an API call here to look up the user by email

					// For now, return a fallback if you know the user ID pattern
					return null; // Replace with actual logic if possible
				}

				return null;
			}
			return null;
		} catch (error) {
			console.error("Error getting user ID:", error);
			return null;
		}
	};

	// Fetch all recipes on initial load (when not in search mode)
	useEffect(() => {
		if (!searchMode) {
			fetchAllRecipes();
		}
	}, [searchMode]);

	// Apply sorting to displayed recipes whenever sort parameters or recipes change
	useEffect(() => {
		if (!searchMode && recipes.length > 0) {
			applySortingToRecipes();
		}
	}, [recipes, searchParams.sortBy, searchParams.sortDirection]);

	// Fetch meal types and ingredients for search filter
	useEffect(() => {
		fetchMealTypes();
		fetchIngredients();
	}, []);

	// Perform search when page changes in search mode
	useEffect(() => {
		if (searchMode) {
			performSearch();
		}
	}, [searchParams.page]);

	useEffect(() => {
		if (auth.isLoggedIn) {
			console.log("Auth context:", auth);
			console.log("User Email:", auth.userEmail);

			// Log what's in localStorage to debug
			const userData = localStorage.getItem("rmmps-userData");
			if (userData) {
				console.log("User data in localStorage:", JSON.parse(userData));
			}
		}
	}, [auth.isLoggedIn]);

	const fetchAllRecipes = async () => {
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes`
			);
			setRecipes(responseData);
			// Also update displayed recipes with sorting applied
			applyInitialSorting(responseData);
		} catch (err) {
			console.log(err);
		}
	};

	// Apply initial sorting to recipes when first loaded
	const applyInitialSorting = (recipeData: RecipeType[]) => {
		const sortedRecipes = [...recipeData];
		sortRecipes(sortedRecipes);
		setDisplayedRecipes(sortedRecipes);
	};

	// Apply sorting to the current recipes
	const applySortingToRecipes = () => {
		const sortedRecipes = [...recipes];
		sortRecipes(sortedRecipes);
		setDisplayedRecipes(sortedRecipes);
	};

	// Generic sort function that can be reused
	const sortRecipes = (recipesToSort: RecipeType[]) => {
		const { sortBy, sortDirection } = searchParams;
		const sortMultiplier = sortDirection === "asc" ? 1 : -1;

		recipesToSort.sort((a, b) => {
			switch (sortBy) {
				case "title":
					return sortMultiplier * a.title.localeCompare(b.title);
				case "preparationTime":
					return (
						sortMultiplier * (a.preparationTime - b.preparationTime)
					);
				case "cookingTime":
					return sortMultiplier * (a.cookingTime - b.cookingTime);
				case "servings":
					return sortMultiplier * (a.servings - b.servings);
				case "difficultyLevel":
					// We need to define a custom order for difficulty levels
					const difficultyOrder = { EASY: 0, MEDIUM: 1, HARD: 2 };
					return (
						sortMultiplier *
						(difficultyOrder[
							a.difficultyLevel as keyof typeof difficultyOrder
						] -
							difficultyOrder[
								b.difficultyLevel as keyof typeof difficultyOrder
							])
					);
				default:
					return 0;
			}
		});
	};

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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setSearchParams((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (e: SelectChangeEvent<string>) => {
		const name = e.target.name as keyof SearchParams;
		const value = e.target.value;
		setSearchParams((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const numValue = value === "" ? null : Number(value);
		setSearchParams((prev) => ({
			...prev,
			[name]: numValue,
		}));
	};

	const handleMealTypeChange = (e: SelectChangeEvent<number[]>) => {
		const value = e.target.value as unknown as number[];
		setSearchParams((prev) => ({
			...prev,
			mealTypeIds: value,
		}));
	};

	const handleSortChange = (e: SelectChangeEvent<string>) => {
		const name = e.target.name as keyof SearchParams;
		const value = e.target.value;
		setSearchParams((prev) => ({
			...prev,
			[name]: value,
			page: 0, // Reset to first page when sort changes
		}));

		// Always apply sorting changes, regardless of search mode
		if (searchMode) {
			performSearch();
		}
		// No need for else case - the useEffect will handle sorting regular recipes
	};

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setSearchParams((prev) => ({
			...prev,
			page: value - 1, // API uses 0-based pagination
		}));
	};

	// Handle ingredient selection
	const handleIngredientChange = (
		_event: React.SyntheticEvent<Element, Event>,
		value: Ingredient[]
	) => {
		setSearchParams((prev) => ({
			...prev,
			ingredientIds: value.map((ingredient) => ingredient.ingredientId),
		}));
	};

	const handleResetFilters = () => {
		setSearchParams({
			title: "",
			ingredientIds: [],
			difficultyLevel: "",
			maxTotalTime: null,
			minTotalTime: null,
			userId: null,
			username: "",
			mealTypeIds: [],
			servings: null,
			page: 0,
			size: 9,
			sortBy: "title",
			sortDirection: "asc",
		});
		setSearchMode(false);
		setSearchResults(null);
	};

	const performSearch = async () => {
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes/search`,
				"POST",
				JSON.stringify(searchParams),
				{
					"Content-Type": "application/json",
				}
			);
			setSearchResults(responseData);
			setSearchMode(true);
		} catch (err) {
			console.log(serverError || err);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Reset to first page when search criteria change
		setSearchParams((prev) => ({
			...prev,
			page: 0,
		}));
		performSearch();
	};

	// Determine if any search filters are active
	const hasActiveFilters = () => {
		return (
			searchParams.title !== "" ||
			searchParams.ingredientIds.length > 0 ||
			searchParams.difficultyLevel !== "" ||
			searchParams.maxTotalTime !== null ||
			searchParams.minTotalTime !== null ||
			searchParams.userId !== null ||
			searchParams.username !== "" ||
			searchParams.mealTypeIds.length > 0 ||
			searchParams.servings !== null
		);
	};

	return (
		<Box
			sx={{
				padding: 3,
				backgroundColor: "#f5f5f5",
				minHeight: "calc(100vh - 70px)",
			}}
		>
			{/* Search Section */}
			<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
				<Typography
					variant="h5"
					gutterBottom
					sx={{ color: "#EB5A3C", fontWeight: "bold", mb: 2 }}
				>
					Find Recipes
				</Typography>

				<Box component="form" onSubmit={handleSubmit}>
					<Grid container spacing={2} alignItems="center">
						{/* Basic search input */}
						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								name="title"
								label="Search by recipe name"
								value={searchParams.title}
								onChange={handleInputChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>

						<Grid item xs={12} md={3}>
							<Autocomplete<Ingredient, true>
								multiple
								id="ingredients-autocomplete"
								options={availableIngredients}
								getOptionLabel={(option: Ingredient) =>
									option.name
								}
								isOptionEqualToValue={(
									option: Ingredient,
									value: Ingredient
								) => option.ingredientId === value.ingredientId}
								renderOption={(
									props: React.HTMLAttributes<HTMLLIElement>,
									option: Ingredient,
									{ selected }: { selected: boolean }
								) => (
									<li {...props}>
										<Checkbox
											style={{ marginRight: 8 }}
											checked={selected}
										/>
										{option.name}
									</li>
								)}
								value={availableIngredients.filter(
									(ingredient) =>
										searchParams.ingredientIds.includes(
											ingredient.ingredientId
										)
								)}
								onChange={handleIngredientChange}
								renderInput={(
									params: React.ComponentProps<
										typeof TextField
									>
								) => (
									<TextField
										{...params}
										label="Ingredients"
										placeholder="Search ingredients"
										InputProps={{
											...params.InputProps,
											startAdornment: (
												<>
													<InputAdornment position="start">
														<KitchenIcon />
													</InputAdornment>
													{
														params.InputProps
															?.startAdornment
													}
												</>
											),
										}}
									/>
								)}
								renderTags={(
									value: Ingredient[],
									getTagProps: (props: {
										index: number;
									}) => any
								) =>
									value.map(
										(option: Ingredient, index: number) => (
											<Chip
												label={option.name}
												size="small"
												{...getTagProps({ index })}
											/>
										)
									)
								}
							/>
						</Grid>

						<Grid item xs={12} md={3}>
							<Button
								fullWidth
								type="submit"
								variant="contained"
								size="large"
								startIcon={<SearchIcon />}
								sx={{
									height: "56px",
									backgroundColor: "#EB5A3C",
									"&:hover": {
										backgroundColor: "#d23c22",
									},
								}}
								disabled={isLoading}
							>
								{isLoading ? (
									<CircularProgress
										size={24}
										sx={{ color: "white" }}
									/>
								) : (
									"Search"
								)}
							</Button>
						</Grid>

						{/* Filter toggle */}
						<Grid item xs={12}>
							<Button
								startIcon={<FilterListIcon />}
								onClick={() => setShowFilters(!showFilters)}
								sx={{ color: "#555" }}
							>
								{showFilters
									? "Hide Filters"
									: "Show Advanced Filters"}
							</Button>
						</Grid>

						{/* Advanced filters */}
						{showFilters && (
							<>
								<Grid item xs={12} md={6} lg={3}>
									<TextField
										fullWidth
										name="username"
										label="Search by User"
										value={searchParams.username}
										onChange={handleInputChange}
										placeholder="Enter username/email"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PersonIcon />
												</InputAdornment>
											),
										}}
									/>
								</Grid>

								{auth.isLoggedIn && (
									<Grid item xs={12} md={6} lg={3}>
										<FormControlLabel
											control={
												<Checkbox
													// Check the box if either userId is set OR username is set
													checked={
														searchParams.userId !==
															null ||
														(searchParams.username !==
															null &&
															searchParams.username !==
																"")
													}
													onChange={(e) => {
														if (e.target.checked) {
															// Get the user ID when checkbox is checked
															const userId =
																getUserIdFromAuth();
															console.log(
																"Setting userId filter to:",
																userId
															);

															if (
																userId !== null
															) {
																setSearchParams(
																	(prev) => ({
																		...prev,
																		userId: userId,
																		// Clear the username filter when searching by user ID
																		username:
																			"",
																	})
																);
															} else {
																// If we can't get a user ID but have an email, try filtering by username
																if (
																	auth.userEmail
																) {
																	const username =
																		auth.userEmail.split(
																			"@"
																		)[0];
																	console.log(
																		"Falling back to username filter:",
																		username
																	);
																	setSearchParams(
																		(
																			prev
																		) => ({
																			...prev,
																			userId: null,
																			username:
																				username,
																		})
																	);
																}

																// Show some notification that we couldn't determine the user ID
																console.error(
																	"Could not determine user ID for filtering"
																);
															}
														} else {
															// Clear both the user ID and username filters when checkbox is unchecked
															setSearchParams(
																(prev) => ({
																	...prev,
																	userId: null,
																	username:
																		"",
																})
															);
														}
													}}
													color="primary"
												/>
											}
											label="My Recipes Only"
											sx={{
												height: "100%",
												display: "flex",
												alignItems: "center",
											}}
										/>
									</Grid>
								)}

								<Grid item xs={12} md={6} lg={3}>
									<FormControl fullWidth>
										<InputLabel id="difficulty-level-label">
											Difficulty Level
										</InputLabel>
										<Select
											labelId="difficulty-level-label"
											name="difficultyLevel"
											value={searchParams.difficultyLevel}
											onChange={handleSelectChange}
											label="Difficulty Level"
											startAdornment={
												<InputAdornment position="start">
													<SignalCellularAltIcon />
												</InputAdornment>
											}
										>
											<MenuItem value="">
												<em>Any</em>
											</MenuItem>
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
								</Grid>

								<Grid item xs={12} md={6} lg={3}>
									<TextField
										fullWidth
										type="number"
										name="servings"
										label="Servings"
										value={searchParams.servings || ""}
										onChange={handleNumberChange}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<RestaurantIcon />
												</InputAdornment>
											),
											inputProps: { min: 1 },
										}}
									/>
								</Grid>

								<Grid item xs={12} md={6} lg={3}>
									<TextField
										fullWidth
										type="number"
										name="minTotalTime"
										label="Min Total Time (minutes)"
										value={searchParams.minTotalTime || ""}
										onChange={handleNumberChange}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<AccessTimeIcon />
												</InputAdornment>
											),
											inputProps: { min: 1 },
										}}
									/>
								</Grid>

								<Grid item xs={12} md={6} lg={3}>
									<TextField
										fullWidth
										type="number"
										name="maxTotalTime"
										label="Max Total Time (minutes)"
										value={searchParams.maxTotalTime || ""}
										onChange={handleNumberChange}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<AccessTimeIcon />
												</InputAdornment>
											),
											inputProps: { min: 1 },
										}}
									/>
								</Grid>

								<Grid item xs={12}>
									<FormControl fullWidth>
										<InputLabel id="meal-type-label">
											Meal Types
										</InputLabel>
										<Select
											labelId="meal-type-label"
											multiple
											value={searchParams.mealTypeIds}
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
													{selected.map((value) => {
														const mealType =
															availableMealTypes.find(
																(mt) =>
																	mt.mealTypeId ===
																	value
															);
														return mealType ? (
															<Chip
																key={value}
																label={
																	mealType.name
																}
																size="small"
															/>
														) : null;
													})}
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
																searchParams.mealTypeIds.indexOf(
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
								</Grid>

								<Grid item xs={12}>
									<Button
										variant="outlined"
										onClick={handleResetFilters}
										sx={{ mr: 1 }}
									>
										Reset Filters
									</Button>
									<Button
										variant="contained"
										type="submit"
										sx={{
											backgroundColor: "#EB5A3C",
											"&:hover": {
												backgroundColor: "#d23c22",
											},
										}}
									>
										Apply Filters
									</Button>
								</Grid>
							</>
						)}
					</Grid>
				</Box>
			</Paper>

			{/* Sorting Controls - Always Visible */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					alignItems: "center",
					mb: 2,
				}}
			>
				<SortIcon sx={{ mr: 1, color: "#555" }} />
				<FormControl sx={{ minWidth: 120, mr: 2 }}>
					<InputLabel id="sort-by-label">Sort By</InputLabel>
					<Select
						labelId="sort-by-label"
						name="sortBy"
						value={searchParams.sortBy}
						label="Sort By"
						onChange={handleSortChange}
						size="small"
					>
						<MenuItem value="title">Name</MenuItem>
						<MenuItem value="preparationTime">Prep Time</MenuItem>
						<MenuItem value="cookingTime">Cook Time</MenuItem>
						<MenuItem value="servings">Servings</MenuItem>
						<MenuItem value="difficultyLevel">Difficulty</MenuItem>
					</Select>
				</FormControl>

				<FormControl sx={{ minWidth: 120 }}>
					<InputLabel id="sort-direction-label">Direction</InputLabel>
					<Select
						labelId="sort-direction-label"
						name="sortDirection"
						value={searchParams.sortDirection}
						label="Direction"
						onChange={handleSortChange}
						size="small"
					>
						<MenuItem value="asc">Ascending</MenuItem>
						<MenuItem value="desc">Descending</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Results Section */}
			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
					<CircularProgress size={60} sx={{ color: "#EB5A3C" }} />
				</Box>
			) : searchMode && searchResults ? (
				// Search Results
				<>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h6">
							{searchResults.totalElements}{" "}
							{searchResults.totalElements === 1
								? "Recipe"
								: "Recipes"}{" "}
							Found
							{hasActiveFilters() && (
								<Button
									variant="text"
									size="small"
									onClick={handleResetFilters}
									sx={{ ml: 2, color: "#666" }}
								>
									Clear Filters
								</Button>
							)}
						</Typography>
					</Box>

					{searchResults.content.length === 0 ? (
						<Alert severity="info" sx={{ mt: 4 }}>
							No recipes found matching your search criteria. Try
							adjusting your filters.
						</Alert>
					) : (
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								justifyContent: "flex-start",
							}}
						>
							{searchResults.content.map((recipe) => (
								<RecipeCard
									key={recipe.recipeId}
									recipeId={recipe.recipeId}
									title={recipe.title}
									user={recipe.user}
									preparationTime={recipe.preparationTime}
									cookingTime={recipe.cookingTime}
									difficultyLevel={recipe.difficultyLevel}
									servings={recipe.servings}
									steps={recipe.steps}
									mealTypes={recipe.mealTypes}
								/>
							))}
						</Box>
					)}

					{searchResults.totalPages > 1 && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								mt: 4,
								mb: 2,
							}}
						>
							<Pagination
								count={searchResults.totalPages}
								page={searchResults.number + 1} // API uses 0-based pagination
								onChange={handlePageChange}
								color="primary"
								size="large"
							/>
						</Box>
					)}
				</>
			) : (
				// Default Recipe List (All Recipes)
				<>
					<Typography variant="h6" sx={{ mb: 2 }}>
						{displayedRecipes.length}{" "}
						{displayedRecipes.length === 1 ? "Recipe" : "Recipes"}
					</Typography>

					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "space-evenly",
							pt: "10px",
						}}
					>
						{displayedRecipes.map((recipe) => (
							<RecipeCard
								key={recipe.recipeId}
								recipeId={recipe.recipeId}
								title={recipe.title}
								user={recipe.user}
								preparationTime={recipe.preparationTime}
								cookingTime={recipe.cookingTime}
								difficultyLevel={recipe.difficultyLevel}
								servings={recipe.servings}
								steps={recipe.steps}
								mealTypes={recipe.mealTypes}
							/>
						))}
					</Box>
				</>
			)}
		</Box>
	);
}

export default RecipeList;
