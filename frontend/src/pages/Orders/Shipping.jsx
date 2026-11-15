import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState(
    cart.paymentMethod === "Khalti" ? "Khalti" : "eSewa"
  );
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  // Payment
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [navigate, shippingAddress]);

  return (
    <main className="mx-auto mt-10 min-h-screen max-w-5xl px-4 py-8 text-[#292724] lg:pl-60">
      <ProgressSteps step1 step2 />
      <div className="mt-8 flex justify-center">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-2xl rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            Checkout
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Shipping details</h1>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#51463e]">
              Address
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
              placeholder="Enter address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#51463e]">
              City
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
              placeholder="Enter city"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#51463e]">
              Postal code
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#51463e]">
              Country
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <fieldset className="mb-6">
            <legend className="block text-sm font-medium text-[#51463e]">
              Payment method
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {["eSewa", "Khalti"].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === method
                      ? "border-orange-500 bg-orange-50"
                      : "border-[#e5d9cf] bg-[#fcfaf8]"
                  }`}
                >
                  <input
                    type="radio"
                    className="accent-orange-500"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="font-semibold">{method}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            className="mt-2 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
            type="submit"
          >
            Continue to review
          </button>
        </form>
      </div>
    </main>
  );
};

export default Shipping;
