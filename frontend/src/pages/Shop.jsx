import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "./Products/ProductCard";
import { useNprCurrency } from "../components/currencyContext";

const Shop = () => {
  const dispatch = useDispatch();
  const { rate, isLoading: isLoadingCurrency } = useNprCurrency();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );
  const [priceFilter, setPriceFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const categoriesQuery = useFetchCategoriesQuery();
  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });
  const availableProducts = filteredProductsQuery.data;

  useEffect(() => {
    if (categoriesQuery.data) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    if (!Array.isArray(availableProducts)) {
      return;
    }

    let visibleProducts = availableProducts;

    if (priceFilter && rate) {
      const maxPrice = Number(priceFilter);
      visibleProducts = visibleProducts.filter(
        (product) => product.price * rate <= maxPrice
      );
    }

    if (brandFilter) {
      visibleProducts = visibleProducts.filter(
        (product) => product.brand === brandFilter
      );
    }

    dispatch(setProducts(visibleProducts));
  }, [availableProducts, brandFilter, dispatch, priceFilter, rate]);

  const handleCheck = (isChecked, categoryId) => {
    const updatedChecked = isChecked
      ? [...checked, categoryId]
      : checked.filter((id) => id !== categoryId);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    ...new Set(
      (availableProducts || [])
        .map((product) => product.brand)
        .filter(Boolean)
    ),
  ];

  const resetFilters = () => {
    dispatch(setChecked([]));
    dispatch(setRadio([]));
    setPriceFilter("");
    setBrandFilter("");
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 text-[#292724] lg:pl-60">
      <header className="mb-7">
        <p className="text-sm font-medium text-[#98502c]">
          Get Anything
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#28221e] sm:text-4xl">
              Shop everyday essentials
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#756a61] sm:text-base">
              Pantry, kitchen, and household essentials.
            </p>
          </div>
          <span className="text-sm text-[#716b64]">
            {products?.length || 0} items
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-[#e9e5df] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#28221e]">Filters</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-orange-700 transition hover:text-orange-800"
            >
              Reset all
            </button>
          </div>

          <section className="mt-5 border-t border-[#eeeae5] pt-4">
            <h3 className="text-sm font-semibold text-[#3c322b]">Categories</h3>
            <div className="mt-3 space-y-3">
              {categoriesQuery.isLoading ? (
                <p className="text-sm text-[#887b71]">Loading categories...</p>
              ) : (
                categories?.map((category) => (
                  <label
                    key={category._id}
                    htmlFor={`category-${category._id}`}
                    className="flex cursor-pointer items-center gap-3 text-sm text-[#62564d] transition hover:text-orange-700"
                  >
                    <input
                      id={`category-${category._id}`}
                      type="checkbox"
                      checked={checked.includes(category._id)}
                      onChange={(event) =>
                        handleCheck(event.target.checked, category._id)
                      }
                      className="h-4 w-4 rounded accent-orange-500"
                    />
                    {category.name}
                  </label>
                ))
              )}
            </div>
          </section>

          <section className="mt-5 border-t border-[#eeeae5] pt-4">
            <h3 className="text-sm font-semibold text-[#3c322b]">Brands</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {uniqueBrands.length > 0 ? (
                uniqueBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    aria-pressed={brandFilter === brand}
                    onClick={() =>
                      setBrandFilter((current) =>
                        current === brand ? "" : brand
                      )
                    }
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      brandFilter === brand
                        ? "border-orange-500 bg-orange-50 text-orange-800"
                        : "border-[#eadfd4] text-[#756a61] hover:border-orange-300 hover:text-orange-800"
                    }`}
                  >
                    {brand}
                  </button>
                ))
              ) : (
                <p className="text-sm text-[#887b71]">No brands available</p>
              )}
            </div>
          </section>

          <section className="mt-5 border-t border-[#eeeae5] pt-4">
            <label
              htmlFor="max-price"
              className="text-sm font-semibold text-[#3c322b]"
            >
              Maximum price (NPR)
            </label>
            <div className="mt-3 flex items-center rounded-lg border border-[#ded8d0] bg-white px-3 focus-within:border-orange-400">
              <span className="text-sm text-[#887b71]">NPR</span>
              <input
                id="max-price"
                type="number"
                min="0"
                value={priceFilter}
                disabled={isLoadingCurrency || !rate}
                onChange={(event) => setPriceFilter(event.target.value)}
                placeholder="No limit"
                className="w-full border-0 bg-transparent px-2 py-2.5 text-sm text-[#28221e] outline-none placeholder:text-[#a99d93]"
              />
            </div>
          </section>
        </aside>

        <section>
          {filteredProductsQuery.isLoading ? (
            <Loader />
          ) : filteredProductsQuery.isError ? (
            <Message variant="danger">
              {filteredProductsQuery.error?.data?.message ||
                filteredProductsQuery.error?.error ||
                "Products could not be loaded. Please try again."}
            </Message>
          ) : products?.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} p={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#e9e5df] bg-white px-6 py-14 text-center">
              <h2 className="text-lg font-semibold text-[#28221e]">
                No matching products
              </h2>
              <p className="mt-2 text-sm text-[#756a61]">
                Try changing your filters to see more everyday essentials.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-lg bg-[#c45826] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a9471b]"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Shop;
