import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductImage from "./ProductImage";

const Header = ({ products }) => {
  const isAdmin = useSelector((state) => state.auth.userInfo?.isAdmin);
  const featuredProducts = Array.from(
    { length: 2 },
    (_, index) => products[index]
  );
  const renderFeaturedProduct = (product, index) => (
    <div
      key={product?._id || `featured-placeholder-${index}`}
      className="aspect-square overflow-hidden border-2 border-white/60"
    >
      {product ? (
        <ProductImage
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );

  return (
    <section className="border-2 border-white/60 bg-[#211a16] px-4 py-6 text-white sm:px-8 sm:py-8">
      <h1 className="text-center text-3xl font-medium uppercase tracking-[0.08em] sm:text-5xl">
        Get Anything
      </h1>

      <div className="mx-auto mt-5 grid max-w-5xl grid-cols-[minmax(2.5rem,0.65fr)_minmax(0,2fr)_minmax(2.5rem,0.65fr)] items-center gap-2 sm:mt-6 sm:gap-6">
        {renderFeaturedProduct(featuredProducts[0], 0)}
        <p
          lang="ne"
          className="text-center text-base font-medium leading-relaxed sm:text-2xl md:text-3xl"
        >
          जे पाइन्छ, यही पाइन्छ
        </p>
        {renderFeaturedProduct(featuredProducts[1], 1)}
      </div>

      <Link
        to={isAdmin ? "/admin/dashboard" : "/shop"}
        className="mx-auto mt-5 flex min-h-14 w-full max-w-sm items-center justify-center border-2 border-white/60 px-5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:mt-6"
      >
        {isAdmin ? "Welcome to admin portal" : "Browse the shop"}
      </Link>
    </section>
  );
};

Header.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Header;
