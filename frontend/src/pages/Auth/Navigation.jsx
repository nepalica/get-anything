import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiBox,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronDown,
  FiGrid,
  FiHeart,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
  FiTag,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "../../redux/api/usersApiSlice";
import {
  logout,
  setCredentials,
} from "../../redux/features/auth/authSlice";

const storeLinks = [
  { label: "Home", to: "/", icon: FiHome },
  { label: "Shop", to: "/shop", icon: FiShoppingBag },
  { label: "Cart", to: "/cart", icon: FiShoppingCart },
  { label: "Favorites", to: "/favorite", icon: FiHeart },
];

const adminStoreLinks = [
  { label: "Storefront preview", to: "/", icon: FiHome },
];

const adminLinks = [
  { label: "Overview", to: "/admin/dashboard", icon: FiGrid },
  { label: "Categories", to: "/admin/categorylist", icon: FiTag },
  { label: "Add product", to: "/admin/productlist", icon: FiBox },
  { label: "Product catalog", to: "/admin/allproductslist", icon: FiPackage },
  { label: "Orders", to: "/admin/orderlist", icon: FiShoppingCart },
  { label: "Customers", to: "/admin/userlist", icon: FiUsers },
];

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const favorites = useSelector((state) => state.favorites);
  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !userInfo,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => localStorage.getItem("sidebar") !== "collapsed"
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark-mode");
    root.classList.toggle("sidebar-collapsed", !sidebarExpanded);
    localStorage.removeItem("theme");
    localStorage.setItem("sidebar", sidebarExpanded ? "expanded" : "collapsed");
  }, [sidebarExpanded]);

  useEffect(() => {
    if (
      currentUser &&
      (currentUser._id !== userInfo?._id ||
        currentUser.isAdmin !== userInfo?.isAdmin)
    ) {
      dispatch(setCredentials(currentUser));
    }
  }, [currentUser, dispatch, userInfo]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      setDropdownOpen(false);
      setMobileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const labelClass =
    mobileOpen || sidebarExpanded ? "inline-flex" : "hidden lg:hidden";
  const collapsedLinkClass = sidebarExpanded
    ? ""
    : "lg:justify-center lg:px-0";
  const isAdmin = currentUser?.isAdmin ?? userInfo?.isAdmin;

  const renderLinks = (links) =>
    links.map(({ label, to, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        title={label}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `group/link flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${collapsedLinkClass} ${
            isActive
              ? "bg-[#f8eee8] text-[#a9481d]"
              : "text-[#625b54] hover:bg-[#f6f4f1] hover:text-[#292724]"
          }`
        }
      >
        <Icon className="shrink-0" size={19} />
        <span className={`${labelClass} whitespace-nowrap`}>{label}</span>
        {to === "/cart" && cartItems.length > 0 && (
          <span
            className={`ml-auto items-center justify-center rounded-full bg-[#f0c46a] px-2 py-0.5 text-[10px] font-bold text-[#1b2b20] ${labelClass}`}
          >
            {cartItems.reduce((total, item) => total + item.qty, 0)}
          </span>
        )}
        {to === "/favorite" && favorites.length > 0 && (
          <span
            className={`ml-auto items-center justify-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/75 ${labelClass}`}
          >
            {favorites.length}
          </span>
        )}
      </NavLink>
    ));

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-lg border border-[#e9e5df] bg-white text-[#292724] lg:hidden"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[9998] bg-black/35 lg:hidden"
        />
      )}

      <aside
        id="navigation-container"
        className={`fixed inset-y-0 left-0 z-[9999] ${
          mobileOpen ? "flex w-64" : "hidden"
        } flex-col border-r border-[#e9e5df] bg-white px-3 pb-4 text-[#292724] lg:flex ${
          sidebarExpanded ? "lg:w-60" : "lg:w-[4.5rem]"
        }`}
      >
        <div
          className={`mb-6 flex shrink-0 border-b border-[#eeeae5] px-1 ${
            sidebarExpanded
              ? "h-[4.5rem] items-center gap-2"
              : "h-24 flex-col justify-center gap-1"
          }`}
        >
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`flex min-w-0 flex-1 items-center gap-3 ${
              !sidebarExpanded ? "lg:justify-center" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <FiShoppingBag size={20} />
            </span>
            <span className={`${labelClass} flex-col leading-tight`}>
              <span className="text-sm font-bold tracking-wide">Get Anything</span>
              <span className="mt-1 text-[11px] text-[#817970]">
                Everyday essentials
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#817970] transition-colors hover:bg-[#f6f4f1] hover:text-[#292724] lg:flex ${
              sidebarExpanded ? "" : "mx-auto"
            }`}
          >
            {sidebarExpanded ? (
              <FiChevronsLeft size={18} />
            ) : (
              <FiChevronsRight size={18} />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <p
            className={`mb-2 px-3 text-[11px] font-medium text-[#817970] ${labelClass}`}
          >
            {isAdmin ? "Storefront" : "Store"}
          </p>
          {renderLinks(isAdmin ? adminStoreLinks : storeLinks)}

          {isAdmin && (
            <div className="mt-6 border-t border-[#eeeae5] pt-4">
              <p
                className={`mb-2 px-3 text-[11px] font-medium text-[#817970] ${labelClass}`}
              >
                Admin
              </p>
              {renderLinks(adminLinks)}
            </div>
          )}
        </nav>

        <div className="relative mt-4 border-t border-[#eeeae5] pt-4">
          {userInfo ? (
            <>
              <button
                type="button"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-[#f6f4f1] ${collapsedLinkClass}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1ece5] text-sm font-semibold text-[#514a43]">
                  {userInfo.username?.slice(0, 1).toUpperCase()}
                </span>
                <span className={`${labelClass} min-w-0 flex-1 flex-col`}>
                  <span className="truncate text-sm font-medium text-[#292724]">
                    {userInfo.username}
                  </span>
                  <span className="mt-0.5 text-xs text-[#817970]">
                    {userInfo.isAdmin ? "Administrator" : "Account"}
                  </span>
                </span>
                <FiChevronDown
                  className={`${labelClass} shrink-0 text-[#817970]`}
                  size={15}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute bottom-14 left-2 z-[10002] w-56 rounded-lg border border-[#e9e5df] bg-white p-2 shadow-lg">
                  {userInfo.isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[#a9481d] transition-colors hover:bg-[#f6f4f1]"
                    >
                      <FiGrid size={16} />
                      Admin dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => {
                      setDropdownOpen(false);
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[#625b54] transition-colors hover:bg-[#f6f4f1] hover:text-[#292724]"
                  >
                    <FiUser size={16} />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logoutHandler}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-[#625b54] transition-colors hover:bg-[#f6f4f1] hover:text-[#292724]"
                  >
                    <FiLogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#625b54] transition-colors hover:bg-[#f6f4f1] hover:text-[#292724]"
              >
                <FiLogIn className="shrink-0" size={19} />
                <span className={`${labelClass} whitespace-nowrap`}>Sign in</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#625b54] transition-colors hover:bg-[#f6f4f1] hover:text-[#292724]"
              >
                <FiUserPlus className="shrink-0" size={19} />
                <span className={`${labelClass} whitespace-nowrap`}>
                  Create account
                </span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navigation;
