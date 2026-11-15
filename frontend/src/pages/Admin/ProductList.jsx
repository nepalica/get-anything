import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import ProductImage from "../../components/ProductImage";
import { useNprCurrency } from "../../components/currencyContext";

const ProductList = () => {
  const [image, setImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();
  const { rate } = useNprCurrency();

  const [uploadProductImage, { isLoading: isUploading }] =
    useUploadProductImageMutation();
  const [createProduct, { isLoading: isCreating }] =
    useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rate || !Number.isFinite(Number(price))) {
      toast.error("NPR conversion is unavailable. Check USD_TO_NPR_RATE.");
      return;
    }

    if (!image || !category) {
      toast.error("Upload a product image and choose a category.");
      return;
    }

    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", String(Number(price) / rate));
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock);

      const data = await createProduct(productData).unwrap();
      toast.success(`${data.name} is created`);
      navigate("/");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          (typeof error?.data === "string" ? error.data : undefined) ||
          error.error ||
          "Product create failed. Try again."
      );
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
      setImageFileName(file.name);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          (typeof error?.data === "string" ? error.data : undefined) ||
          error.error ||
          "Image upload failed."
      );
    }
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-3/4 p-3">
          <div className="h-12">Create Product</div>

          <form onSubmit={handleSubmit}>
            {imageUrl && (
              <div className="mb-4 rounded-2xl bg-[#fff6ed] p-3 text-center">
                <ProductImage
                  src={imageUrl}
                  alt={name || "Product preview"}
                  className="mx-auto max-h-[200px] rounded-xl object-contain"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block cursor-pointer rounded-2xl border border-dashed border-white/30 px-4 py-8 text-center font-semibold text-white transition hover:border-emerald-300 hover:bg-white/[0.04]">
                {isUploading
                  ? "Uploading image..."
                  : imageFileName || "Choose product image (JPG, PNG, WebP)"}
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={uploadFileHandler}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </div>

              <div className="p-3">
                <div className="flex flex-wrap">
                  <div className="one">
                    <label htmlFor="name">Name</label> <br />
                    <input
                      type="text"
                      id="name"
                      required
                      className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="two ml-10 ">
                    <label htmlFor="price">Price (NPR)</label> <br />
                    <input
                      type="number"
                      id="price"
                      min="0.01"
                      step="0.01"
                      required
                      className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap">
                  <div className="one">
                    <label htmlFor="quantity">Pack quantity</label> <br />
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      required
                      className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="two ml-10 ">
                    <label htmlFor="brand">Brand</label> <br />
                    <input
                      type="text"
                      id="brand"
                      required
                      className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>
                </div>

                <label htmlFor="description" className="my-5">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  className="p-2 mb-3 bg-[#101011] border rounded-lg w-[95%] text-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                <div className="flex justify-between">
                  <div>
                    <label htmlFor="stock">Count in stock</label> <br />
                    <input
                      type="number"
                      id="stock"
                      min="0"
                      className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="category">Category</label> <br />
                    <select
                      id="category"
                      required
                      value={category}
                      className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Choose category</option>
                      {categories?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || isUploading || !rate}
                  className="py-4 px-10 mt-5 rounded-lg text-lg font-bold bg-pink-600"
                >
                  {isCreating ? "Creating product..." : "Create product"}
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
