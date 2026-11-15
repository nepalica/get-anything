import PropTypes from "prop-types";
import { useGetPaymentConfigQuery } from "../redux/api/orderApiSlice";
import { CurrencyContext, formatNpr, useNprCurrency } from "./currencyContext";

export const CurrencyProvider = ({ children }) => {
  const { data, isLoading, isError, error } = useGetPaymentConfigQuery();
  const rate = Number(data?.usdToNprRate);
  const errorMessage =
    error?.data?.message ||
    (error?.status === "FETCH_ERROR"
      ? "Could not reach the backend. Start both services with npm run dev."
      : "Set a positive numeric USD_TO_NPR_RATE in the project-root .env, then restart the backend.");

  return (
    <CurrencyContext.Provider
      value={{
        rate: Number.isFinite(rate) && rate > 0 ? rate : null,
        isLoading,
        isError,
        errorMessage,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

CurrencyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const NprPrice = ({ amount, className }) => {
  const { rate, isLoading, isError, errorMessage } = useNprCurrency();

  if (isLoading) {
    return <span className={className}>NPR ...</span>;
  }

  if (isError || !rate) {
    return (
      <span className={className} title={errorMessage}>
        NPR rate unavailable
      </span>
    );
  }

  return <span className={className}>NPR {formatNpr(amount, rate)}</span>;
};

NprPrice.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  className: PropTypes.string,
};

export default CurrencyProvider;
