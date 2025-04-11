// src/index.tsx (updated)

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
import ShoppingListCreate from "components/ShoppingList/ShoppingListCreate";

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
					<Route path="/login" element={<Login isLogin />} />
					<Route
						path="/register"
						element={<Login isLogin={false} />}
					/>

					{/* Shopping List Routes */}
					<Route path="/shopping" element={<ShoppingLists />} />
					<Route
						path="/shopping/create"
						element={<ShoppingListCreate />}
					/>
					<Route
						path="/shopping/:id"
						element={<ShoppingListDetail />}
					/>

					{/* <Route path="*" element={<PageNotFound />} /> */}
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// reportWebVitals();
