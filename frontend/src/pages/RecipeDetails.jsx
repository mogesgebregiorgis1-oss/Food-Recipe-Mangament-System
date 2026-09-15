import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";
import Loading from "../components/Loading";

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

function RecipeDetails() {
  const { id } = useParams();

  const [recipeData, setRecipeData] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/recipes/${id}/details`
        );

        const data = response.data.data;

        setRecipeData(data);

        const featuredImage = getImageValue(
          data.featured_image
        );

        const firstImage =
          data.images?.length > 0
            ? getImageValue(data.images[0])
            : "";

        if (featuredImage) {
          setSelectedImage(featuredImage);
        } else if (firstImage) {
          setSelectedImage(firstImage);
        } else {
          setSelectedImage("");
        }
      } catch (error) {
        console.error(
          "Error fetching recipe details:",
          error
        );

        setError(
          "Failed to load recipe details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="recipe-details-page">
        <div className="container">
          <Loading />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="recipe-details-page">
        <div className="container">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!recipeData) {
    return null;
  }

  const {
    recipe,
    creator,
    category,
    images = [],
    ingredients = [],
    steps = [],
    likes,
    rating,
    comments = []
  } = recipeData;

  return (
    <main className="recipe-details-page">
      <div className="container">

        <section className="recipe-details-header">

          <div className="recipe-gallery">

            <div className="recipe-featured-image">

              {selectedImage ? (
                <img
                  src={getImageUrl(selectedImage)}
                  alt={recipe.title}
                />
              ) : (
                <div className="recipe-details-placeholder">
                  🍽️
                </div>
              )}

            </div>

            {images.length > 0 && (
              <div className="recipe-image-thumbnails">

                {images.map((image) => {
                  const imageValue =
                    getImageValue(image);

                  return (
                    <button
                      type="button"
                      key={image.id}
                      className={`recipe-thumbnail ${
                        selectedImage === imageValue
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedImage(imageValue)
                      }
                    >

                      <img
                        src={getImageUrl(image)}
                        alt={`${recipe.title} thumbnail`}
                      />

                      {Number(image.is_featured) === 1 && (
                        <span className="featured-badge">
                          Featured
                        </span>
                      )}

                    </button>
                  );
                })}

              </div>
            )}

          </div>

          <div className="recipe-details-info">

            <p className="recipe-category">
              {category.name}
            </p>

            <h1>
              {recipe.title}
            </h1>

            <p className="recipe-details-description">
              {recipe.description}
            </p>

            <div className="recipe-details-meta">

              <span>
                ⏱ {recipe.preparation_time} minutes
              </span>

              <span>
                👤 {creator.name}
              </span>

            </div>

            <div className="recipe-stats">

              <span>
                ❤️ {likes.count} likes
              </span>

              <span>
                ⭐ {rating.average} (
                {rating.count} ratings)
              </span>

            </div>

          </div>

        </section>

        <section className="recipe-section">

          <h2>
            Ingredients
          </h2>

          {ingredients.length === 0 ? (
            <p>
              No ingredients added.
            </p>
          ) : (
            <ul className="ingredients-list">

              {ingredients.map((ingredient) => (
                <li key={ingredient.id}>

                  <span>
                    {ingredient.name}
                  </span>

                  <span>
                    {ingredient.quantity ?? ""}
                    {" "}
                    {ingredient.unit ?? ""}
                  </span>

                </li>
              ))}

            </ul>
          )}

        </section>

        <section className="recipe-section">

          <h2>
            Preparation
          </h2>

          {steps.length === 0 ? (
            <p>
              No preparation steps added.
            </p>
          ) : (
            <ol className="steps-list">

              {steps.map((step) => (
                <li key={step.id}>

                  <p>
                    {step.instruction}
                  </p>

                </li>
              ))}

            </ol>
          )}

        </section>

        <section className="recipe-section">

          <h2>
            Comments ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <p>
              No comments yet.
            </p>
          ) : (
            <div className="comments-list">

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="comment"
                >

                  <strong>
                    {comment.user_name}
                  </strong>

                  <p>
                    {comment.comment}
                  </p>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default RecipeDetails;