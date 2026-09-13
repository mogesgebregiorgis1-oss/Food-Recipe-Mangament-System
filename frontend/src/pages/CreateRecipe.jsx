import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function CreateRecipe() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [ingredients, setIngredients] = useState([
    {
      name: "",
      quantity: "",
      unit: "",
    },
  ]);

  const [steps, setSteps] = useState([
    {
      instruction: "",
    },
  ]);

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
        console.error("Error fetching categories:", error);

        setError("Failed to load categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;

    const updatedIngredients = [...ingredients];

    updatedIngredients[index][name] = value;

    setIngredients(updatedIngredients);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        name: "",
        quantity: "",
        unit: "",
      },
    ]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length === 1) {
      return;
    }

    const updatedIngredients = ingredients.filter(
      (_, ingredientIndex) => ingredientIndex !== index,
    );

    setIngredients(updatedIngredients);
  };

  const handleStepChange = (index, event) => {
    const { value } = event.target;

    const updatedSteps = [...steps];

    updatedSteps[index].instruction = value;

    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        instruction: "",
      },
    ]);
  };

  const removeStep = (index) => {
    if (steps.length === 1) {
      return;
    }

    const updatedSteps = steps.filter((_, stepIndex) => stepIndex !== index);

    setSteps(updatedSteps);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const recipeResponse = await api.post("/recipes", {
        title,
        description,
        preparation_time: Number(preparationTime),
        category_id: Number(categoryId),
      });

      const recipeId = recipeResponse.data.data.id;

      const formattedIngredients = ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity ? Number(ingredient.quantity) : null,
        unit: ingredient.unit || null,
      }));

      await api.post("/ingredients", {
        recipe_id: recipeId,
        ingredients: formattedIngredients,
      });

      const formattedSteps = steps.map((step) => ({
        instruction: step.instruction,
      }));

      await api.post("/recipe-steps", {
        recipe_id: recipeId,
        steps: formattedSteps,
      });

      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      console.error("Create recipe error:", error);

      setError(error.response?.data?.message || "Failed to create recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-recipe-page">
      <div className="container">
        <div className="create-recipe-container">
          <h1>Create Recipe</h1>

          <p className="create-recipe-intro">
            Share your favorite recipe with the community.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form className="recipe-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Recipe Title</label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Spicy Chicken Pasta"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe your recipe..."
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                value={categoryId}
                disabled={categoriesLoading}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Preparation Time (minutes)</label>

              <input
                type="number"
                min="1"
                value={preparationTime}
                onChange={(event) => setPreparationTime(event.target.value)}
                placeholder="e.g. 30"
                required
              />
            </div>

            <div className="form-group">
              <label>Ingredients</label>

              <div className="ingredients-form-list">
                {ingredients.map((ingredient, index) => (
                  <div className="ingredient-form-row" key={index}>
                    <input
                      type="text"
                      name="name"
                      value={ingredient.name}
                      onChange={(event) => handleIngredientChange(index, event)}
                      placeholder="Ingredient name"
                      required
                    />

                    <input
                      type="number"
                      name="quantity"
                      value={ingredient.quantity}
                      onChange={(event) => handleIngredientChange(index, event)}
                      placeholder="Quantity"
                      min="0"
                      step="0.01"
                      required
                    />

                    <input
                      type="text"
                      name="unit"
                      value={ingredient.unit}
                      onChange={(event) => handleIngredientChange(index, event)}
                      placeholder="Unit"
                    />

                    <button
                      type="button"
                      className="remove-ingredient-button"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-ingredient-button"
                onClick={addIngredient}
              >
                + Add Ingredient
              </button>
            </div>

            <button
              type="button"
              className="add-ingredient-button"
              onClick={addIngredient}
            >
              + Add Ingredient
            </button>

            <div className="form-group">
              <label>Preparation Steps</label>

              <div className="steps-form-list">
                {steps.map((step, index) => (
                  <div className="step-form-row" key={index}>
                    <div className="step-number">Step {index + 1}</div>

                    <textarea
                      value={step.instruction}
                      onChange={(event) => handleStepChange(index, event)}
                      placeholder={`Describe step ${index + 1}...`}
                      rows="3"
                      required
                    />

                    <button
                      type="button"
                      className="remove-step-button"
                      onClick={() => removeStep(index)}
                      disabled={steps.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-step-button"
                onClick={addStep}
              >
                + Add Step
              </button>
            </div>

            <button
              type="submit"
              className="create-recipe-button"
              disabled={loading || categoriesLoading}
            >
              {loading ? "Creating Recipe..." : "Create Recipe"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateRecipe;
