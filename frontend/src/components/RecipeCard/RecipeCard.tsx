import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import InfoIcon from "@mui/icons-material/Info";
import RecipeDetail from "../RecipeDetail/RecipeDetail";

interface User {
	userId: number;
	email: string;
}

interface RecipeType {
	recipeId: number;
	title: string;
	description: string;
	user: User;
	preparationTime: number;
	cookingTime: number;
	difficultyLevel: string;
	servings: number;
	steps: string;
}

function RecipeCard(props: RecipeType) {
	const [detailOpen, setDetailOpen] = useState(false);

	const handleOpenDetail = () => {
		setDetailOpen(true);
	};

	const handleCloseDetail = () => {
		setDetailOpen(false);
	};

	return (
		<>
			<Box
				sx={{
					width: { xs: "100%", sm: "100%", md: "50%", lg: "25%" },
					padding: "3px",
					boxSizing: "border-box",
				}}
			>
				<Card sx={{ cursor: "pointer" }} onClick={handleOpenDetail}>
					<CardHeader
						title={props.title}
						subheader={`By: ${props.user.email}`}
					/>
					<CardMedia
						component="img"
						height="194"
						image="https://www.dinneratthezoo.com/wp-content/uploads/2019/04/lobster-mac-and-cheese-6.jpg"
						alt="Paella dish"
					/>
					<CardContent>
						<Typography
							variant="body2"
							sx={{ color: "text.secondary" }}
						>
							{props.description}
						</Typography>
					</CardContent>
					<CardActions disableSpacing>
						<IconButton aria-label="add to favorites">
							<FavoriteIcon />
						</IconButton>
						<IconButton aria-label="share">
							<ShareIcon />
						</IconButton>
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
			/>
		</>
	);
}

export default RecipeCard;
