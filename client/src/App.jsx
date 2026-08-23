import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import {
  AuthProvider
} from "./context/AuthContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import CreateOrder from "./pages/customer/CreateOrder.jsx";
import Orders from "./pages/customer/Orders.jsx";
import OrderDetails from "./pages/customer/OrderDetails.jsx";
import RescheduleOrder from "./pages/customer/RescheduleOrder.jsx";

import AgentDashboard from "./pages/agent/AgentDashboard.jsx";
import AgentOrderDetails from "./pages/agent/AgentOrderDetails.jsx";


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