import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import MealPlanCard from "../MealPlanCard/MealPlanCard";
import MealPlanDetail from "../MealPlanDetail/MealPlanDetail";
import { useHttpClient } from "hooks/http-hook";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // Keep AddIcon for the button

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

function MealPlanList() {
  const navigate = useNavigate();
  const { sendRequest } = useHttpClient();
  const [mealPlans, setMealPlans] = useState<MealPlanType[]>();
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/mealPlans`
        );
        setMealPlans(responseData);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchMealPlans();
  }, [sendRequest]);

  const handleOpenDetail = (mealPlanId: number) => {
    setSelectedMealPlanId(mealPlanId);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedMealPlanId(null);
  };

  const handleDeleteMealPlan = (mealPlanId: number) => {
    setMealPlans((prevMealPlans) =>
        prevMealPlans?.filter((mealPlan) => mealPlan.mealPlanId !== mealPlanId)
    );
};

  if (!mealPlans) {
    return <Box>
            <button
        onClick={() => {
          // redirect to meal plan form
          navigate("/mealPlanForm", {
            state: { mealPlanId: null },
          });
        }}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      ></button>
    </Box>;
  }

  return (
    <Box>
        <Box
				sx={{
					display: "flex",
					justifyContent: "right",
					alignItems: "center",
					mb: 3,
          pt: "10px",
          pr: "10px"
				}}
			>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => {
            // redirect to meal plan form
            navigate("/mealPlanForm", {
              state: { mealPlanId: null },
            });
          }}
					sx={{
						backgroundColor: "#EB5A3C",
						"&:hover": { backgroundColor: "#d23c22" },
					}}
				>
					Create Meal Plan
				</Button>
			</Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          pt: "10px",
        }}
      >
        {mealPlans.map((mealPlan) => (
          <MealPlanCard
            key={mealPlan.mealPlanId}
            {...mealPlan}
            onOpenDetail={() => handleOpenDetail(mealPlan.mealPlanId)}
          />
        ))}

        {selectedMealPlanId !== null && (
          <MealPlanDetail
            mealPlanId={selectedMealPlanId}
            open={detailOpen}
            onClose={handleCloseDetail}
            onDelete={handleDeleteMealPlan}
          />
        )}
      </Box>
    </Box>
  );
}

export default MealPlanList;
