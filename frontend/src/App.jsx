import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecipeDetails from "./pages/RecipeDetails";
import CreateRecipe from "./pages/CreateRecipe";
import Bookmarks from "./pages/Bookmarks";



function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/recipes/:id"
          element={<RecipeDetails />}
        />

        <Route element={<ProtectedRoute />}>

          <Route
            path="/create-recipe"
            element={<CreateRecipe />}
          />

          <Route
            path="/bookmarks"
            element={<Bookmarks />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;