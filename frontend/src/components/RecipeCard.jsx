import { Link } from "react-router-dom";

const getImageValue = (image) => {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object" && image.image_url) {
    return image.image_url;
  }

  return "";
};

const getImageUrl = (image) => {
  const imageValue = getImageValue(image);

  if (!imageValue) {
    return "";
  }

  if (
    imageValue.startsWith("http://") ||
    imageValue.startsWith("https://")
  ) {
    return imageValue;
  }

  const cleanImage = imageValue
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "");

  return `http://localhost:5000/uploads/${cleanImage}`;
};

function RecipeCard({ recipe }) {
  const imageUrl = getImageUrl(recipe.featured_image);

  return (
    <article className="recipe-card">

      <div className="recipe-image-container">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title}
            className="recipe-image"
          />
        ) : (
          <div className="recipe-image-placeholder">
            🍽️
          </div>
        )}

      </div>

      <div className="recipe-card-content">

        <p className="recipe-category">
          {recipe.category_name}
        </p>

        <h2 className="recipe-title">
          {recipe.title}
        </h2>

        <p className="recipe-description">
          {recipe.description}
        </p>

        <div className="recipe-meta">

          <span>
            ⏱ {recipe.preparation_time} min
          </span>

          <span>
            👤 {recipe.creator_name}
          </span>

        </div>

        <Link
          to={`/recipes/${recipe.id}`}
          className="view-recipe-button"
        >
          View Recipe
        </Link>

      </div>

    </article>
  );
}

export default RecipeCard;