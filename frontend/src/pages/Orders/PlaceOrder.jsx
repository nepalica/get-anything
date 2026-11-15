import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import ProductImage from "../../components/ProductImage";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import { NprPrice } from "../../components/CurrencyProvider";
import { getApiErrorMessage } from "../../Utils/apiErrors.js";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const dispatch = useDispatch();

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Order could not be placed."));
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 text-[#292724] lg:pl-60">
      <ProgressSteps step1 step2 step3 />

      <div className="mt-8">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-xl bg-white">
              <thead className="border-b border-[#eee4db] bg-[#fff7ef] text-left text-sm text-[#756a61]">
                <tr>
                  <th className="px-3 py-3 text-left">Image</th>
                  <th className="px-3 py-3 text-left">Product</th>
                  <th className="px-3 py-3 text-left">Quantity</th>
                  <th className="px-3 py-3 text-left">Price</th>
                  <th className="px-3 py-3 text-left">Total</th>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr key={index} className="border-b border-[#eee4db] last:border-0">
                    <td className="p-2">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                    </td>

                    <td className="p-2">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">
                      <NprPrice amount={item.price} />
                    </td>
                    <td className="p-2">
                      <NprPrice amount={item.qty * item.price} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-[#eadfd4] bg-white p-6 sm:p-8">
          <h2 className="mb-5 text-2xl font-semibold">Order summary</h2>
          <div className="flex flex-wrap justify-between gap-8">
            <ul className="space-y-2 text-[#62564d]">
              <li>
                <span className="font-semibold mb-4">Items:</span>{" "}
                <NprPrice amount={cart.itemsPrice} />
              </li>
              <li>
                <span className="font-semibold mb-4">Shipping:</span>{" "}
                <NprPrice amount={cart.shippingPrice} />
              </li>
              <li>
                <span className="font-semibold mb-4">Tax:</span>{" "}
                <NprPrice amount={cart.taxPrice} />
              </li>
              <li>
                <span className="font-semibold mb-4">Total:</span>{" "}
                <NprPrice amount={cart.totalPrice} />
              </li>
            </ul>

            {error && (
              <Message variant="danger">
                {getApiErrorMessage(error, "Order could not be placed.")}
              </Message>
            )}

            <div className="max-w-sm text-sm text-[#62564d]">
              <h2 className="mb-3 text-lg font-semibold text-[#28221e]">Shipping</h2>
              <p>
                <strong>Address:</strong> {cart.shippingAddress.address},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </p>
            </div>

            <div className="text-sm text-[#62564d]">
              <h2 className="mb-3 text-lg font-semibold text-[#28221e]">Payment method</h2>
              <strong>Method:</strong> {cart.paymentMethod}
            </div>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={cart.cartItems.length === 0 || isLoading}
            onClick={placeOrderHandler}
          >
            Place Order
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </main>
  );
};

export default PlaceOrder;
