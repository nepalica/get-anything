import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Header from "../components/Header";
import ProductCard from "./Products/ProductCard";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError, error } = useGetProductsQuery({ keyword });
  const products = data?.products || [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 text-[#292724] lg:pl-60">
      {!keyword ? <Header products={products} /> : null}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#98502c]">
              {keyword ? "Search" : "In the shop"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#292724] sm:text-3xl">
              {keyword ? "Search results" : "Household essentials"}
            </h2>
            <p className="mt-1 text-sm text-[#716b64]">
              {keyword
                ? `Products matching "${keyword}"`
                : "Pantry staples, kitchen supplies, and everyday basics."}
            </p>
          </div>
          <Link
            to="/shop"
            className="rounded-lg border border-[#ded8d0] px-4 py-2.5 text-sm font-medium text-[#514a43] transition-colors hover:border-orange-400 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Browse all products
          </Link>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Message variant="danger">
            {error?.data?.message ||
              error?.error ||
              "We could not load products. Please try again."}
          </Message>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} p={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#e9e5df] bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-[#28221e]">
              No products to show yet
            </h3>
            <p className="mt-2 text-sm text-[#756a61]">
              Try browsing the shop or search for something else.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-lg bg-[#c45826] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a9471b]"
            >
              Explore the shop
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
