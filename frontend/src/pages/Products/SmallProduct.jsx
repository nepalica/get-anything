import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ProductImage from "../../components/ProductImage";
import HeartIcon from "./HeartIcon";
import { NprPrice } from "../../components/CurrencyProvider";

const SmallProduct = ({ product }) => {
  return (
    <div className="w-[20rem] ml-[2rem] p-3">
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-auto rounded"
        />
        <HeartIcon product={product} />
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h2 className="flex justify-between items-center">
            <div>{product.name}</div>
            <span className="text-xs font-medium text-orange-800">
              <NprPrice amount={product.price} />
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

SmallProduct.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default SmallProduct;
