import { useEffect, useState } from "react";
import api from "../services/api";
import RecipeCard from "../components/RecipeCard";
import Loading from "../components/Loading";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get("/recipes");

        setRecipes(response.data.data);

      } catch (error) {
        console.error("Error fetching recipes:", error);

        setError("Failed to load recipes.");

      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
  return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Discover Delicious Recipes</h1>

      <p>
        Find your favorite recipes and learn how to make them.
      </p>

      <div>
        {recipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Home;