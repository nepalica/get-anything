import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await register({ username, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("User successfully registered");
      } catch (err) {
        toast.error(
          err?.data?.message ||
            (typeof err?.data === "string" ? err.data : undefined) ||
            err?.error ||
            "Could not create your account. Please try again."
        );
      }
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[36rem] items-center justify-center px-4 py-10 lg:ml-60">
      <div className="w-full rounded-xl border border-[#e9e5df] bg-white p-6 sm:p-9">
        <p className="text-sm font-medium text-[#98502c]">
          Get Anything
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#28221e]">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-[#756a61]">
          A few details and your everyday essentials are a step closer.
        </p>

        <form onSubmit={submitHandler} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[#51463e]"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-[#ded8d0] bg-white px-4 py-3 text-[#292724] outline-none transition placeholder:text-[#a99d93] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#51463e]"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-[#ded8d0] bg-white px-4 py-3 text-[#292724] outline-none transition placeholder:text-[#a99d93] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-[#ded8d0] bg-white px-4 py-3 text-[#292724] outline-none transition placeholder:text-[#a99d93] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[#51463e]"
            >
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-[#ded8d0] bg-white px-4 py-3 text-[#292724] outline-none transition placeholder:text-[#a99d93] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-[#c45826] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#a9471b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          {isLoading && <Loader />}
        </form>

        <p className="mt-6 border-t border-[#eee4db] pt-5 text-sm text-[#756a61]">
          Already have an account?{" "}
          <Link
            to={redirect ? `/login?redirect=${redirect}` : "/login"}
            className="font-medium text-orange-700 transition hover:text-orange-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
