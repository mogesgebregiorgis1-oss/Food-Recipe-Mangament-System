import { useEffect, useState } from "react";

import api from "../services/api";

import RecipeCard from "../components/RecipeCard";
import Loading from "../components/Loading";
import SearchFilters from "../components/SearchFilters";


function Home() {

  const [recipes, setRecipes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({});

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });


  const fetchRecipes = async (filters = {}, page = 1) => {

    try {

      setLoading(true);

      setError("");


      const params = {
        page,
        limit: 9,
        ...filters
      };


      const response = await api.get(
        "/recipes",
        {
          params
        }
      );


      setRecipes(response.data.data);

      setPagination(
        response.data.pagination
      );


    } catch (error) {

      console.error(
        "Error fetching recipes:",
        error
      );

      setError(
        "Failed to load recipes."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchRecipes();

  }, []);


  const handleSearch = (newFilters) => {

  setFilters(newFilters);

  fetchRecipes(
    newFilters,
    1
  );

};


  const handleNextPage = () => {

  if (pagination.has_next_page) {

    fetchRecipes(
      filters,
      pagination.current_page + 1
    );

  }

};


  const handlePreviousPage = () => {

  if (pagination.has_previous_page) {

    fetchRecipes(
      filters,
      pagination.current_page - 1
    );

  }

};


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

          <SearchFilters
            onSearch={handleSearch}
          />


          <div className="section-header">

            <div>

              <h2>
                Latest Recipes
              </h2>

              <p>
                {pagination.total_items} recipes found.
              </p>

            </div>

          </div>


          {loading ? (

            <Loading />

          ) : error ? (

            <p>{error}</p>

          ) : recipes.length === 0 ? (

            <p>
              No recipes found.
            </p>

          ) : (

            <>

              <div className="recipe-grid">

                {recipes.map((recipe) => (

                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                  />

                ))}

              </div>


              <div className="pagination">

                <button
                  onClick={handlePreviousPage}
                  disabled={
                    !pagination.has_previous_page
                  }
                >
                  ← Previous
                </button>


                <span>
                  Page {pagination.current_page}
                  {" "}of{" "}
                  {pagination.total_pages}
                </span>


                <button
                  onClick={handleNextPage}
                  disabled={
                    !pagination.has_next_page
                  }
                >
                  Next →
                </button>

              </div>

            </>

          )}

        </div>

      </section>

    </main>

  );
}

export default Home;