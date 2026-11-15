import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../../redux/api/usersApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery(
    undefined,
    { skip: !userInfo }
  );

  if (!userInfo) {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Message variant="danger">
        Could not verify administrator access. Check the backend connection and
        try again.
      </Message>
    );
  }

  if (currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#211a16] text-white">
        <Outlet />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-24 text-[#28221e] lg:pl-28">
      <section className="mx-auto max-w-xl rounded-2xl border border-[#eadfd4] bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          Access not enabled
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[#28221e]">
          This account is not an administrator
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#756a61]">
          Signed in as {userInfo.username}. Set ADMIN_EMAIL in the project
          .env to this account&apos;s email, then run{" "}
          <code className="rounded bg-[#f7f4ef] px-1.5 py-0.5 text-[#51463e]">
            npm run make-admin
          </code>
          . Sign out and sign in again after the command succeeds.
        </p>
      </section>
    </main>
  );
};

export default AdminRoute;
