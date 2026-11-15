import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import HeartIcon from "./HeartIcon";
import ProductImage from "../../components/ProductImage";
import { NprPrice } from "../../components/CurrencyProvider";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e9e5df] bg-white">
      <section className="relative bg-[#f6f4f1] p-3">
        <Link to={`/product/${p._id}`}>
          <ProductImage
            className="h-56 w-full object-contain p-2"
            src={p.image}
            alt={p.name}
          />
        </Link>
        <span className="absolute left-5 top-5 max-w-[65%] truncate bg-white/90 px-2.5 py-1 text-xs text-[#625b54]">
          {p?.brand || "Everyday"}
        </span>
        <HeartIcon product={p} />
      </section>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-h-12 text-base font-semibold leading-6 text-[#292724] sm:text-lg">
            <Link
              to={`/product/${p._id}`}
              className="hover:text-orange-700 focus:outline-none focus:underline"
            >
              {p?.name}
            </Link>
          </h2>
          <p className="shrink-0 text-sm font-semibold text-[#b74a0a]">
            <NprPrice amount={p?.price} />
          </p>
        </div>

        <p className="mt-2 min-h-10 text-sm leading-5 text-[#716b64]">
          {p?.description?.length > 78
            ? `${p.description.substring(0, 78)}...`
            : p?.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-2 text-xs font-medium ${
              p?.countInStock > 0 ? "text-[#47724f]" : "text-[#a14d4d]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                p?.countInStock > 0 ? "bg-[#65a46c]" : "bg-[#c76464]"
              }`}
            />
            {p?.countInStock > 0 ? "Available now" : "Out of stock"}
          </span>
          <span className="text-xs text-[#8a938c]">
            {p?.numReviews > 0
              ? `${p.numReviews} ${p.numReviews === 1 ? "review" : "reviews"}`
              : "New arrival"}
          </span>
        </div>

        <section className="mt-5 flex gap-2">
          <Link
            to={`/product/${p._id}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#ded8d0] px-4 py-2 text-sm font-medium text-[#514a43] transition-colors hover:border-orange-400 hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            View details
          </Link>

          <button
            type="button"
            aria-label={`Add ${p?.name} to cart`}
            disabled={p?.countInStock === 0}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#c45826] text-white transition-colors hover:bg-[#a9471b] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => addToCartHandler(p, 1)}
          >
            <AiOutlineShoppingCart size={21} />
          </button>
        </section>
      </div>
    </article>
  );
};

ProductCard.propTypes = {
  p: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    brand: PropTypes.string,
    countInStock: PropTypes.number,
    description: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
    numReviews: PropTypes.number,
    price: PropTypes.number,
  }).isRequired,
};

export default ProductCard;
