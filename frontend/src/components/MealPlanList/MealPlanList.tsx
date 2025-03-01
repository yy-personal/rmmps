import Box from "@mui/material/Box";
import data from "./dummy-meal-plans.json";
import MealPlanCard from "../MealPlanCard/MealPlanCard";
import { useEffect, useState } from "react";
import { useHttpClient } from "hooks/http-hook";

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
  const { sendRequest } = useHttpClient();
  const [MealPlans, setMealPlans] = useState<MealPlanType[]>();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/mealPlans`
        );

        setMealPlans(responseData);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchMealPlans();
  }, [setMealPlans, sendRequest]);

  if (!MealPlans) {
    return <Box></Box>;
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        pt: "10px",
      }}
    >
      {MealPlans.map((MealPlan) => {
        return (
          <MealPlanCard
            key={MealPlan.mealPlanId}
            mealPlanId={MealPlan.mealPlanId}
            title={MealPlan.title}
            user={MealPlan.user}
            frequency={MealPlan.frequency}
            mealsPerDay={MealPlan.mealsPerDay}
            startDate={MealPlan.startDate}
            endDate={MealPlan.endDate}
          />
        );
      })}
    </Box>
  );
}

export default MealPlanList;
