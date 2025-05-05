import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import KitchenIcon from "@mui/icons-material/Kitchen";
import Avatar from "@mui/material/Avatar";
import RecipeDetail from "../RecipeDetail/RecipeDetail";
import { useHttpClient } from "hooks/http-hook";

interface MealType {
	mealTypeId: number;
	name: string;
}

interface RecipeIngredient {
	ingredientId?: number;
	name: string;
	quantity: string;
}

interface User {
	userId: number;
	email: string;
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

// Function to generate a unique background color based on recipe title
const generateBackgroundColor = (title: string) => {
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = hash % 360;
	return `hsl(${hue}, 70%, 80%)`;
};

// Function to get a food image based on meal type
const getMealTypeImage = (mealTypes?: MealType[]) => {
	// Default image path (for "Other" category)
	let imagePath = "/images/food/other.jpeg";

	// Return default if no meal types provided
	if (!mealTypes || mealTypes.length === 0) {
		return imagePath;
	}

	// Get the first meal type
	const firstMealType = mealTypes[0];

	// Select image based on meal type ID
	switch (firstMealType.mealTypeId) {
		case 1:
			return "/images/food/breakfast.jpeg";
		case 2:
			return "/images/food/lunch.jpeg";
		case 3:
			return "/images/food/dinner.jpeg";
		case 4:
			return "/images/food/dessert.jpeg";
		case 5:
			return "/images/food/snack.jpeg";
		default:
			return "/images/food/other.jpeg";
	}
};

// Function to get difficulty level color
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

// Function to get user initials for avatar
const getUserInitials = (email?: string) => {
	if (!email) return "U"; 
	// Get the part before @ symbol
	const username = email.split("@")[0];
	// Return first character or first two characters
	if (username.length <= 1) return username.toUpperCase();
	return username.substring(0, 2).toUpperCase();
};

function RecipeCard(props: RecipeType) {
	const [detailOpen, setDetailOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
	const { sendRequest, serverError } = useHttpClient();
	const [isDeleted, setIsDeleted] = useState(false);

	useEffect(() => {
		// Fetch ingredients for this recipe
		const fetchIngredients = async () => {
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/recipes/${props.recipeId}/ingredients`
				);
				setIngredients(responseData || []);
			} catch (err) {
				console.log(err.message || serverError);
			}
		};

		fetchIngredients();
	}, [props.recipeId, sendRequest, serverError]);

	const handleOpenDetail = () => {
		setDetailOpen(true);
	};

	const handleCloseDetail = () => {
		setDetailOpen(false);
	};

	// Generate background color based on recipe title
	const backgroundColor = generateBackgroundColor(props.title);

	// Get total time (prep + cooking)
	const totalTime = props.preparationTime + props.cookingTime;

	const handleRecipeDeleted = (deletedId: number) => {
		setIsDeleted(true); // Trigger unmount
		onCloseDetail();
	};

	const onCloseDetail = () => setDetailOpen(false);

	if (isDeleted) return null; // This unmounts the component

	return (
		<>
			<Box
				sx={{
					width: { xs: "100%", sm: "100%", md: "50%", lg: "33.33%" },
					padding: "10px",
					boxSizing: "border-box",
				}}
			>
				<Card
					sx={{
						cursor: "pointer",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						transition: "transform 0.2s, box-shadow 0.2s",
						transform: isHovered ? "translateY(-5px)" : "none",
						boxShadow: isHovered
							? "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
							: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
					}}
					onClick={handleOpenDetail}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					<CardHeader
						avatar={
							<Avatar sx={{ bgcolor: backgroundColor }}>
								{getUserInitials(props.user?.email)}
							</Avatar>
						}
						title={props.title}
						titleTypographyProps={{ fontWeight: "bold" }}
						subheader={
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									mt: 0.5,
								}}
							>
								<AccessTimeIcon
									fontSize="small"
									sx={{ mr: 0.5, color: "text.secondary" }}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{props.preparationTime + props.cookingTime}{" "}
									min
								</Typography>
							</Box>
						}
					/>
					<CardMedia
						component="img"
						sx={{
							height: "200px", // Adjust height as needed
							objectFit: "cover", // Ensures the image covers the container
							objectPosition: "center bottom", // Focus on the bottom of the image
							borderTop: "1px solid rgba(0,0,0,0.1)",
							borderBottom: "1px solid rgba(0,0,0,0.1)",
						}}
						image={getMealTypeImage(props.mealTypes)}
						alt={props.title}
					/>
					<CardContent sx={{ flexGrow: 1, pb: 1 }}>
						{/* Quick info chips */}
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: 0.5,
								mb: 1.5,
							}}
						>
							<Chip
								icon={<AccessTimeIcon />}
								label={`${totalTime} min`}
								size="small"
								variant="outlined"
							/>
							<Chip
								icon={<RestaurantIcon />}
								label={`${props.servings} servings`}
								size="small"
								variant="outlined"
							/>
							<Chip
								icon={<SignalCellularAltIcon />}
								label={
									props.difficultyLevel.charAt(0) +
									props.difficultyLevel.slice(1).toLowerCase()
								}
								size="small"
								sx={{
									bgcolor: getDifficultyColor(
										props.difficultyLevel
									),
									color: "white",
								}}
							/>
						</Box>

						{/* Ingredients preview */}
						{ingredients.length > 0 && (
							<Box sx={{ mt: 1 }}>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 0.5,
										mb: 0.5,
										fontWeight: "medium",
									}}
								>
									<KitchenIcon fontSize="small" />
									Ingredients:
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{ingredients
										.slice(0, 3)
										.map((ing) => ing.name)
										.join(", ")}
									{ingredients.length > 3 &&
										` and ${ingredients.length - 3} more`}
								</Typography>
							</Box>
						)}

						{/* Meal types */}
						{props.mealTypes && props.mealTypes.length > 0 && (
							<Box sx={{ mt: 1 }}>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 0.5 }}
								>
									Meal types:
								</Typography>
								<Box
									sx={{
										display: "flex",
										flexWrap: "wrap",
										gap: 0.5,
									}}
								>
									{props.mealTypes.map((type) => (
										<Chip
											key={type.mealTypeId}
											label={type.name}
											size="small"
											color="secondary"
											variant="outlined"
											sx={{
												height: 20,
												fontSize: "0.7rem",
											}}
										/>
									))}
								</Box>
							</Box>
						)}
					</CardContent>
					<CardActions
						disableSpacing
						sx={{
							mt: "auto",
							borderTop: "1px solid rgba(0,0,0,0.05)",
						}}
					>
						<IconButton
							aria-label="view details"
							sx={{ marginLeft: "auto" }}
							onClick={(e) => {
								e.stopPropagation();
								handleOpenDetail();
							}}
						>
							<InfoIcon />
						</IconButton>
					</CardActions>
				</Card>
			</Box>

			<RecipeDetail
				recipeId={props.recipeId}
				open={detailOpen}
				onClose={handleCloseDetail}
				onRecipeDeleted={handleRecipeDeleted}
			/>
		</>
	);
}

export default RecipeCard;
