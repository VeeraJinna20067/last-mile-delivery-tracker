import {
  Outlet
} from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">
          LT
        </div>

        <div>
          <strong>
            Last-Mile Tracker
          </strong>

          <span>
            Delivery operations platform
          </span>
        </div>
      </div>

      <main className="auth-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;