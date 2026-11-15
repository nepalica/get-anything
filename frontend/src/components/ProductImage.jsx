import { useState } from "react";
import PropTypes from "prop-types";

const FALLBACK_IMAGE = "/products/product-unavailable.svg";

const ProductImage = ({ src, ...imageProps }) => {
  const normalizedSrc =
    typeof src === "string" ? src.replace(/\\/g, "/") : "";
  const [failedSrc, setFailedSrc] = useState(null);

  return (
    <img
      {...imageProps}
      src={
        normalizedSrc && failedSrc !== normalizedSrc
          ? normalizedSrc
          : FALLBACK_IMAGE
      }
      onError={() => setFailedSrc(normalizedSrc)}
    />
  );
};

ProductImage.propTypes = {
  src: PropTypes.string,
};

export default ProductImage;
