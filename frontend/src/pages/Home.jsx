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
    <main>

      <section className="hero">

        <div className="container hero-content">

          <p className="hero-small-title">
            COOK • SHARE • DISCOVER
          </p>

          <h1>
            Discover Delicious Recipes
          </h1>

          <p>
            Find recipes, discover new flavors,
            and learn how to create amazing meals.
          </p>

        </div>

      </section>


      <section className="recipes-section">

        <div className="container">

          <div className="section-header">

            <div>
              <h2>Latest Recipes</h2>

              <p>
                Explore our newest recipes.
              </p>
            </div>

          </div>


          {recipes.length === 0 ? (

            <p>No recipes found.</p>

          ) : (

            <div className="recipe-grid">

              {recipes.map((recipe) => (

                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default Home;