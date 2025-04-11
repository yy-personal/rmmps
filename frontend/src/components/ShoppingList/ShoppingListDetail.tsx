// src/components/ShoppingList/ShoppingListDetail.tsx

import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "../../hooks/http-hook";
import {
	GroupedItems,
	ShoppingList,
	ShoppingListItem,
} from "../../types/shopping-list";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";

// Icons
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DateRangeIcon from "@mui/icons-material/DateRange";

function ShoppingListDetail() {
	const navigate = useNavigate();
	const params = useParams<{ id: string }>();
	const auth = useContext(AuthContext);
	const { isLoading, sendRequest, serverError } = useHttpClient();

	const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
	const [groupedItems, setGroupedItems] = useState<GroupedItems>({});
	const [purchaseProgress, setPurchaseProgress] = useState<number>(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch shopping list details
	useEffect(() => {
		const fetchShoppingList = async () => {
			try {
				if (!params.id) {
					setError("Invalid shopping list ID");
					return;
				}

				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${params.id}`,
					"GET",
					null,
					{
						Authorization: `Bearer ${auth.accessToken}`,
					}
				);

				setShoppingList(responseData);

				// Group items by recipe
				const grouped: GroupedItems = {};
				responseData.items.forEach((item: ShoppingListItem) => {
					const key = item.recipeId ? `${item.recipeId}` : "Other";
					if (!grouped[key]) {
						grouped[key] = [];
					}
					grouped[key].push(item);
				});

				setGroupedItems(grouped);

				// Calculate purchase progress
				const totalItems = responseData.items.length;
				const purchasedItems = responseData.items.filter(
					(item: ShoppingListItem) => item.purchased
				).length;

				setPurchaseProgress((purchasedItems / totalItems) * 100 || 0);
			} catch (err) {
				console.error(err);
				setError("Failed to load shopping list details");
			}
		};

		if (auth.isLoggedIn) {
			fetchShoppingList();
		}
	}, [sendRequest, auth.accessToken, auth.isLoggedIn, params.id]);

	const handleTogglePurchased = async (
		shoppingListId: number,
		ingredientId: number,
		currentStatus: boolean
	) => {
		try {
			await sendRequest(
				`${
					process.env.REACT_APP_BACKEND_URL
				}/shopping-lists/${shoppingListId}/items/${ingredientId}?purchased=${!currentStatus}`,
				"PATCH",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			// Update local state after successful API call
			if (shoppingList) {
				const updatedItems = shoppingList.items.map((item) => {
					if (item.ingredientId === ingredientId) {
						return { ...item, purchased: !currentStatus };
					}
					return item;
				});

				const updatedList = { ...shoppingList, items: updatedItems };
				setShoppingList(updatedList);

				// Recalculate progress
				const totalItems = updatedItems.length;
				const purchasedItems = updatedItems.filter(
					(item) => item.purchased
				).length;
				setPurchaseProgress((purchasedItems / totalItems) * 100 || 0);

				// Update grouped items
				const grouped: GroupedItems = {};
				updatedItems.forEach((item: ShoppingListItem) => {
					const key = item.recipeId ? `${item.recipeId}` : "Other";
					if (!grouped[key]) {
						grouped[key] = [];
					}
					grouped[key].push(item);
				});
				setGroupedItems(grouped);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			if (!params.id) return;

			await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${params.id}`,
				"DELETE",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			setDeleteDialogOpen(false);
			navigate("/shopping");
		} catch (err) {
			console.error(err);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
	};

	const handleBack = () => {
		navigate("/shopping");
	};

	// Format the date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (!auth.isLoggedIn) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="info">
					Please log in to view shopping list details.
				</Alert>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error}</Alert>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={handleBack}
					sx={{ mt: 2 }}
				>
					Back to Shopping Lists
				</Button>
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
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						mb: 2,
					}}
				>
					<Box>
						<Button
							startIcon={<ArrowBackIcon />}
							onClick={handleBack}
							sx={{ mb: 2 }}
						>
							Back to Shopping Lists
						</Button>

						{shoppingList && (
							<>
								<Typography
									variant="h5"
									sx={{
										color: "#EB5A3C",
										fontWeight: "bold",
									}}
								>
									{shoppingList.title}
								</Typography>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										mt: 1,
									}}
								>
									<DateRangeIcon
										sx={{
											fontSize: 18,
											mr: 1,
											color: "#666",
										}}
									/>
									<Typography
										variant="body2"
										color="textSecondary"
									>
										Created on{" "}
										{formatDate(shoppingList.createdAt)}
									</Typography>
								</Box>
							</>
						)}
					</Box>

					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={handleDeleteClick}
					>
						Delete List
					</Button>
				</Box>

				{isLoading ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							mt: 4,
						}}
					>
						<CircularProgress sx={{ color: "#EB5A3C" }} />
					</Box>
				) : !shoppingList ? (
					<Box sx={{ textAlign: "center", py: 4 }}>
						<ShoppingCartIcon
							sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
						/>
						<Typography variant="h6" color="textSecondary">
							Shopping list not found.
						</Typography>
					</Box>
				) : (
					<Box>
						<Box sx={{ mb: 3 }}>
							<Typography variant="subtitle1" gutterBottom>
								Shopping Progress:{" "}
								{Math.round(purchaseProgress)}% Complete
							</Typography>
							<LinearProgress
								variant="determinate"
								value={purchaseProgress}
								sx={{
									height: 10,
									borderRadius: 5,
									backgroundColor: "#f0f0f0",
									"& .MuiLinearProgress-bar": {
										backgroundColor:
											purchaseProgress === 100
												? "#4caf50"
												: "#EB5A3C",
									},
								}}
							/>

							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									mt: 1,
								}}
							>
								<Typography
									variant="body2"
									color="textSecondary"
								>
									{
										shoppingList.items.filter(
											(item) => item.purchased
										).length
									}{" "}
									of {shoppingList.items.length} items
									purchased
								</Typography>
								{purchaseProgress === 100 && (
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
										}}
									>
										<CheckCircleOutlineIcon
											sx={{ color: "#4caf50", mr: 0.5 }}
										/>
										<Typography
											variant="body2"
											sx={{ color: "#4caf50" }}
										>
											Shopping complete!
										</Typography>
									</Box>
								)}
							</Box>
						</Box>

						<Divider sx={{ my: 2 }} />

						{Object.entries(groupedItems).length === 0 ? (
							<Box sx={{ textAlign: "center", py: 3 }}>
								<Typography
									variant="body1"
									color="textSecondary"
								>
									This shopping list is empty.
								</Typography>
							</Box>
						) : (
							Object.entries(groupedItems).map(
								([recipeId, items]) => {
									const recipe = items[0]?.recipeTitle;
									return (
										<Card key={recipeId} sx={{ mb: 3 }}>
											<CardHeader
												avatar={<RestaurantIcon />}
												title={recipe || "Other Items"}
												subheader={
													items[0]?.servings
														? `${items[0].servings} servings`
														: ""
												}
												sx={{
													backgroundColor: "#f8f8f8",
													borderBottom:
														"1px solid #eee",
												}}
											/>
											<CardContent sx={{ p: 0 }}>
												<List dense>
													{items.map((item) => (
														<ListItem
															key={
																item.ingredientId
															}
															secondaryAction={
																<Chip
																	label={
																		item.quantity
																	}
																	size="small"
																	variant="outlined"
																	sx={{
																		backgroundColor:
																			"#f0f0f0",
																	}}
																/>
															}
															sx={{
																textDecoration:
																	item.purchased
																		? "line-through"
																		: "none",
																color: item.purchased
																	? "#989898"
																	: "inherit",
																py: 1.5,
																px: 2,
																borderBottom:
																	"1px solid #f0f0f0",
																"&:last-child":
																	{
																		borderBottom:
																			"none",
																	},
															}}
														>
															<ListItemIcon>
																<Checkbox
																	edge="start"
																	checked={
																		item.purchased
																	}
																	onChange={() =>
																		handleTogglePurchased(
																			shoppingList.id,
																			item.ingredientId,
																			item.purchased
																		)
																	}
																	sx={{
																		color: "#EB5A3C",
																		"&.Mui-checked":
																			{
																				color: "#4caf50",
																			},
																	}}
																/>
															</ListItemIcon>
															<ListItemText
																primary={
																	item.ingredientName
																}
															/>
														</ListItem>
													))}
												</List>
											</CardContent>
										</Card>
									);
								}
							)
						)}
					</Box>
				)}
			</Paper>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
				<DialogTitle>Delete Shopping List</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this shopping list? This
						action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						autoFocus
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default ShoppingListDetail;
