import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();

  const [recipeData, setRecipeData] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [updatingComment, setUpdatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const [myRating, setMyRating] = useState(null);
  const [ratingAverage, setRatingAverage] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

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

          setIsLiked(
            likeStatusResponse.data.data.liked
          );

          const bookmarkStatusResponse = await api.get(
            `/bookmarks/${id}/status`
          );

          setIsBookmarked(
            bookmarkStatusResponse.data.data.bookmarked
          );
        } else {
          setIsLiked(false);
          setIsBookmarked(false);
        }

        const ratingResponse = await api.get(
          `/ratings/${id}`
        );

        setRatingAverage(
          ratingResponse.data.data.average_rating
        );

        setRatingCount(
          ratingResponse.data.data.rating_count
        );

        if (token) {
          const myRatingResponse = await api.get(
            `/ratings/${id}/my-rating`
          );

          setMyRating(
            myRatingResponse.data.data.rating
          );
        } else {
          setMyRating(null);
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
        alert(
          "Please login to like this recipe."
        );
      } else if (
        error.response?.status === 409
      ) {
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


  const handleBookmark = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login to bookmark this recipe."
      );
      return;
    }

    try {
      setBookmarking(true);

      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);

        setIsBookmarked(false);
      } else {
        await api.post(`/bookmarks/${id}`);

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error(
        "Error updating bookmark:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Please login to bookmark this recipe."
        );
      } else if (
        error.response?.status === 409
      ) {
        alert(
          "You have already bookmarked this recipe."
        );

        try {
          const statusResponse = await api.get(
            `/bookmarks/${id}/status`
          );

          setIsBookmarked(
            statusResponse.data.data.bookmarked
          );
        } catch (statusError) {
          console.error(
            "Error checking bookmark status:",
            statusError
          );
        }
      } else {
        alert(
          "Failed to update bookmark."
        );
      }
    } finally {
      setBookmarking(false);
    }
  };


  const handleAddComment = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login to comment on this recipe."
      );
      return;
    }

    if (!commentText.trim()) {
      setCommentError(
        "Comment cannot be empty."
      );
      return;
    }

    try {
      setCommenting(true);
      setCommentError("");

      await api.post(
        `/comments/recipe/${id}`,
        {
          comment: commentText.trim(),
        }
      );

      setCommentText("");

      const commentsResponse = await api.get(
        `/recipes/${id}/details`
      );

      setRecipeData(
        commentsResponse.data.data
      );
    } catch (error) {
      console.error(
        "Error adding comment:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Please login to comment on this recipe."
        );
      } else {
        setCommentError(
          error.response?.data?.message ||
          "Failed to add comment."
        );
      }
    } finally {
      setCommenting(false);
    }
  };


  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment);
  };


  const handleUpdateComment = async (
    commentId
  ) => {
    if (!editingCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      setUpdatingComment(true);

      await api.put(
        `/comments/${commentId}`,
        {
          comment:
            editingCommentText.trim(),
        }
      );

      setEditingCommentId(null);
      setEditingCommentText("");

      const response = await api.get(
        `/recipes/${id}/details`
      );

      setRecipeData(
        response.data.data
      );
    } catch (error) {
      console.error(
        "Error updating comment:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to update comment."
      );
    } finally {
      setUpdatingComment(false);
    }
  };


  const handleDeleteComment = async (
    commentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCommentId(commentId);

      await api.delete(
        `/comments/${commentId}`
      );

      const response = await api.get(
        `/recipes/${id}/details`
      );

      setRecipeData(
        response.data.data
      );
    } catch (error) {
      console.error(
        "Error deleting comment:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete comment."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleRating = async (
    ratingValue
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login to rate this recipe."
      );
      return;
    }

    try {
      setRatingLoading(true);

      const response = await api.post(
        `/ratings/${id}`,
        {
          rating: ratingValue,
        }
      );

      setMyRating(
        response.data.data.rating
      );

      const ratingResponse = await api.get(
        `/ratings/${id}`
      );

      setRatingAverage(
        ratingResponse.data.data.average_rating
      );

      setRatingCount(
        ratingResponse.data.data.rating_count
      );
    } catch (error) {
      console.error(
        "Error rating recipe:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to rate recipe."
      );
    } finally {
      setRatingLoading(false);
    }
  };


  const handleRemoveRating = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login to remove your rating."
      );
      return;
    }

    try {
      setRatingLoading(true);

      await api.delete(
        `/ratings/${id}`
      );

      setMyRating(null);

      const ratingResponse = await api.get(
        `/ratings/${id}`
      );

      setRatingAverage(
        ratingResponse.data.data.average_rating
      );

      setRatingCount(
        ratingResponse.data.data.rating_count
      );
    } catch (error) {
      console.error(
        "Error removing rating:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to remove rating."
      );
    } finally {
      setRatingLoading(false);
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
                    setSelectedImage(
                      imageValue
                    )
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

        <button
          type="button"
          className={`bookmark-button ${
            isBookmarked
              ? "bookmarked"
              : ""
          }`}
          onClick={handleBookmark}
          disabled={bookmarking}
        >
          🔖{" "}
          {bookmarking
            ? "Updating..."
            : isBookmarked
            ? "Remove Bookmark"
            : "Bookmark"}
        </button>
      </section>


      <section className="recipe-rating-section">
        <h2>Rate this recipe</h2>

        <div className="rating-summary">
          <span className="rating-average">
            ⭐ {ratingAverage}
          </span>

          <span>
            ({ratingCount}{" "}
            {ratingCount === 1
              ? "rating"
              : "ratings"})
          </span>
        </div>

        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map(
            (ratingValue) => (
              <button
                key={ratingValue}
                type="button"
                onClick={() =>
                  handleRating(
                    ratingValue
                  )
                }
                disabled={ratingLoading}
                className={
                  myRating >= ratingValue
                    ? "rating-star active"
                    : "rating-star"
                }
                aria-label={`Rate ${ratingValue} stars`}
              >
                ⭐
              </button>
            )
          )}
        </div>

        {myRating && (
          <div className="my-rating">
            <p>
              Your rating:{" "}
              <strong>
                {myRating}/5
              </strong>
            </p>

            <button
              type="button"
              onClick={
                handleRemoveRating
              }
              disabled={ratingLoading}
              className="remove-rating-button"
            >
              {ratingLoading
                ? "Removing..."
                : "Remove Rating"}
            </button>
          </div>
        )}
      </section>

      <section className="recipe-section">
        <h2>Ingredients</h2>

        {ingredients?.length > 0 ? (
          <ul className="ingredients-list">
            {ingredients.map(
              (ingredient) => (
                <li
                  key={ingredient.id}
                >
                  <strong>
                    {ingredient.name}
                  </strong>

                  {ingredient.quantity !==
                    null &&
                    ` - ${ingredient.quantity}`}

                  {ingredient.unit &&
                    ` ${ingredient.unit}`}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            No ingredients added.
          </p>
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
          <p>
            No preparation steps added.
          </p>
        )}
      </section>


      <section className="recipe-section">
        <h2>
          Comments ({comments?.length || 0})
        </h2>

        <form
          className="comment-form"
          onSubmit={handleAddComment}
        >
          <textarea
            value={commentText}
            onChange={(event) =>
              setCommentText(
                event.target.value
              )
            }
            placeholder="Write your comment..."
            rows="4"
            disabled={commenting}
          />

          {commentError && (
            <p className="form-error">
              {commentError}
            </p>
          )}

          <button
            type="submit"
            disabled={commenting}
          >
            {commenting
              ? "Posting..."
              : "Post Comment"}
          </button>
        </form>

        {comments?.length > 0 ? (
          <div className="comments-list">
            {comments.map((comment) => {
              const isOwner =
                user &&
                Number(comment.user_id) ===
                  Number(user.id);

              const isEditing =
                editingCommentId ===
                comment.id;

              return (
                <article
                  key={comment.id}
                  className="comment"
                >
                  <strong>
                    {comment.user_name}
                  </strong>

                  {isEditing ? (
                    <div className="comment-edit-form">
                      <textarea
                        value={
                          editingCommentText
                        }
                        onChange={(event) =>
                          setEditingCommentText(
                            event.target.value
                          )
                        }
                        rows="3"
                        disabled={
                          updatingComment
                        }
                      />

                      <div className="comment-edit-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateComment(
                              comment.id
                            )
                          }
                          disabled={
                            updatingComment
                          }
                        >
                          {updatingComment
                            ? "Saving..."
                            : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(
                              null
                            );
                            setEditingCommentText(
                              ""
                            );
                          }}
                          disabled={
                            updatingComment
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>
                        {comment.comment}
                      </p>

                      <small>
                        {new Date(
                          comment.created_at
                        ).toLocaleString()}
                      </small>

                      {isOwner && (
                        <div className="comment-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditComment(
                                comment
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteComment(
                                comment.id
                              )
                            }
                            disabled={
                              deletingCommentId ===
                              comment.id
                            }
                          >
                            {deletingCommentId ===
                            comment.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p>
            No comments yet.
          </p>
        )}
      </section>
    </main>
  );
}

export default RecipeDetails;