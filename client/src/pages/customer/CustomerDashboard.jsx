import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  Package,
  Truck,
  Clock3,
  CheckCircle2
} from "lucide-react";

import api from "../../services/api.js";


const CustomerDashboard = () => {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    fetchOrders();

  }, []);


  const fetchOrders = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get(
          "/orders/my-orders"
        );


      const orderData =
        response.data.orders || [];


      setOrders(orderData);


    } catch (error) {

      console.error(
        "Dashboard orders error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load your orders."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * ==============================
   * ORDER COUNTS
   * ==============================
   */

  const totalOrders =
    orders.length;


  const inTransit =
    orders.filter(
      (order) =>
        order.status === "IN_TRANSIT"
    ).length;


  const awaitingDelivery =
    orders.filter(
      (order) =>
        [
          "ASSIGNED",
          "PICKED_UP",
          "OUT_FOR_DELIVERY"
        ].includes(
          order.status
        )
    ).length;


  const delivered =
    orders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length;


  /*
   * ==============================
   * RECENT ORDERS
   * ==============================
   */

  const recentOrders =
    [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);


  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );
  };


  const formatStatus = (status) => {

    return status
      ?.replaceAll(
        "_",
        " "
      );
  };


  return (
    <div>

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Overview
          </h1>

          <p className="page-subtitle">
            Keep track of your deliveries and create new shipments.
          </p>

        </div>


        <Link
          to="/orders/create"
          className="btn btn-primary"
        >
          Create order
        </Link>

      </div>


      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="page-alert">
          {error}
        </div>
      )}


      {/* =========================
          STATISTICS
      ========================== */}

      <div className="stats-grid">

        {/* TOTAL */}

        <div className="stat-card">

          <div className="stat-icon">
            <Package size={18} />
          </div>

          <span>
            Total orders
          </span>

          <strong>
            {loading
              ? "..."
              : totalOrders}
          </strong>

        </div>


        {/* IN TRANSIT */}

        <div className="stat-card">

          <div className="stat-icon">
            <Truck size={18} />
          </div>

          <span>
            In transit
          </span>

          <strong>
            {loading
              ? "..."
              : inTransit}
          </strong>

        </div>


        {/* AWAITING */}

        <div className="stat-card">

          <div className="stat-icon">
            <Clock3 size={18} />
          </div>

          <span>
            Awaiting delivery
          </span>

          <strong>
            {loading
              ? "..."
              : awaitingDelivery}
          </strong>

        </div>


        {/* DELIVERED */}

        <div className="stat-card">

          <div className="stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <span>
            Delivered
          </span>

          <strong>
            {loading
              ? "..."
              : delivered}
          </strong>

        </div>

      </div>


      {/* =========================
          RECENT ORDERS
      ========================== */}

      <div className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Recent orders
            </h2>

            <p>
              Your latest delivery activity.
            </p>

          </div>


          <Link
            to="/orders"
            className="section-link"
          >
            View all
          </Link>

        </div>


        {loading ? (

          <div className="empty-state card">

            <Package size={25} />

            <h3>
              Loading orders...
            </h3>

            <p>
              Getting your latest delivery activity.
            </p>

          </div>

        ) : recentOrders.length === 0 ? (

          <div className="empty-state card">

            <Package size={25} />

            <h3>
              No orders yet
            </h3>

            <p>
              Create your first delivery order to see it here.
            </p>

            <Link
              to="/orders/create"
              className="btn btn-secondary"
            >
              Create an order
            </Link>

          </div>

        ) : (

          <div className="recent-order-list card">

            {recentOrders.map(
              (order) => (

                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="recent-order-row"
                >

                  <div className="recent-order-main">

                    <div className="recent-order-icon">
                      <Package size={16} />
                    </div>


                    <div>

                      <strong>
                        {order.orderNumber}
                      </strong>

                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </div>

                  </div>


                  <div className="recent-order-route">

                    <span>
                      {order.pickupAddress}
                    </span>

                    <span className="route-arrow">
                      →
                    </span>

                    <span>
                      {order.dropAddress}
                    </span>

                  </div>


                  <span
                    className={`status-badge status-${order.status
                      ?.toLowerCase()
                      .replaceAll(
                        "_",
                        "-"
                      )}`}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>

                </Link>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
};


export default CustomerDashboard;