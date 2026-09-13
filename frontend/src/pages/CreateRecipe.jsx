import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function CreateRecipe() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        setCategories(response.data.data);

      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setError(
          "Failed to load categories."
        );

      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await api.post(
        "/recipes",
        {
          title,
          description,
          preparation_time: Number(preparationTime),
          category_id: Number(categoryId)
        }
      );

      const recipeId = response.data.data.id;

      navigate(`/recipes/${recipeId}`);

    } catch (error) {
      console.error(
        "Create recipe error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to create recipe."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-recipe-page">

      <div className="container">

        <div className="create-recipe-container">

          <h1>
            Create Recipe
          </h1>

          <p className="create-recipe-intro">
            Share your favorite recipe with the community.
          </p>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <form
            className="recipe-form"
            onSubmit={handleSubmit}
          >

            {/* Title */}

            <div className="form-group">

              <label>
                Recipe Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Spicy Chicken Pasta"
                required
              />

            </div>


            {/* Description */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe your recipe..."
                rows="5"
                required
              />

            </div>


            {/* Category */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                value={categoryId}
                disabled={categoriesLoading}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                required
              >

                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}

              </select>

            </div>


            {/* Preparation Time */}

            <div className="form-group">

              <label>
                Preparation Time (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={preparationTime}
                onChange={(event) =>
                  setPreparationTime(event.target.value)
                }
                placeholder="e.g. 30"
                required
              />

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="create-recipe-button"
              disabled={loading || categoriesLoading}
            >
              {loading
                ? "Creating Recipe..."
                : "Create Recipe"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

export default CreateRecipe;