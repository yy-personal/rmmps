import { useContext, useState} from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";

import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "hooks/http-hook";
import { toast } from "react-toastify";


function MealPlanForm() {
	const auth = useContext(AuthContext);
	const navigate = useNavigate();
	const [mealPlanFormState, setMealPlanFormState] = useState({
		title: "",
		frequency: "",
		mealsPerDay: "",
		startDate: "",
		endDate: "",
	});

	const [submitAttempted, setSubmitAttempted] = useState(false);

	const { isLoading, sendRequest, statusCode, serverError } = useHttpClient();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		setMealPlanFormState({
			...mealPlanFormState,
			// For number inputs, allow empty string (when backspacing) or convert to number
			[name]:
				type === "number" ? (value === "" ? "" : Number(value)) : value,
		});
	};

	// Validate the form
	const validateForm = () => {
		return (
			mealPlanFormState.title.trim() !== "" &&
			(mealPlanFormState.frequency === "" ||
				Number(mealPlanFormState.frequency) > 0) &&
			(mealPlanFormState.mealsPerDay === "" ||
				Number(mealPlanFormState.mealsPerDay) > 0) &&
			(mealPlanFormState.startDate === "" || 
				new Date(mealPlanFormState.startDate).toString() !== "") &&
			(mealPlanFormState.endDate === "" || 
					new Date(mealPlanFormState.startDate).toString() !== "")
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitAttempted(true);

		if (!validateForm()) {
			return;
		}

		try {
			const responseData = await sendRequest(
				`${process.env.REACT_APP_BACKEND_URL}/mealPlans/create`,
				"POST",
				JSON.stringify({
					userEmail: auth.userEmail,
					mealPlan: {title: mealPlanFormState.title,
					frequency:
						mealPlanFormState.frequency === ""
							? 0
							: Number(mealPlanFormState.frequency),
					mealsPerDay:
							mealPlanFormState.mealsPerDay === ""
								? 0
								: Number(mealPlanFormState.mealsPerDay),
					startDate:
						mealPlanFormState.startDate === ""
							? 0
							: new Date(mealPlanFormState.startDate),
					endDate: 
						mealPlanFormState.endDate === ""
						? 0
						: new Date(mealPlanFormState.endDate),
					}
				}),
				{
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				}
			);
			console.log(responseData);
			toast("Successfully created mealPlan!");
			navigate("/mealPlans");
		} catch (err) {
			console.log(`Status code: ${statusCode}`);
			console.log(serverError);
		}
	};

	if (!auth.isLoggedIn) {
		return <Box>Unauthorized Access. Please login.</Box>;
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "center",
				pt: "20px",
				pb: "40px",
			}}
		>
			<Card
				sx={{
					width: { xs: "100%", sm: "100%", md: "85%", lg: "70%" },
				}}
			>
				<Box component="form" onSubmit={handleSubmit}>
					<CardContent>
						<Typography
							sx={{
								fontSize: "1.7rem",
								fontWeight: "600",
								textAlign: "left",
								mb: "25px",
								color: "#EB5A3C",
							}}
						>
							Create MealPlan
						</Typography>

						{submitAttempted && !validateForm() && (
							<Alert severity="error" sx={{ mb: 2 }}>
								Please fill in all required fields correctly.
							</Alert>
						)}

						{/* Basic MealPlan Information */}
						<TextField
							fullWidth
							label="MealPlan Title"
							name="title"
							value={mealPlanFormState.title}
							onChange={handleChange}
							required
							error={
								submitAttempted &&
								mealPlanFormState.title.trim() === ""
							}
							helperText={
								submitAttempted &&
								mealPlanFormState.title.trim() === ""
									? "Title is required"
									: ""
							}
							sx={{ mb: 2 }}
						/>

						<Grid container spacing={2} sx={{ mb: 2 }}>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="Frequency"
									name="frequency"
									value={mealPlanFormState.frequency}
									onChange={handleChange}
									required
									type="number"
									error={
										submitAttempted &&
										mealPlanFormState.frequency !==
											"" &&
										Number(
											mealPlanFormState.frequency
										) <= 0
									}
									helperText={
										submitAttempted &&
										mealPlanFormState.frequency !==
											"" &&
										Number(
											mealPlanFormState.frequency
										) <= 0
											? "Enter a valid number"
											: ""
									}
									InputProps={{
										inputProps: { min: 1, max: 7 },
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="Meals Per Day"
									name="mealsPerDay"
									value={mealPlanFormState.mealsPerDay}
									onChange={handleChange}
									required
									type="number"
									error={
										submitAttempted &&
										mealPlanFormState.mealsPerDay !== "" &&
										Number(mealPlanFormState.mealsPerDay) <= 0
									}
									helperText={
										submitAttempted &&
										mealPlanFormState.mealsPerDay !== "" &&
										Number(mealPlanFormState.mealsPerDay) <= 0
											? "Enter a valid time"
											: ""
									}
									InputProps={{
										inputProps: { min: 1, max: 5 },
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
									<TextField
										fullWidth
										label="Start Date"
										name="startDate"
										type="date"
										value={mealPlanFormState.startDate}
										onChange={handleChange}
										required
										error={
											submitAttempted &&
											mealPlanFormState.startDate === ""
										}
										helperText={
											submitAttempted &&
											mealPlanFormState.startDate === ""
												? "Start date is required"
												: ""
										}
									/>
							</Grid>			
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="End Date"
									name="endDate"
									type="date"
									value={mealPlanFormState.endDate}
									onChange={handleChange}
									required
									error={
										submitAttempted &&
										mealPlanFormState.endDate === ""
									}
									helperText={
										submitAttempted &&
										mealPlanFormState.endDate === ""
											? "End date is required"
											: ""
									}
								/>		
							</Grid>
						</Grid>
					</CardContent>
					<CardActions sx={{ p: 2, pt: 0 }}>
						<Button
							variant="contained"
							type="submit"
							fullWidth
							disabled={isLoading}
							sx={{
								backgroundColor: "#EB5A3C",
								"&:hover": {
									backgroundColor: "#d23c22",
								},
							}}
						>
							{isLoading ? (
								<CircularProgress size={24} />
							) : (
								"Create MealPlan"
							)}
						</Button>
					</CardActions>
				</Box>
			</Card>
		</Box>
	);
}

export default MealPlanForm;
