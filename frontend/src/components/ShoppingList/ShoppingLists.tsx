import { useEffect, useState, useContext, useCallback } from "react"; // Added useCallback
import { useNavigate } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook"; // Adjust path if needed
import { AuthContext } from "../../contexts/auth-context"; // Adjust path if needed
import CreateShoppingListModal from "./CreateShoppingList"; // Import the modal component (adjust path/name if needed)

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

// Icons
import AddIcon from "@mui/icons-material/Add"; // Keep AddIcon for the button
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Interfaces (keep as they are)
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

function ShoppingLists() {
	const auth = useContext(AuthContext);
	const navigate = useNavigate();
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [pageSize] = useState(5);
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortDir, setSortDir] = useState("desc");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedListId, setSelectedListId] = useState<number | null>(null);

	// --- State for Create Modal ---
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// --- Fetch Shopping Lists (Wrapped in useCallback) ---
	const fetchShoppingLists = useCallback(async () => {
		if (!auth.isLoggedIn) return;
		console.log(`Workspaceing page ${page}, sort: ${sortBy} ${sortDir}`); // Debug log
		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists?page=${page}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`,
				"GET",
				null,
				{ Authorization: `Bearer ${auth.accessToken}` }
			);

			// Handle potential pagination response structure
			if (
				responseData &&
				typeof responseData === "object" &&
				"content" in responseData
			) {
				setShoppingLists(responseData.content || []);
				setTotalPages(responseData.totalPages || 1);
			} else if (Array.isArray(responseData)) {
				// Fallback if API returns just an array
				setShoppingLists(responseData);
				// Estimate total pages if not provided by backend (might be inaccurate)
				setTotalPages(Math.ceil(responseData.length / pageSize) || 1);
			} else {
				console.warn(
					"Unexpected response format for shopping lists:",
					responseData
				);
				setShoppingLists([]);
				setTotalPages(1);
			}
		} catch (err) {
			console.error("Failed to fetch shopping lists:", err);
			// Error state is already handled by the hook, maybe clear local list on error?
			// setShoppingLists([]);
			// setTotalPages(1);
		}
		// Include ALL external variables used inside as dependencies
	}, [
		auth.isLoggedIn,
		auth.accessToken,
		page,
		pageSize,
		sortBy,
		sortDir,
		sendRequest,
	]);

	// Fetch lists when parameters change or user logs in
	useEffect(() => {
		if (auth.isLoggedIn) {
			fetchShoppingLists();
		} else {
			// Clear list if user logs out
			setShoppingLists([]);
			setTotalPages(1);
			setPage(0);
		}
	}, [auth.isLoggedIn, fetchShoppingLists]); // fetchShoppingLists is now stable due to useCallback

	// --- Handlers ---
	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number
	) => {
		setPage(value - 1); // Pagination component is 1-based, state is 0-based
	};

	const handleSortChange = (event: SelectChangeEvent) => {
		setPage(0); // Reset to first page on sort change
		setSortBy(event.target.value);
	};

	const handleSortDirChange = (event: SelectChangeEvent) => {
		setPage(0); // Reset to first page on sort change
		setSortDir(event.target.value);
	};

	// --- Modal Handlers ---
	const handleOpenCreateModal = () => {
		setIsCreateModalOpen(true);
	};

	const handleCloseCreateModal = () => {
		setIsCreateModalOpen(false);
	};

	const handleCreateSuccess = useCallback(
		(newListId: number) => {
			console.log(
				`New list created with ID: ${newListId}. Refreshing list.`
			);
			handleCloseCreateModal(); // Close the modal
			setPage(0); // Go back to first page to likely see the new list
			fetchShoppingLists(); // Re-fetch the shopping lists
		},
		[fetchShoppingLists]
	); // Depends only on the stable fetchShoppingLists now

	// --- View/Delete Handlers (Unchanged) ---
	const handleViewList = (id: number) => {
		navigate(`/shopping/${id}`);
	};

	const handleOpenDeleteDialog = (id: number) => {
		setSelectedListId(id);
		setDeleteDialogOpen(true);
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setSelectedListId(null);
	};

	const handleDeleteList = async () => {
		if (!selectedListId) return;
		try {
			await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/shopping-lists/${selectedListId}`,
				"DELETE",
				null,
				{ Authorization: `Bearer ${auth.accessToken}` }
			);
			handleCloseDeleteDialog();
			// Re-fetch data to ensure consistency after delete, especially with pagination
			fetchShoppingLists();
			// Or optimistically remove from state (less safe with pagination/sorting)
			// setShoppingLists(shoppingLists.filter((list) => list.id !== selectedListId));
		} catch (err) {
			console.error("Error deleting shopping list:", err);
			// Potentially show error to user
		}
	};

	// --- Helper Functions (Unchanged) ---
	const countPurchasedItems = (items: ShoppingListItem[]) => {
		return items.filter((item) => item.purchased).length;
	};
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return (
			date.toLocaleDateString() +
			" " +
			date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		);
	};

	// --- Render Logic ---

	// Login Prompt (Unchanged)
	if (!auth.isLoggedIn) {
		return (
			<Box sx={{ padding: 3, minHeight: "calc(100vh - 70px)" }}>
				<Typography
					variant="h4"
					component="h1"
					sx={{ color: "#EB5A3C", fontWeight: "bold", mb: 3 }}
				>
					Shopping Lists
				</Typography>
				<Alert severity="info" sx={{ mb: 3 }}>
					Please log in to view and manage your shopping lists.
				</Alert>
				<Button
					variant="contained"
					onClick={() => navigate("/login")}
					sx={{
						backgroundColor: "#EB5A3C",
						"&:hover": { backgroundColor: "#d23c22" },
					}}
				>
					Go to Login
				</Button>
			</Box>
		);
	}

	// Main Content
	return (
		<Box sx={{ padding: 3, minHeight: "calc(100vh - 70px)" }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
				}}
			>
				<Typography
					variant="h4"
					component="h1"
					sx={{ color: "#EB5A3C", fontWeight: "bold" }}
				>
					Shopping Lists
				</Typography>
				{/* --- Modified Button --- */}
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleOpenCreateModal} // Changed handler
					sx={{
						backgroundColor: "#EB5A3C",
						"&:hover": { backgroundColor: "#d23c22" },
					}}
				>
					Create Shopping List
				</Button>
			</Box>

			{/* Sorting Controls (Unchanged) */}
			<Box
				sx={{
					display: "flex",
					mb: 3,
					alignItems: "center",
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				{" "}
				{/* Added wrap and gap */}
				<SortIcon sx={{ mr: 1, color: "#666" }} />
				<FormControl sx={{ minWidth: 150 }} size="small">
					<InputLabel id="sort-by-label">Sort By</InputLabel>
					<Select
						labelId="sort-by-label"
						value={sortBy}
						label="Sort By"
						onChange={handleSortChange}
					>
						<MenuItem value="createdAt">Created Date</MenuItem>
						<MenuItem value="title">Title</MenuItem>
					</Select>
				</FormControl>
				<FormControl sx={{ minWidth: 150 }} size="small">
					<InputLabel id="sort-dir-label">Order</InputLabel>
					<Select
						labelId="sort-dir-label"
						value={sortDir}
						label="Order"
						onChange={handleSortDirChange}
					>
						<MenuItem value="desc">Newest First</MenuItem>
						<MenuItem value="asc">Oldest First</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Loading/Error/Empty State */}
			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress sx={{ color: "#EB5A3C" }} />
				</Box>
			) : serverError ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					Error loading shopping lists: {serverError}
				</Alert>
			) : shoppingLists.length === 0 ? (
				// Empty State (uses the modal button now)
				<Box sx={{ textAlign: "center", py: 6 }}>
					<ShoppingCartIcon
						sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
					/>
					<Typography variant="h6" color="text.secondary">
						No shopping lists found
					</Typography>
					<Typography color="text.secondary" sx={{ mb: 3 }}>
						Create your first shopping list to get started
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenCreateModal}
						sx={{
							backgroundColor: "#EB5A3C",
							"&:hover": { backgroundColor: "#d23c22" },
						}}
					>
						Create Shopping List
					</Button>
				</Box>
			) : (
				// List Display
				<>
					<Grid container spacing={3}>
						{shoppingLists.map((list) => (
							<Grid item xs={12} sm={6} md={4} key={list.id}>
								<Card
									sx={{
										height: "100%",
										display: "flex",
										flexDirection: "column",
									}}
								>
									<CardContent sx={{ flexGrow: 1 }}>
										<Typography
											variant="h6"
											component="h2"
											gutterBottom
										>
											{list.title}
										</Typography>
										<Typography
											color="text.secondary"
											variant="body2"
											gutterBottom
										>
											Created:{" "}
											{formatDate(list.createdAt)}
										</Typography>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												mt: 2,
											}}
										>
											<ShoppingCartIcon
												fontSize="small"
												sx={{ mr: 1, color: "#666" }}
											/>
											<Typography variant="body2">
												{countPurchasedItems(
													list.items
												)}
												/{list.items.length} items
												purchased
											</Typography>
										</Box>
									</CardContent>
									<CardActions>
										<Button
											size="small"
											startIcon={<VisibilityIcon />}
											onClick={() =>
												handleViewList(list.id)
											}
										>
											View
										</Button>
										<IconButton
											size="small"
											color="error"
											onClick={() =>
												handleOpenDeleteDialog(list.id)
											}
											sx={{ ml: "auto" }}
										>
											<DeleteIcon />
										</IconButton>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>

					{/* Pagination */}
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
								page={page + 1}
								onChange={handlePageChange}
								color="primary"
							/>
						</Box>
					)}
				</>
			)}

			{/* Delete Confirmation Dialog (Unchanged) */}
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

			{/* --- Render Create Modal --- */}
			<CreateShoppingListModal
				open={isCreateModalOpen}
				onClose={handleCloseCreateModal}
				onSuccess={handleCreateSuccess}
			/>
			{/* --- End Render Create Modal --- */}
		</Box>
	);
}

export default ShoppingLists;
