import { useState } from "react";

function SearchFilters({ onSearch }) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [sort, setSort] = useState("newest");

  const handleSubmit = (event) => {
    event.preventDefault();

    onSearch({
      search,
      category_id: categoryId,
      max_time: maxTime,
      ingredient,
      sort
    });
  };

  const handleClear = () => {
    setSearch("");
    setCategoryId("");
    setMaxTime("");
    setIngredient("");
    setSort("newest");

    onSearch({
      search: "",
      category_id: "",
      max_time: "",
      ingredient: "",
      sort: "newest"
    });
  };

  return (
    <form
      className="search-filters"
      onSubmit={handleSubmit}
    >

      <div className="search-row">

        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <input
          type="text"
          placeholder="Ingredient..."
          value={ingredient}
          onChange={(event) =>
            setIngredient(event.target.value)
          }
        />

      </div>


      <div className="filter-row">

        <select
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
        >
          <option value="">
            All Categories
          </option>

          <option value="1">
            Breakfast
          </option>

          <option value="2">
            Lunch
          </option>

          <option value="3">
            Dinner
          </option>

          <option value="4">
            Desserts
          </option>

          <option value="5">
            Drinks
          </option>

        </select>


        <select
          value={maxTime}
          onChange={(event) =>
            setMaxTime(event.target.value)
          }
        >
          <option value="">
            Any Preparation Time
          </option>

          <option value="15">
            Under 15 minutes
          </option>

          <option value="30">
            Under 30 minutes
          </option>

          <option value="60">
            Under 60 minutes
          </option>

          <option value="120">
            Under 2 hours
          </option>

        </select>


        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>

          <option value="time_asc">
            Quickest
          </option>

          <option value="time_desc">
            Longest
          </option>

        </select>


        <button type="submit">
          Search
        </button>

        <button
          type="button"
          onClick={handleClear}
        >
          Clear
        </button>

      </div>

    </form>
  );
}

export default SearchFilters;