import { useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from "../../redux/features/favorites/favoriteSlice";

import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../../Utils/localStorage";

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product._id);

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, [dispatch]);

  const toggleFavorites = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      // remove the product from the localStorage as well
      removeFavoriteFromLocalStorage(product._id);
    } else {
      dispatch(addToFavorites(product));
      // add the product to localStorage as well
      addFavoriteToLocalStorage(product);
    }
  };

  return (
    <button
      type="button"
      aria-label={`${isFavorite ? "Remove" : "Add"} ${product.name} ${
        isFavorite ? "from" : "to"
      } favorites`}
      aria-pressed={isFavorite}
      className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#526258] shadow-md transition hover:scale-105 hover:text-[#ce4774] focus:outline-none focus:ring-2 focus:ring-[#ce4774]"
      onClick={toggleFavorites}
    >
      {isFavorite ? (
        <FaHeart className="text-[#ce4774]" />
      ) : (
        <FaRegHeart />
      )}
    </button>
  );
};

HeartIcon.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
};

export default HeartIcon;
