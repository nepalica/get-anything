import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Ratings from "./Ratings";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { data, isLoading } = useGetTopProductsQuery();

  const [activeTab, setActiveTab] = useState(1);

  if (isLoading) {
    return <Loader />;
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <section className="flex w-full shrink-0 flex-col gap-2 md:w-56">
        <button
          type="button"
          aria-pressed={activeTab === 1}
          className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
            activeTab === 1
              ? "bg-orange-50 text-orange-800"
              : "text-[#756a61] hover:bg-white hover:text-orange-700"
          }`}
          onClick={() => handleTabClick(1)}
        >
          Write Your Review
        </button>
        <button
          type="button"
          aria-pressed={activeTab === 2}
          className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
            activeTab === 2
              ? "bg-orange-50 text-orange-800"
              : "text-[#756a61] hover:bg-white hover:text-orange-700"
          }`}
          onClick={() => handleTabClick(2)}
        >
          All Reviews
        </button>
        <button
          type="button"
          aria-pressed={activeTab === 3}
          className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
            activeTab === 3
              ? "bg-orange-50 text-orange-800"
              : "text-[#756a61] hover:bg-white hover:text-orange-700"
          }`}
          onClick={() => handleTabClick(3)}
        >
          Related Products
        </button>
      </section>

      <section className="min-w-0 flex-1">
        {activeTab === 1 && (
          <div className="mt-4">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <div className="my-2">
                  <label htmlFor="rating" className="block text-xl mb-2">
                    Rating
                  </label>

                  <select
                    id="rating"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-xl border border-[#e5d9cf] bg-white p-3 text-[#28221e] xl:w-[40rem]"
                  >
                    <option value="">Select</option>
                    <option value="1">Inferior</option>
                    <option value="2">Decent</option>
                    <option value="3">Great</option>
                    <option value="4">Excellent</option>
                    <option value="5">Exceptional</option>
                  </select>
                </div>

                <div className="my-2">
                  <label htmlFor="comment" className="block text-xl mb-2">
                    Comment
                  </label>

                  <textarea
                    id="comment"
                    rows="3"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-xl border border-[#e5d9cf] bg-white p-3 text-[#28221e] xl:w-[40rem]"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loadingProductReview}
                  className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Submit
                </button>
              </form>
            ) : (
              <p>
                Please <Link to="/login">sign in</Link> to write a review
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        {activeTab === 2 && (
          <>
            <div>{product.reviews.length === 0 && <p>No Reviews</p>}</div>

            <div>
              {product.reviews.map((review) => (
                <div
                  key={review._id}
                  className="mb-4 rounded-2xl border border-[#eadfd4] bg-white p-5"
                >
                  <div className="flex justify-between">
                    <strong className="text-[#51463e]">{review.name}</strong>
                    <p className="text-sm text-[#887b71]">
                      {review.createdAt.substring(0, 10)}
                    </p>
                  </div>

                  <p className="my-4">{review.comment}</p>
                  <Ratings value={review.rating} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        {activeTab === 3 && (
          <section className="ml-[4rem] flex flex-wrap">
            {!data ? (
              <Loader />
            ) : (
              data.map((product) => (
                <div key={product._id}>
                  <SmallProduct product={product} />
                </div>
              ))
            )}
          </section>
        )}
      </section>
    </div>
  );
};

ProductTabs.propTypes = {
  loadingProductReview: PropTypes.bool.isRequired,
  userInfo: PropTypes.shape({
    username: PropTypes.string,
  }),
  submitHandler: PropTypes.func.isRequired,
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setRating: PropTypes.func.isRequired,
  comment: PropTypes.string.isRequired,
  setComment: PropTypes.func.isRequired,
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        createdAt: PropTypes.string,
        comment: PropTypes.string,
        rating: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
};

export default ProductTabs;
