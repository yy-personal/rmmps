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

interface MealPlanDetailProps {
	mealPlanId: number | null;
	open: boolean;
	onClose: () => void;
}

interface MealPlanType {
	mealPlanId: number;
	title: string;
	frequency: number;
    mealsPerDay: number;
    startDate: Date;
    endDate: Date;
	user: User;
    createdAt: string;
}

function MealPlanDetail({ mealPlanId, open, onClose }: MealPlanDetailProps) {
	const auth = useContext(AuthContext);
	const { isLoading, sendRequest, serverError } = useHttpClient();
	const [MealPlan, setMealPlan] = useState<MealPlanType | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [editFormState, setEditFormState] = useState<Partial<MealPlanType>>({});

	useEffect(() => {
		const fetchMealPlan = async () => {
			if (!mealPlanId) return;

			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/mealPlans/${mealPlanId}`
				);
				setMealPlan(responseData);
				// Initialize edit form state with current MealPlan data
				setEditFormState({
					title: responseData.title,
					frequency: responseData.frequency,
					mealsPerDay: responseData.mealsPerDay,
					startDate: responseData.startDate,
					endDate: responseData.endDate
				});
			} catch (err) {
				console.log(err.message || serverError);
			}
		};

		if (open && mealPlanId) {
			fetchMealPlan();
			setIsEditing(false); // Reset editing mode when opening modal
		}
	}, [mealPlanId, open, sendRequest, serverError]);

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

	const handleStartEditing = () => {
		setIsEditing(true);
	};

	const handleCancelEditing = () => {
		if (MealPlan) {
			// Reset form to current MealPlan data
			setEditFormState({
                title: MealPlan.title,
                frequency: MealPlan.frequency,
                mealsPerDay: MealPlan.mealsPerDay,
                startDate: MealPlan.startDate,
                endDate: MealPlan.endDate
			});
		}
		setIsEditing(false);
	};

	const handleSaveEditing = async () => {
		if (!MealPlan || !mealPlanId) return;

		setIsSaving(true);
		try {
			// Prepare data for update
			const updateData = {
				...MealPlan,
				title: editFormState.title,
				frequency: editFormState.frequency,
				mealsPerDay: editFormState.mealsPerDay,
				startDate: editFormState.startDate,
				endDate: editFormState.endDate,
			};

			// Send update request
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/mealPlans/${mealPlanId}`,
				"PUT",
				JSON.stringify(updateData),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);

			// Update local MealPlan state with response
			setMealPlan(responseData);
			setIsEditing(false);
		} catch (err) {
			console.log(err.message || serverError);
		} finally {
			setIsSaving(false);
		}
	};

	const isOwner = useMemo(() => {
		if (!auth.isLoggedIn || !MealPlan || !MealPlan.user) return false;

		// Check if the logged-in user is the creator of this MealPlan
		return MealPlan.user.email === auth.userEmail;
	}, [auth.isLoggedIn, auth.userEmail, MealPlan]);

	return (
		<Modal
			open={open}
			onClose={onClose}
			aria-labelledby="MealPlan-detail-modal"
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
							{MealPlan?.title}
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

				{!isLoading && !MealPlan && serverError && (
					<Box sx={{ p: 3 }}>
						<Typography color="error" align="center" variant="h6">
							Error loading MealPlan
						</Typography>
						<Typography color="text.secondary" align="center">
							{serverError}
						</Typography>
					</Box>
				)}

				{!isLoading && MealPlan && (
					<>
						<Box sx={{ p: 3 }}>
							{/* MealPlan metadata in a grid */}
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
												name="frequency"
												label="Frequency"
												type="number"
												value={
													editFormState.frequency
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
												{MealPlan.frequency} min
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
												name="mealsPerDay"
												label="Meals Per Day"
												type="number"
												value={
													editFormState.mealsPerDay
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
												{MealPlan.mealsPerDay} min
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
												name="startDate"
												label="Start Date"
												type="date"
												value={editFormState.startDate}
												onChange={handleChange}
												variant="outlined"
												size="small"
												fullWidth
											/>
										) : (
											<Typography>
												{MealPlan.startDate.toLocaleDateString()}
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
												name="endDate"
												label="End Date"
												type="date"
												value={editFormState.endDate}
												onChange={handleChange}
												variant="outlined"
												size="small"
												fullWidth
											/>
										) : (
											<Typography>
												{MealPlan.endDate.toLocaleDateString()}
											</Typography>
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
										Created by {MealPlan.user.email}
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
											MealPlan.createdAt
										).toLocaleDateString()}
									</Typography>
								</Stack>
							</Box>

							<Divider sx={{ my: 2 }} />

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
										Edit MealPlan
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

export default MealPlanDetail;
