import {
  NavLink
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Plus,
  Users,
  Map,
  CreditCard,
  LogOut
} from "lucide-react";

import {
  useAuth
} from "../context/AuthContext.jsx";


const Sidebar = () => {

  const {
    user,
    logout
  } = useAuth();


  const customerLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      label: "Create order",
      path: "/orders/create",
      icon: Plus
    },
    {
      label: "My orders",
      path: "/orders",
      icon: Package
    }
  ];


  const agentLinks = [
    {
      label: "Dashboard",
      path: "/agent",
      icon: LayoutDashboard
    },
    {
      label: "My deliveries",
      path: "/agent/orders",
      icon: Package
    }
  ];


  const adminLinks = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: Package
    },
    {
      label: "Agents",
      path: "/admin/agents",
      icon: Users
    },
    {
      label: "Zones",
      path: "/admin/zones",
      icon: Map
    },
    {
      label: "Rate cards",
      path: "/admin/rates",
      icon: CreditCard
    }
  ];


  let links =
    customerLinks;


  if (user?.role === "agent") {
    links = agentLinks;
  }


  if (user?.role === "admin") {
    links = adminLinks;
  }


  return (
    <aside className="sidebar">

      <div className="sidebar-header">

        <div className="sidebar-mark">
          LT
        </div>

        <div>
          <strong>
            Last-Mile
          </strong>

          <span>
            Tracker
          </span>
        </div>

      </div>


      <nav className="sidebar-nav">

        {links.map(
          ({
            label,
            path,
            icon: Icon
          }) => (

            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <Icon
                size={17}
                strokeWidth={1.8}
              />

              <span>
                {label}
              </span>

            </NavLink>
          )
        )}

      </nav>


      <div className="sidebar-bottom">

        <div className="sidebar-user">

          <div className="avatar">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div>

            <strong>
              {user?.name}
            </strong>

            <span>
              {user?.role}
            </span>

          </div>

        </div>


        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={16} />
          Sign out
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;