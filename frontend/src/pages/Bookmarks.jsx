import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const getImageValue = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return image;
  }

  if (
    typeof image === "object" &&
    image.image_url
  ) {
    return image.image_url;
  }

  return "";
};

const getImageUrl = (image) => {
  const imageValue = getImageValue(image);

  if (!imageValue) return "";

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

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/bookmarks");

        console.log(
          "Bookmarks response:",
          response.data
        );

        setBookmarks(response.data.data || []);
      } catch (error) {
        console.error(
          "Error fetching bookmarks:",
          error
        );

        setError(
          "Failed to load your bookmarks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <main className="container">
        <h1>My Bookmarks</h1>
        <p>Loading bookmarks...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <h1>My Bookmarks</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="bookmarks-header">
        <h1>My Bookmarks</h1>

        <p>
          Recipes you saved for later.
        </p>
      </section>

      {bookmarks.length === 0 ? (
        <section className="empty-bookmarks">
          <div className="empty-bookmarks-icon">
            🔖
          </div>

          <h2>No bookmarks yet</h2>

          <p>
            You haven't bookmarked any recipes yet.
          </p>

          <Link to="/" className="view-recipe-button">
            Browse Recipes
          </Link>
        </section>
      ) : (
        <section className="recipe-grid">
          {bookmarks.map((bookmark) => {
            const imageUrl = getImageUrl(
              bookmark.featured_image
            );

            return (
              <article
                key={bookmark.id}
                className="recipe-card"
              >
                <div className="recipe-image-container">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={bookmark.title}
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
                    {bookmark.category_name}
                  </p>

                  <h2 className="recipe-title">
                    {bookmark.title}
                  </h2>

                  <p className="recipe-description">
                    {bookmark.description}
                  </p>

                  <div className="recipe-meta">
                    <span>
                      ⏱{" "}
                      {bookmark.preparation_time}{" "}
                      min
                    </span>

                    <span>
                      👤{" "}
                      {bookmark.creator_name}
                    </span>
                  </div>

                  <Link
                    to={`/recipes/${bookmark.id}`}
                    className="view-recipe-button"
                  >
                    View Recipe
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Bookmarks;