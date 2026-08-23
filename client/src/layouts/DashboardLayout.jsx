import {
  Outlet
} from "react-router-dom";

import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

const DashboardLayout = () => {

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        <main className="dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;