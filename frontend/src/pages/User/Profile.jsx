import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link } from "react-router-dom";

const Profile = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    setUserName(userInfo.username);
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.username]);

  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          username,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success("Profile updated successfully");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:pl-60">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            Your account
          </p>
          <h2 className="mb-6 mt-2 text-2xl font-semibold text-[#28221e]">
            Profile details
          </h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[#51463e]">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[#51463e]">
                Email address
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[#51463e]">
                New password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[#51463e]">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full rounded-xl border border-[#e5d9cf] bg-[#fcfaf8] px-4 py-3 text-[#28221e]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Update
              </button>

              <Link
                to="/user-orders"
                className="rounded-xl border border-[#eadfd4] px-5 py-3 font-semibold text-[#75421f] transition hover:bg-[#fff7ef]"
              >
                My Orders
              </Link>
            </div>
            {loadingUpdateProfile && <Loader />}
          </form>
      </div>
    </main>
  );
};

export default Profile;
