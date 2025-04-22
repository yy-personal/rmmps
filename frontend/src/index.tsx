import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import RecipeList from "components/RecipeList/RecipeList";
import RecipeForm from "components/RecipeForm/RecipeForm";
import Login from "components/Login/Login";
import ShoppingLists from "components/ShoppingList/ShoppingLists";
import ShoppingListDetail from "components/ShoppingList/ShoppingListDetail";
import CreateShoppingList from "components/ShoppingList/CreateShoppingList";import MealPlanList from "components/MealPlanList/MealPlanList";


const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />}>
					<Route path="/" element={<RecipeList />} />
					<Route path="/recipes" element={<RecipeList />} />
					<Route path="/contribute" element={<RecipeForm />} />
          			<Route path="/mealPlans" element={<MealPlanList />} />
					<Route path="/login" element={<Login isLogin />} />
					<Route
						path="/register"
						element={<Login isLogin={false} />}
					/>
					<Route path="/shopping" element={<ShoppingLists />} />
					<Route
						path="/shopping/:id"
						element={<ShoppingListDetail />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);
