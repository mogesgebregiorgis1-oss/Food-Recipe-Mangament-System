import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

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

  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

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

        const token = localStorage.getItem("token");

        if (token) {
          const likeStatusResponse = await api.get(
            `/likes/${id}/status`
          );

          console.log(
            "Like status:",
            likeStatusResponse.data
          );

          setIsLiked(
            likeStatusResponse.data.data.liked
          );
        } else {
          setIsLiked(false);
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

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to like this recipe.");
      return;
    }

    try {
      setLiking(true);

      if (isLiked) {
        await api.delete(`/likes/${id}`);

        setRecipeData((currentData) => ({
          ...currentData,
          likes: {
            ...currentData.likes,
            count: Math.max(
              0,
              currentData.likes.count - 1
            ),
          },
        }));

        setIsLiked(false);
      } else {
        // Like recipe
        await api.post(`/likes/${id}`);

        setRecipeData((currentData) => ({
          ...currentData,
          likes: {
            ...currentData.likes,
            count:
              currentData.likes.count + 1,
          },
        }));

        setIsLiked(true);
      }
    } catch (error) {
      console.error(
        "Error updating like:",
        error
      );

      if (error.response?.status === 401) {
        alert("Please login to like this recipe.");
      } else if (error.response?.status === 409) {
        alert(
          "You have already liked this recipe."
        );

        try {
          const statusResponse = await api.get(
            `/likes/${id}/status`
          );

          setIsLiked(
            statusResponse.data.data.liked
          );
        } catch (statusError) {
          console.error(
            "Error checking like status:",
            statusError
          );
        }
      } else {
        alert("Failed to update like.");
      }
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <p>Loading recipe...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p>{error}</p>
      </main>
    );
  }

  if (!recipeData) {
    return (
      <main className="container">
        <p>Recipe not found.</p>
      </main>
    );
  }

  const {
    recipe,
    creator,
    category,
    images,
    ingredients,
    steps,
    likes,
    rating,
    comments,
  } = recipeData;

  const selectedImageUrl =
    getImageUrl(selectedImage);

  return (
    <main className="container recipe-details-page">

      <section className="recipe-details-header">
        <p className="recipe-category">
          {category?.name}
        </p>

        <h1>{recipe.title}</h1>

        <p className="recipe-description">
          {recipe.description}
        </p>

        <div className="recipe-meta">
          <span>
            ⏱ {recipe.preparation_time} minutes
          </span>

          <span>
            👤 {creator?.name}
          </span>
        </div>
      </section>

      <section className="recipe-images-section">
        <div className="main-recipe-image">
          {selectedImageUrl ? (
            <img
              src={selectedImageUrl}
              alt={recipe.title}
            />
          ) : (
            <div className="recipe-image-placeholder">
              🍽️
            </div>
          )}
        </div>

        {images?.length > 0 && (
          <div className="recipe-image-thumbnails">
            {images.map((image) => {
              const imageUrl =
                getImageUrl(image);

              if (!imageUrl) {
                return null;
              }

              const imageValue =
                getImageValue(image);

              return (
                <button
                  type="button"
                  key={image.id}
                  onClick={() =>
                    setSelectedImage(imageValue)
                  }
                  className={
                    selectedImage === imageValue
                      ? "thumbnail active"
                      : "thumbnail"
                  }
                >
                  <img
                    src={imageUrl}
                    alt={recipe.title}
                  />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="recipe-actions">
        <button
          type="button"
          className={`like-button ${
            isLiked ? "liked" : ""
          }`}
          onClick={handleLike}
          disabled={liking}
        >
          {isLiked ? "❤️" : "🤍"}{" "}

          {liking
            ? "Updating..."
            : `${likes?.count || 0} likes`}
        </button>

        <span className="recipe-rating">
          ⭐ {rating?.average || 0} (
          {rating?.count || 0} ratings)
        </span>
      </section>

      <section className="recipe-section">
        <h2>Ingredients</h2>

        {ingredients?.length > 0 ? (
          <ul className="ingredients-list">
            {ingredients.map((ingredient) => (
              <li key={ingredient.id}>
                <strong>
                  {ingredient.name}
                </strong>

                {ingredient.quantity !== null &&
                  ` - ${ingredient.quantity}`}

                {ingredient.unit &&
                  ` ${ingredient.unit}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No ingredients added.</p>
        )}
      </section>

      <section className="recipe-section">
        <h2>Preparation</h2>

        {steps?.length > 0 ? (
          <ol className="steps-list">
            {steps.map((step) => (
              <li key={step.id}>
                {step.instruction}
              </li>
            ))}
          </ol>
        ) : (
          <p>No preparation steps added.</p>
        )}
      </section>

      <section className="recipe-section">
        <h2>
          Comments ({comments?.length || 0})
        </h2>

        {comments?.length > 0 ? (
          <div className="comments-list">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="comment"
              >
                <strong>
                  {comment.user_name}
                </strong>

                <p>{comment.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>No comments yet.</p>
        )}
      </section>

    </main>
  );
}

export default RecipeDetails;