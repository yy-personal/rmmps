import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import RecipeCard from "../RecipeCard/RecipeCard";
import { useHttpClient } from "hooks/http-hook";
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

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KitchenIcon from "@mui/icons-material/Kitchen";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

interface User {
	userId: number;
	email: string;
}

interface MealType {
	mealTypeId: number;
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

interface Ingredient {
	ingredientId: number;
	name: string;
}

interface SearchParams {
	title: string;
	ingredientIds: number[];
	difficultyLevel: string;
	maxTotalTime: number | null;
	minTotalTime: number | null;
	userId: number | null;
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
	const [recipes, setRecipes] = useState<RecipeType[]>([]);
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
		mealTypeIds: [],
		servings: null,
		page: 0,
		size: 9,
		sortBy: "title",
		sortDirection: "asc",
	});

	// Fetch all recipes on initial load (when not in search mode)
	useEffect(() => {
		if (!searchMode) {
			fetchAllRecipes();
		}
	}, [searchMode]);

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

	const fetchAllRecipes = async () => {
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/recipes`
			);
			setRecipes(responseData);
		} catch (err) {
			console.log(err);
		}
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
		if (searchMode) {
			performSearch();
		}
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

	const handleResetFilters = () => {
		setSearchParams({
			title: "",
			ingredientIds: [],
			difficultyLevel: "",
			maxTotalTime: null,
			minTotalTime: null,
			userId: null,
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
			searchParams.mealTypeIds.length > 0 ||
			searchParams.servings !== null
		);
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
							<Autocomplete
								multiple
								id="ingredients-autocomplete"
								options={availableIngredients}
								getOptionLabel={(option) => option.name}
								isOptionEqualToValue={(option, value) =>
									option.ingredientId === value.ingredientId
								}
								renderOption={(props, option, { selected }) => (
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
								renderInput={(params) => (
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
															.startAdornment
													}
												</>
											),
										}}
									/>
								)}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => (
										<Chip
											label={option.name}
											size="small"
											{...getTagProps({ index })}
										/>
									))
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

						<Box sx={{ display: "flex", alignItems: "center" }}>
							<SortIcon sx={{ mr: 1, color: "#555" }} />
							<FormControl sx={{ minWidth: 120, mr: 2 }}>
								<InputLabel id="sort-by-label">
									Sort By
								</InputLabel>
								<Select
									labelId="sort-by-label"
									name="sortBy"
									value={searchParams.sortBy}
									label="Sort By"
									onChange={handleSortChange}
									size="small"
								>
									<MenuItem value="title">Name</MenuItem>
									<MenuItem value="preparationTime">
										Prep Time
									</MenuItem>
									<MenuItem value="cookingTime">
										Cook Time
									</MenuItem>
									<MenuItem value="servings">
										Servings
									</MenuItem>
									<MenuItem value="difficultyLevel">
										Difficulty
									</MenuItem>
								</Select>
							</FormControl>

							<FormControl sx={{ minWidth: 120 }}>
								<InputLabel id="sort-direction-label">
									Direction
								</InputLabel>
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
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "space-evenly",
						pt: "10px",
					}}
				>
					{recipes.map((recipe) => {
						return (
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
						);
					})}
				</Box>
			)}
		</Box>
	);
}

export default RecipeList;
