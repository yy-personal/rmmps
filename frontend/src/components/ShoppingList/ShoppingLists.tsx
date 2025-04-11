// src/components/ShoppingList/ShoppingLists.tsx

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "../../hooks/http-hook";
import { ShoppingList } from "../../types/shopping-list";

// Material UI imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";

// Icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DateRangeIcon from "@mui/icons-material/DateRange";
import VisibilityIcon from "@mui/icons-material/Visibility";

function ShoppingLists() {
	const navigate = useNavigate();
	const auth = useContext(AuthContext);
	const { isLoading, sendRequest, serverError } = useHttpClient();

	const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [listToDelete, setListToDelete] = useState<number | null>(null);

	// Fetch shopping lists
	useEffect(() => {
		const fetchShoppingLists = async () => {
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/shopping-lists?page=${page}&size=6&sortBy=createdAt&sortDir=desc`,
					"GET",
					null,
					{
						Authorization: `Bearer ${auth.accessToken}`,
					}
				);
				setShoppingLists(responseData);

				// Assuming the backend returns total pages in headers or data
				// Adjust this based on your actual API response structure
				setTotalPages(Math.ceil(responseData.length / 6) || 1);
			} catch (err) {
				console.error(err);
			}
		};

		if (auth.isLoggedIn) {
			fetchShoppingLists();
		}
	}, [sendRequest, auth.accessToken, auth.isLoggedIn, page]);

	const handleCreateShoppingList = () => {
		navigate("/shopping/create");
	};

	const handleViewShoppingList = (id: number) => {
		navigate(`/shopping/${id}`);
	};

	const handleDeleteClick = (id: number) => {
		setListToDelete(id);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (listToDelete !== null) {
			try {
				await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${listToDelete}`,
					"DELETE",
					null,
					{
						Authorization: `Bearer ${auth.accessToken}`,
					}
				);
				// Update the list after successful deletion
				setShoppingLists(
					shoppingLists.filter((list) => list.id !== listToDelete)
				);
				setDeleteDialogOpen(false);
				setListToDelete(null);
			} catch (err) {
				console.error(err);
			}
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setListToDelete(null);
	};

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setPage(value - 1); // API uses 0-based pagination
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
					Please log in to view your shopping lists.
				</Alert>
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
			<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Typography
						variant="h5"
						sx={{ color: "#EB5A3C", fontWeight: "bold" }}
					>
						My Shopping Lists
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleCreateShoppingList}
						sx={{
							backgroundColor: "#EB5A3C",
							"&:hover": { backgroundColor: "#d23c22" },
						}}
					>
						Create New Shopping List
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
				) : shoppingLists.length === 0 ? (
					<Box sx={{ textAlign: "center", py: 4 }}>
						<ShoppingCartIcon
							sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
						/>
						<Typography variant="h6" color="textSecondary">
							You don't have any shopping lists yet.
						</Typography>
						<Typography color="textSecondary" sx={{ mb: 3 }}>
							Create a shopping list to get started.
						</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleCreateShoppingList}
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
											transition:
												"transform 0.2s, box-shadow 0.2s",
											"&:hover": {
												transform: "translateY(-5px)",
												boxShadow:
													"0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
											},
										}}
									>
										<CardContent sx={{ flexGrow: 1 }}>
											<Typography
												variant="h6"
												gutterBottom
											>
												{list.title}
											</Typography>

											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 1,
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
													{formatDate(list.createdAt)}
												</Typography>
											</Box>

											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 2,
												}}
											>
												<RestaurantIcon
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
													{list.items.length} item
													{list.items.length !== 1
														? "s"
														: ""}
												</Typography>
											</Box>

											<Divider sx={{ my: 1 }} />

											<Box sx={{ mb: 1 }}>
												<Typography
													variant="body2"
													color="textSecondary"
													sx={{ mb: 1 }}
												>
													Shopping Status:
												</Typography>
												<Box
													sx={{
														display: "flex",
														gap: 1,
													}}
												>
													<Chip
														label={`${
															list.items.filter(
																(item) =>
																	item.purchased
															).length
														} Purchased`}
														size="small"
														color="success"
														variant="outlined"
													/>
													<Chip
														label={`${
															list.items.filter(
																(item) =>
																	!item.purchased
															).length
														} Remaining`}
														size="small"
														color="warning"
														variant="outlined"
													/>
												</Box>
											</Box>
										</CardContent>
										<CardActions
											sx={{
												justifyContent: "space-between",
												p: 2,
												pt: 0,
											}}
										>
											<Button
												startIcon={<VisibilityIcon />}
												onClick={() =>
													handleViewShoppingList(
														list.id
													)
												}
												sx={{ color: "#EB5A3C" }}
											>
												View
											</Button>
											<IconButton
												onClick={() =>
													handleDeleteClick(list.id)
												}
												color="error"
												size="small"
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
									page={page + 1} // API uses 0-based pagination
									onChange={handlePageChange}
									color="primary"
								/>
							</Box>
						)}
					</>
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

export default ShoppingLists;
