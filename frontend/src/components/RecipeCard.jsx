import { Link } from "react-router-dom";

function RecipeCard({ recipe }) {
  return (
    <div>
      <h2>{recipe.title}</h2>

      <p>{recipe.description}</p>

      <p>
        Category: {recipe.category_name}
      </p>

      <p>
        Preparation time: {recipe.preparation_time} minutes
      </p>

      <p>
        Created by: {recipe.creator_name}
      </p>

      <Link to={`/recipes/${recipe.id}`}>
        View Recipe
      </Link>
    </div>
  );
}

export default RecipeCard;