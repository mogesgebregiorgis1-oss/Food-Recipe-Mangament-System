import { Link } from "react-router-dom";

function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <div className="recipe-image-container">
        {recipe.featured_image ? (
          <img
            src={`http://localhost:5000/uploads/${recipe.featured_image}`}
            alt={recipe.title}
            className="recipe-image"
          />
        ) : (
          <div className="recipe-image-placeholder">🍽️</div>
        )}
      </div>

      <div className="recipe-card-content">
        <p className="recipe-category">{recipe.category_name}</p>

        <h2 className="recipe-title">{recipe.title}</h2>

        <p className="recipe-description">{recipe.description}</p>

        <div className="recipe-meta">
          <span>⏱ {recipe.preparation_time} min</span>

          <span>👤 {recipe.creator_name}</span>
        </div>

        <Link to={`/recipes/${recipe.id}`} className="view-recipe-button">
          View Recipe
        </Link>
      </div>
    </article>
  );
}

export default RecipeCard;
