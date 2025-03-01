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


interface User {
	userId: number;
	email: string;
	passwordHash?: string;
	createdAt?: string;
}

interface RecipeDetailProps {
	recipeId: number | null;
	open: boolean;
	onClose: () => void;
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
}

function RecipeDetail({ recipeId, open, onClose }: RecipeDetailProps) {
	const auth = useContext(AuthContext);
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [recipe, setRecipe] = useState<RecipeType | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [editFormState, setEditFormState] = useState<Partial<RecipeType>>({});

	useEffect(() => {
		const fetchRecipe = async () => {
			if (!recipeId) return;

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
				});
			} catch (err) {
				console.log(err.message || serverError);
			}
		};

		if (open && recipeId) {
			fetchRecipe();
			setIsEditing(false); // Reset editing mode when opening modal
		}
	}, [recipeId, open, sendRequest, serverError]);

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
			});
		}
		setIsEditing(false);
	};

	const handleSaveEditing = async () => {
		if (!recipe || !recipeId) return;

		setIsSaving(true);
		try {
			// Prepare data for update
			const updateData = {
				...recipe,
				title: editFormState.title,
				preparationTime: editFormState.preparationTime,
				cookingTime: editFormState.cookingTime,
				difficultyLevel: editFormState.difficultyLevel,
				servings: editFormState.servings,
				steps: editFormState.steps,
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

	const isOwner = useMemo(() => {
		if (!auth.isLoggedIn || !recipe || !recipe.user) return false;

		// Check if the logged-in user is the creator of this recipe
		return recipe.user.email === auth.userEmail;
	}, [auth.isLoggedIn, auth.userEmail, recipe]);

	return (
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
					width: { xs: "90%", sm: "550px" },
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
						<Typography color="error" align="center" variant="h6">
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
								<Grid item xs={6} sm={3}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
									>
										<AccessTimeIcon color="primary" />
										{isEditing ? (
											<TextField
												name="preparationTime"
												label="Prep Time"
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

								<Grid item xs={6} sm={3}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
									>
										<AccessTimeIcon color="secondary" />
										{isEditing ? (
											<TextField
												name="cookingTime"
												label="Cook Time"
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
												value={editFormState.servings}
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
											<FormControl fullWidth size="small">
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
												label={recipe.difficultyLevel}
												size="small"
												sx={{
													bgcolor: getDifficultyColor(
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
									<DateRangeIcon sx={{ color: "#0288d1" }} />
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
											editFormState.steps?.trim() === ""
										}
										helperText={
											editFormState.steps?.trim() === ""
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
									<Button
										variant="outlined"
										color="primary"
										startIcon={<EditIcon />}
										onClick={handleStartEditing}
									>
										Edit Recipe
									</Button>
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
	);
}

export default RecipeDetail;
