import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import OrderList from "./OrderList";
import { formatNpr, useNprCurrency } from "../../components/currencyContext";

const DashboardMetric = ({ label, value, detail, loading, error, icon: Icon }) => (
  <article className="rounded-2xl border border-white/10 bg-[#2a211b] p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-white/55">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
          {loading ? "—" : error ? "Unavailable" : value}
        </p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200">
        <Icon size={19} />
      </span>
    </div>
    <p className="mt-4 border-t border-white/[0.08] pt-3 text-xs text-white/40">
      {detail}
    </p>
  </article>
);

DashboardMetric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  icon: PropTypes.elementType.isRequired,
};

const AdminDashboard = () => {
  const { rate, isLoading: loadingCurrency } = useNprCurrency();
  const salesInNpr = (amount) =>
    rate ? `NPR ${formatNpr(amount, rate)}` : "Rate unavailable";
  const {
    data: sales,
    isLoading: loadingSales,
    isError: salesError,
  } = useGetTotalSalesQuery();
  const {
    data: customers,
    isLoading: loadingCustomers,
    isError: customersError,
  } = useGetUsersQuery();
  const {
    data: orders,
    isLoading: loadingOrders,
    isError: ordersError,
  } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  const chartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      foreColor: "#94a39a",
      fontFamily: "inherit",
    },
    colors: ["#f97316"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.24,
        opacityTo: 0.02,
      },
    },
    grid: { borderColor: "rgba(255,255,255,0.08)", strokeDashArray: 4 },
    xaxis: {
      categories: salesDetail?.map((item) => item._id) || [],
      labels: { style: { colors: "#7f8e84" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => salesInNpr(value),
        style: { colors: "#7f8e84" },
      },
    },
    tooltip: { theme: "dark" },
  };

  const chartSeries = [
    {
      name: "Sales",
      data: salesDetail?.map((item) => Number(item.totalSales)) || [],
    },
  ];

  const metrics = [
    {
      label: "Total sales",
      value: salesInNpr(Number(sales?.totalSales || 0)),
      detail: "All recorded orders",
      loading: loadingSales || loadingCurrency,
      error: salesError || (!rate && !loadingCurrency),
      icon: FiDollarSign,
    },
    {
      label: "Customers",
      value: customers?.length || 0,
      detail: "Registered accounts",
      loading: loadingCustomers,
      error: customersError,
      icon: FiUsers,
    },
    {
      label: "Orders",
      value: orders?.totalOrders || 0,
      detail: "Orders placed in the store",
      loading: loadingOrders,
      error: ordersError,
      icon: FiShoppingCart,
    },
  ];

  return (
    <main className="min-h-screen px-5 pb-12 pt-16 text-white sm:px-8 xl:pl-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/75">
            Admin portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome to Admin Portal
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Manage your store, review orders, and check sales at a glance.
          </p>
        </header>

        <section
          aria-label="Store metrics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {metrics.map((metric) => (
            <DashboardMetric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#2a211b] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Sales over time</h2>
            <p className="mt-1 text-xs text-white/45">
              Daily revenue from completed orders
            </p>
          </div>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={300}
            width="100%"
          />
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <p className="mt-1 text-sm text-white/45">
              Review payment and delivery status.
            </p>
          </div>
          <OrderList />
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
