import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import {
  AuthProvider
} from "./context/AuthContext.jsx";

import ProtectedRoute
  from "./components/ProtectedRoute.jsx";

import AuthLayout
  from "./layouts/AuthLayout.jsx";

import DashboardLayout
  from "./layouts/DashboardLayout.jsx";

import Login
  from "./pages/auth/Login.jsx";

import Register
  from "./pages/auth/Register.jsx";

import CustomerDashboard
  from "./pages/customer/CustomerDashboard.jsx";

import CreateOrder
  from "./pages/customer/CreateOrder.jsx";

import Orders
  from "./pages/customer/Orders.jsx";

import OrderDetails
  from "./pages/customer/OrderDetails.jsx";

import RescheduleOrder
  from "./pages/customer/RescheduleOrder.jsx";

import AgentDashboard
  from "./pages/agent/AgentDashboard.jsx";

import AgentOrderDetails
  from "./pages/agent/AgentOrderDetails.jsx";

import AdminDashboard
  from "./pages/admin/AdminDashboard.jsx";
import Agents
  from "./pages/admin/Agents.jsx";
import AdminOrders
  from "./pages/admin/Orders.jsx";
import AdminOrderDetails
  from "./pages/admin/OrderDetails.jsx";
import AdminZones
  from "./pages/admin/Zones.jsx";
import AdminRates
  from "./pages/admin/Rates.jsx";
const App = () => {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>


          {/* =========================
              AUTH ROUTES
          ========================== */}

          <Route
            element={
              <AuthLayout />
            }
          >

            <Route
              path="/login"
              element={
                <Login />
              }
            />

            <Route
              path="/register"
              element={
                <Register />
              }
            />

          </Route>


          {/* =========================
              CUSTOMER ROUTES
          ========================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "customer"
                ]}
              />
            }
          >

            <Route
              element={
                <DashboardLayout />
              }
            >

              <Route
                path="/dashboard"
                element={
                  <CustomerDashboard />
                }
              />

              <Route
                path="/orders/create"
                element={
                  <CreateOrder />
                }
              />

              <Route
                path="/orders"
                element={
                  <Orders />
                }
              />

              <Route
                path="/orders/:id"
                element={
                  <OrderDetails />
                }
              />

              <Route
                path="/orders/:id/reschedule"
                element={
                  <RescheduleOrder />
                }
              />

            </Route>

          </Route>


          {/* =========================
              AGENT ROUTES
          ========================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "agent"
                ]}
              />
            }
          >

            <Route
              element={
                <DashboardLayout />
              }
            >

              <Route
                path="/agent"
                element={
                  <AgentDashboard />
                }
              />

              <Route
                path="/agent/orders/:id"
                element={
                  <AgentOrderDetails />
                }
              />

            </Route>

          </Route>


          {/* =========================
              ADMIN ROUTES
          ========================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin"
                ]}
              />
            }
          >

            <Route
              element={
                <DashboardLayout />
              }
            >

              <Route
                path="/admin"
                element={
                  <AdminDashboard />
                }
              />
              <Route
  path="/admin/agents"
  element={
    <Agents />
  }
/>
     <Route
  path="/admin/orders"
  element={
    <AdminOrders />
  }
/>
        <Route
  path="/admin/orders/:id"
  element={
    <AdminOrderDetails />
  }
/>
          <Route
  path="/admin/zones"
  element={
    <AdminZones />
  }
/>
             <Route
  path="/admin/rates"
  element={
    <AdminRates />
  }
/>

            </Route>

          </Route>


          {/* =========================
              ROOT
          ========================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />


          {/* =========================
              FALLBACK
          ========================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );

};


export default App;