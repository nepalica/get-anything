import { Outlet } from "react-router-dom";
import Navigation from "./pages/Auth/Navigation";
import CurrencyProvider from "./components/CurrencyProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <CurrencyProvider>
      <ToastContainer />
      <Navigation />
      <main className="py-3">
        <Outlet />
      </main>
    </CurrencyProvider>
  );
};

export default App;
