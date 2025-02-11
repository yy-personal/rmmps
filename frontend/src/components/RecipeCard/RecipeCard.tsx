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

interface RecipeStep {
  text: string;
  image: string | null;
}
interface RecipeType {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  creatorId: number;
  ingredients: string;
  steps: RecipeStep[];
}

function RecipeCard(props: RecipeType) {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardHeader title={props.title} subheader={props.creatorName} />
      <CardMedia
        component="img"
        height="194"
        image="https://www.dinneratthezoo.com/wp-content/uploads/2019/04/lobster-mac-and-cheese-6.jpg"
        alt="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
      </CardActions>
    </Card>
  );
}

export default RecipeCard;
