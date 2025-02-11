import "./App.css";
import Box from "@mui/material/Box";
import Header from "components/Header/Header";
import RecipeList from "components/RecipeList/RecipeList";

function App() {
  return (
    <Box className="App">
      <Header />
      <Box sx={{ backgroundColor: "#FBFBFB", minHeight: "calc(100vh - 70px)" }}>
        <RecipeList />
      </Box>
    </Box>
  );
}

export default App;
