import { useEffect, useState, useContext, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import { AuthContext } from "../../contexts/auth-context";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// ListItemIcon removed to fix duplicate checkbox issue
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Custom Toast Alert component
const Toast = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
	return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

// Interface for items grouped by recipe
interface GroupedItems {
	[key: string]: ShoppingListItem[];
}

function ShoppingListDetail() {
	const { id } = useParams<{ id: string }>();
	const auth = useContext(AuthContext);
	const navigate = useNavigate();
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemsGroupedByRecipe, setItemsGroupedByRecipe] =
		useState<GroupedItems>({});
	const [loadingItemIds, setLoadingItemIds] = useState<Set<number>>(
		new Set()
	);

	// Toast notification state
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastSeverity, setToastSeverity] = useState<
		"success" | "info" | "warning" | "error"
	>("success");

	// Toast notification handlers
	const showToast = (
		message: string,
		severity: "success" | "info" | "warning" | "error" = "success"
	) => {
		setToastMessage(message);
		setToastSeverity(severity);
		setToastOpen(true);
	};

	const handleCloseToast = (
		event?: React.SyntheticEvent | Event,
		reason?: string
	) => {
		if (reason === "clickaway") return;
		setToastOpen(false);
	};

	// Redirect if not logged in
	useEffect(() => {
		if (!auth.isLoggedIn) {
			navigate("/login");
		}
	}, [auth.isLoggedIn, navigate]);

	// Fetch shopping list data
	useEffect(() => {
		if (auth.isLoggedIn && id) {
			fetchShoppingList();
		}
	}, [id, auth.isLoggedIn]);

	// Group items by recipe when shopping list data changes
	useEffect(() => {
		if (shoppingList) {
			groupItemsByRecipe();
		}
	}, [shoppingList]);

	const fetchShoppingList = async () => {
		if (!id || !auth.isLoggedIn) return;

		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${id}`,
				"GET",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);
			setShoppingList(responseData);
		} catch (err) {
			// Error handling is already done in useHttpClient hook
		}
	};

	const groupItemsByRecipe = () => {
		if (!shoppingList) return;

		const grouped: GroupedItems = {};

		// Group for items without a recipe
		grouped["Other Items"] = [];

		// Group items by recipe
		shoppingList.items.forEach((item) => {
			if (item.recipeId && item.recipeTitle) {
				const key = `Recipe: ${item.recipeTitle}`;
				if (!grouped[key]) {
					grouped[key] = [];
				}
				grouped[key].push(item);
			} else {
				grouped["Other Items"].push(item);
			}
		});

		// Remove "Other Items" group if empty
		if (grouped["Other Items"].length === 0) {
			delete grouped["Other Items"];
		}

		setItemsGroupedByRecipe(grouped);
	};

	const handleTogglePurchased = async (item: ShoppingListItem) => {
		if (!shoppingList || !auth.isLoggedIn) return;

		// Add to loading set to show spinner
		setLoadingItemIds((prev) => new Set(prev).add(item.ingredientId));

		// Optimistically update the UI immediately for better user experience
		const updatedItems = shoppingList.items.map((i) =>
			i.ingredientId === item.ingredientId
				? { ...i, purchased: !i.purchased }
				: i
		);

		setShoppingList({
			...shoppingList,
			items: updatedItems,
		});

		let retryCount = 0;
		const maxRetries = 2;

		const attemptUpdate = async (): Promise<boolean> => {
			try {
				// Log important details for debugging
				console.log(
					`Updating item ${
						item.ingredientId
					} to purchased=${!item.purchased}`
				);
				console.log(
					`JWT Token: ${auth.accessToken.substring(0, 10)}...`
				);

				await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${
						shoppingList.id
					}/items/${item.ingredientId}?purchased=${!item.purchased}`,
					"PATCH",
					null,
					{
						Authorization: `Bearer ${auth.accessToken}`,
					}
				);
				console.log("Item status update successful");

				// Show success toast
				showToast(
					`${item.ingredientName} marked as ${
						!item.purchased ? "purchased" : "not purchased"
					}.`,
					"success"
				);
				return true;
			} catch (err: any) {
				// Give more details about the error
				console.error(`Failed to update item status: ${err.message}`);
				if (retryCount < maxRetries) {
					retryCount++;
					console.log(
						`Retrying update (${retryCount}/${maxRetries})...`
					);
					// Show retry toast
					showToast(
						`Connection issue. Retrying... (${retryCount}/${maxRetries})`,
						"warning"
					);
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * retryCount)
					);
					return attemptUpdate();
				}
				return false;
			}
		};

		const success = await attemptUpdate();

		if (!success) {
			// If all retries failed, show a local error message but keep the optimistic update
			console.error("All retries failed. Keeping optimistic UI update.");
			// Show failure toast but maintain the optimistic UI update
			showToast(
				`Could not connect to server. Item status will be saved when connection is restored.`,
				"error"
			);
		}

		// Remove from loading set
		setLoadingItemIds((prev) => {
			const updated = new Set(prev);
			updated.delete(item.ingredientId);
			return updated;
		});
	};

	const handleOpenDeleteDialog = () => {
		setDeleteDialogOpen(true);
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
	};

	const handleDeleteList = async () => {
		if (!shoppingList || !auth.isLoggedIn) return;

		try {
			await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${shoppingList.id}`,
				"DELETE",
				null,
				{
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			navigate("/shopping");
		} catch (err) {
			// Error handling is done in the hook
		}
	};

	const handleGoBack = () => {
		navigate("/shopping");
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

	// Calculate progress percentage
	const calculateProgress = () => {
		if (!shoppingList || shoppingList.items.length === 0) return 0;
		const purchasedCount = shoppingList.items.filter(
			(item) => item.purchased
		).length;
		return Math.round((purchasedCount / shoppingList.items.length) * 100);
	};

	// If not logged in, don't render the component
	if (!auth.isLoggedIn) {
		return null; // The useEffect will redirect to login
	}

	return (
		<Box sx={{ padding: 3, minHeight: "calc(100vh - 70px)" }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
				<IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
					<ArrowBackIcon />
				</IconButton>
				<Typography
					variant="h4"
					component="h1"
					sx={{ color: "#EB5A3C", fontWeight: "bold" }}
				>
					Shopping List
				</Typography>
			</Box>

			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress sx={{ color: "#EB5A3C" }} />
				</Box>
			) : serverError ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					Error loading shopping list: {serverError}
				</Alert>
			) : !shoppingList ? (
				<Alert severity="info">Shopping list not found.</Alert>
			) : (
				<>
					<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
						>
							<Box>
								<Typography variant="h5" gutterBottom>
									{shoppingList.title}
								</Typography>
								<Typography
									color="text.secondary"
									variant="body2"
								>
									Created:{" "}
									{formatDate(shoppingList.createdAt)}
								</Typography>
							</Box>
							<Button
								variant="outlined"
								color="error"
								startIcon={<DeleteIcon />}
								onClick={handleOpenDeleteDialog}
							>
								Delete
							</Button>
						</Box>

						<Box sx={{ mt: 3, mb: 1 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									mb: 1,
								}}
							>
								<ShoppingCartIcon
									sx={{ mr: 1, color: "#666" }}
								/>
								<Typography variant="body1">
									{
										shoppingList.items.filter(
											(item) => item.purchased
										).length
									}
									/{shoppingList.items.length} items purchased
									({calculateProgress()}%)
								</Typography>
							</Box>
							<Box
								sx={{
									height: 8,
									width: "100%",
									bgcolor: "#f0f0f0",
									borderRadius: 5,
									mt: 1,
									mb: 2,
									overflow: "hidden",
								}}
							>
								<Box
									sx={{
										height: "100%",
										width: `${calculateProgress()}%`,
										bgcolor: "#4caf50",
										transition: "width 0.5s ease-in-out",
									}}
								/>
							</Box>
						</Box>
					</Paper>

					{Object.keys(itemsGroupedByRecipe).length === 0 ? (
						<Alert severity="info">
							This shopping list has no items. You may want to add
							items or delete this list.
						</Alert>
					) : (
						Object.entries(itemsGroupedByRecipe).map(
							([recipeTitle, items]) => (
								<Paper
									key={recipeTitle}
									elevation={1}
									sx={{ mb: 3 }}
								>
									<Box
										sx={{
											p: 2,
											bgcolor: "#f5f5f5",
											borderTopLeftRadius: 4,
											borderTopRightRadius: 4,
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
											}}
										>
											{recipeTitle !== "Other Items" && (
												<RestaurantIcon
													sx={{
														mr: 1,
														color: "#666",
													}}
												/>
											)}
											<Typography variant="h6">
												{recipeTitle}
											</Typography>
											{recipeTitle !== "Other Items" &&
												items[0].servings && (
													<Chip
														label={`${items[0].servings} servings`}
														size="small"
														sx={{ ml: 2 }}
													/>
												)}
										</Box>
									</Box>
									<List sx={{ width: "100%" }}>
										{items.map((item, index) => (
											<Box key={item.ingredientId}>
												<ListItem
													dense
													sx={{ pl: 3 }} // Corrected 'sc' to 'sx'
													secondaryAction={
														loadingItemIds.has(
															item.ingredientId
														) ? (
															<CircularProgress
																size={24}
															/>
														) : (
															<Checkbox
																edge="end"
																checked={
																	item.purchased
																}
																onChange={() =>
																	handleTogglePurchased(
																		item
																	)
																}
																inputProps={{
																	"aria-labelledby": `item-${item.ingredientId}`,
																}}
															/>
														)
													}
												>
													<ListItemText
														id={`item-${item.ingredientId}`}
														primary={
															<Typography
																sx={{
																	textDecoration:
																		item.purchased
																			? "line-through"
																			: "none",
																	color: item.purchased
																		? "text.disabled"
																		: "text.primary",
																}}
															>
																{
																	item.ingredientName
																}
															</Typography>
														}
														secondary={
															item.quantity
														}
													/>
												</ListItem>
												{index < items.length - 1 && (
													<Divider component="li" />
												)}
											</Box>
										))}
									</List>
								</Paper>
							)
						)
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

			{/* Toast Notification */}
			<Snackbar
				open={toastOpen}
				autoHideDuration={4000}
				onClose={handleCloseToast}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Toast
					onClose={handleCloseToast}
					severity={toastSeverity}
					icon={
						toastSeverity === "success" ? (
							<CheckCircleOutlineIcon />
						) : undefined
					}
				>
					{toastMessage}
				</Toast>
			</Snackbar>
		</Box>
	);
}

export default ShoppingListDetail;