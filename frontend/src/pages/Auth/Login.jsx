import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      const nextPath =
        userInfo.isAdmin && redirect === "/"
          ? "/admin/dashboard"
          : !userInfo.isAdmin && redirect.startsWith("/admin")
            ? "/"
            : redirect;
      navigate(nextPath);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email: identifier.trim(), password }).unwrap();
      dispatch(setCredentials({ ...res }));
      const nextPath =
        res.isAdmin && redirect === "/"
          ? "/admin/dashboard"
          : !res.isAdmin && redirect.startsWith("/admin")
            ? "/"
            : redirect;

      if (
        !res.isAdmin &&
        (redirect.startsWith("/admin") ||
          identifier.trim().toLowerCase() === "admin")
      ) {
        toast.error(
          "This account does not have admin access yet. Set ADMIN_EMAIL and run npm run make-admin."
        );
      }

      navigate(nextPath);
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || "Could not sign in. Please try again."
      );
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[36rem] items-center justify-center px-4 py-10 lg:ml-60">
      <div className="w-full rounded-xl border border-[#e9e5df] bg-white p-6 sm:p-9">
        <p className="text-sm font-medium text-[#98502c]">
          Get Anything
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#28221e]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#756a61]">
          Sign in to pick up where you left off.
        </p>

        <form onSubmit={submitHandler} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="identifier"
              className="mb-2 block text-sm font-medium text-[#51463e]"
            >
              Username or email
            </label>
            <input
              type="text"
              id="identifier"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-[#ded8d0] bg-white px-4 py-3 text-[#292724] outline-none transition placeholder:text-[#a99d93] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#51463e]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-[#ded8d0] bg-white px-4 py-3 text-[#292724] outline-none transition placeholder:text-[#a99d93] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-[#c45826] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#a9471b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {isLoading && <Loader />}
        </form>

        <p className="mt-6 border-t border-[#eee4db] pt-5 text-sm text-[#756a61]">
          New to Get Anything?{" "}
          <Link
            to={redirect ? `/register?redirect=${redirect}` : "/register"}
            className="font-medium text-orange-700 transition hover:text-orange-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
