import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import HeartIcon from "./HeartIcon";
import ProductImage from "../../components/ProductImage";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { NprPrice } from "../../components/CurrencyProvider";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  return (
    <main className="min-h-screen px-4 py-8 text-[#292724] lg:pl-60">
      <div>
        <Link
          to="/"
          className="text-sm font-medium text-[#98502c] hover:underline"
        >
          Go Back
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <>
          <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-start gap-8">
            <div className="relative w-full max-w-[42rem] overflow-hidden rounded-xl border border-[#e9e5df] bg-white p-3">
              <ProductImage
                src={product.image}
                alt={product.name}
                className="aspect-square w-full rounded-lg bg-[#f6f4f1] object-contain p-4"
              />

              <HeartIcon product={product} />
            </div>

            <div className="flex min-w-[18rem] flex-1 flex-col rounded-xl border border-[#e9e5df] bg-white p-6 sm:p-8">
              <h2 className="text-3xl font-semibold tracking-tight text-[#28221e]">
                {product.name}
              </h2>

              <p className="my-4 max-w-2xl leading-7 text-[#756a61]">
                {product.description}
              </p>

              <p className="my-4 text-3xl font-semibold text-[#b74a1a]">
                <NprPrice amount={product.price} />
              </p>

              <div className="grid gap-x-4 gap-y-2 border-y border-[#eee4db] py-5 sm:grid-cols-2">
                <div className="one">
                  <p className="mb-3 flex items-center text-sm text-[#62564d]">
                    <FaStore className="mr-2 text-orange-600" /> Brand:{" "}
                    {product.brand}
                  </p>
                  <p className="mb-3 flex items-center text-sm text-[#62564d]">
                    <FaClock className="mr-2 text-orange-600" /> Added:{" "}
                    {moment(product.createdAt).fromNow()}
                  </p>
                  <p className="mb-3 flex items-center text-sm text-[#62564d]">
                    <FaStar className="mr-2 text-orange-600" /> Reviews:{" "}
                    {product.numReviews}
                  </p>
                </div>

                <div className="two">
                  <p className="mb-3 flex items-center text-sm text-[#62564d]">
                    <FaStar className="mr-2 text-orange-600" /> Ratings:{" "}
                    {product.rating}
                  </p>
                  <p className="mb-3 flex items-center text-sm text-[#62564d]">
                    <FaShoppingCart className="mr-2 text-orange-600" /> Quantity:{" "}
                    {product.quantity}
                  </p>
                  <p className="mb-3 flex items-center text-sm text-[#62564d]">
                    <FaBox className="mr-2 text-orange-600" /> In Stock:{" "}
                    {product.countInStock}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <Ratings
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                />

                {product.countInStock > 0 && (
                  <div>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      aria-label="Quantity"
                      className="w-24 rounded-lg border border-[#ded8d0] bg-white p-2.5 text-[#292724]"
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className="w-full rounded-lg bg-[#c45826] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#a9471b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {product.countInStock > 0 ? "Add to cart" : "Out of stock"}
                </button>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-6xl">
              <ProductTabs
                loadingProductReview={loadingProductReview}
                userInfo={userInfo}
                submitHandler={submitHandler}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                product={product}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default ProductDetails;
