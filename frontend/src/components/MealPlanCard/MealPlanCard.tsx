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
import MealPlanDetail from "../MealPlanDetail/MealPlanDetail";


// Define or import RecipeDetail type
interface RecipeDetail {
	recipeId: number;
	name: string;
	description: string;
	imageUrl: string;
}

interface User {
	userId: number;
	email: string;
}
 
interface MealPlanType {
	mealPlanId: number;
	title: string;
	frequency: number;
    mealsPerDay: number;
    startDate: Date;
    endDate: Date;
	user: User;
}

interface MealPlanProps extends MealPlanType {
	onOpenDetail: () => void;
  }

function MealPlanCard(props: MealPlanProps) {
	return (
		<>
			<Box
				sx={{
					width: { xs: "100%", sm: "100%", md: "50%", lg: "25%" },
					padding: "3px",
					boxSizing: "border-box",
				}}
			>
				<Card sx={{ cursor: "pointer" }} onClick={props.onOpenDetail}>
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
								props.onOpenDetail();
							}}
						>
							<InfoIcon />
						</IconButton>
					</CardActions>
				</Card>
			</Box>
		</>
	);
}

export default MealPlanCard;
