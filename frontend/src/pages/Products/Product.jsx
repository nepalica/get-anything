import ProductCard from "./ProductCard";

const Product = ({ product }) => <ProductCard p={product} />;

Product.propTypes = {
  product: ProductCard.propTypes.p,
};

export default Product;
