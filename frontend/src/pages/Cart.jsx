import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import ProductImage from "../components/ProductImage";
import { NprPrice } from "../components/CurrencyProvider";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-[#292724] lg:pl-60">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          Your basket
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Shopping cart
        </h1>
      </header>

      {cartItems.length === 0 ? (
        <section className="rounded-xl border border-[#e9e5df] bg-white px-6 py-14 text-center">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-[#756a61]">
            Find something useful for home and add it to your basket.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-lg bg-[#c45826] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a9471b]"
          >
            Browse the shop
          </Link>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-3">
            {cartItems.map((item) => (
              <article
                key={item._id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e9e5df] bg-white p-4 sm:flex-nowrap"
              >
                <Link
                  to={`/product/${item._id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f6f4f1]"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${item._id}`}
                    className="font-semibold text-[#28221e] transition hover:text-orange-700"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-[#756a61]">{item.brand}</p>
                  <p className="mt-2 font-semibold text-orange-800">
                    <NprPrice amount={item.price} />
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    aria-label={`Quantity for ${item.name}`}
                    className="w-20 rounded-lg border border-[#ded8d0] bg-white p-2 text-sm text-[#292724]"
                    value={item.qty}
                    onChange={(e) =>
                      addToCartHandler(item, Number(e.target.value))
                    }
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#817970] transition-colors hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeFromCartHandler(item._id)}
                  >
                    <FaTrash size={15} />
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-xl border border-[#e9e5df] bg-white p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-5 flex items-center justify-between border-t border-[#eee4db] pt-4 text-sm text-[#756a61]">
              <span>
                Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
              </span>
              <span>
                <NprPrice
                  amount={cartItems.reduce(
                    (acc, item) => acc + item.qty * item.price,
                    0
                  )}
                />
              </span>
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-[#c45826] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#a9471b]"
              onClick={checkoutHandler}
            >
              Proceed to checkout
            </button>
            <Link
              to="/shop"
              className="mt-4 block text-center text-sm font-medium text-orange-700 hover:text-orange-800"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;
