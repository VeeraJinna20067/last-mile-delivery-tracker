import {
  useEffect,
  useState
} from "react";

import {
  Package,
  Users,
  Truck,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RotateCcw
} from "lucide-react";

import api from "../../services/api.js";


const AdminDashboard = () => {

  const [
    stats,
    setStats
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {

    fetchDashboard();

  }, []);


  const fetchDashboard =
    async () => {

      try {

        setLoading(true);

        setError("");

        const response =
          await api.get(
            "/admin/dashboard"
          );

        setStats(
          response.data.stats
        );

      } catch (error) {

        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to load admin dashboard"
        );

      } finally {

        setLoading(false);

      }
    };


  if (loading) {

    return (
      <div className="loading-state">
        Loading admin dashboard...
      </div>
    );

  }


  if (error) {

    return (
      <div className="page-alert">
        {error}
      </div>
    );

  }


  const orderStatus =
    stats?.orderStatus || {};

  const users =
    stats?.users || {};


  return (
    <div>

      {/* -------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------- */}

      <div className="page-header">

        <div>

          <div className="agent-kicker">
            OPERATIONS
          </div>

          <h1 className="page-title">
            Overview
          </h1>

          <p className="page-subtitle">
            Monitor orders, agents and delivery activity.
          </p>

        </div>

      </div>


      {/* -------------------------------- */}
      {/* MAIN STATS */}
      {/* -------------------------------- */}

      <div className="admin-stats">


        <div className="admin-stat card">

          <div className="admin-stat-icon">
            <Package size={18} />
          </div>

          <div>

            <span>
              Total orders
            </span>

            <strong>
              {stats?.totalOrders ?? 0}
            </strong>

          </div>

        </div>


        <div className="admin-stat card">

          <div className="admin-stat-icon">
            <Users size={18} />
          </div>

          <div>

            <span>
              Customers
            </span>

            <strong>
              {users.totalCustomers ?? 0}
            </strong>

          </div>

        </div>


        <div className="admin-stat card">

          <div className="admin-stat-icon">
            <Truck size={18} />
          </div>

          <div>

            <span>
              Agents
            </span>

            <strong>
              {users.totalAgents ?? 0}
            </strong>

          </div>

        </div>


        <div className="admin-stat card">

          <div className="admin-stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>

            <span>
              Available agents
            </span>

            <strong>
              {users.availableAgents ?? 0}
            </strong>

          </div>

        </div>


      </div>


      {/* -------------------------------- */}
      {/* ORDER STATUS */}
      {/* -------------------------------- */}

      <section className="admin-section">

        <div className="section-heading">

          <div>

            <h2>
              Order activity
            </h2>

            <p>
              Current status of all delivery orders.
            </p>

          </div>

        </div>


        <div className="admin-status-grid">


          <div className="admin-status-card card">

            <span>
              Created
            </span>

            <strong>
              {orderStatus.created ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              Assigned
            </span>

            <strong>
              {orderStatus.assigned ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              Picked up
            </span>

            <strong>
              {orderStatus.pickedUp ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              In transit
            </span>

            <strong>
              {orderStatus.inTransit ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              Out for delivery
            </span>

            <strong>
              {orderStatus.outForDelivery ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              Delivered
            </span>

            <strong>
              {orderStatus.delivered ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              Failed
            </span>

            <strong>
              {orderStatus.failed ?? 0}
            </strong>

          </div>


          <div className="admin-status-card card">

            <span>
              Rescheduled
            </span>

            <strong>
              {orderStatus.rescheduled ?? 0}
            </strong>

          </div>


        </div>

      </section>


      {/* -------------------------------- */}
      {/* DELIVERY SUMMARY */}
      {/* -------------------------------- */}

      <section className="admin-section">

        <div className="section-heading">

          <div>

            <h2>
              Delivery summary
            </h2>

            <p>
              A quick view of the current operation.
            </p>

          </div>

        </div>


        <div className="admin-summary card">


          <div className="admin-summary-row">

            <div>

              <span>
                Active orders
              </span>

              <small>
                Orders that still require delivery action.
              </small>

            </div>

            <strong>
              {
                (orderStatus.assigned ?? 0) +
                (orderStatus.pickedUp ?? 0) +
                (orderStatus.inTransit ?? 0) +
                (orderStatus.outForDelivery ?? 0)
              }
            </strong>

          </div>


          <div className="admin-summary-row">

            <div>

              <span>
                Completed deliveries
              </span>

              <small>
                Orders successfully delivered.
              </small>

            </div>

            <strong>
              {orderStatus.delivered ?? 0}
            </strong>

          </div>


          <div className="admin-summary-row">

            <div>

              <span>
                Orders requiring attention
              </span>

              <small>
                Failed or rescheduled deliveries.
              </small>

            </div>

            <strong>
              {
                (orderStatus.failed ?? 0) +
                (orderStatus.rescheduled ?? 0)
              }
            </strong>

          </div>


        </div>

      </section>

    </div>
  );
};


export default AdminDashboard;