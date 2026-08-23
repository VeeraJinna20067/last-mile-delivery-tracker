import { useEffect, useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api.js";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/orders/my-orders");

      setOrders(
        response.data.orders || []
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  if (loading) {
    return (
      <div className="loading-state">
        Loading your orders...
      </div>
    );
  }

  return (
    <div>

      <div className="page-header">

        <div>
          <h1 className="page-title">
            My orders
          </h1>

          <p className="page-subtitle">
            View and track all your delivery orders.
          </p>
        </div>

        <Link
          to="/orders/create"
          className="btn btn-primary"
        >
          Create order
        </Link>

      </div>


      {error && (
        <div className="page-alert">
          {error}
        </div>
      )}


      {orders.length === 0 ? (

        <div className="empty-state card">

          <Package size={26} />

          <h3>
            No orders found
          </h3>

          <p>
            Your delivery orders will appear here.
          </p>

          <Link
            to="/orders/create"
            className="btn btn-secondary"
          >
            Create your first order
          </Link>

        </div>

      ) : (

        <div className="orders-list">

          {orders.map((order) => (

            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="order-row card"
            >

              <div className="order-main">

                <div className="order-icon">
                  <Package size={18} />
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


              <div className="order-route">

                <span>
                  {order.pickupAddress}
                </span>

                <ChevronRight
                  size={14}
                />

                <span>
                  {order.dropAddress}
                </span>

              </div>


              <div className="order-meta">

                <span
                  className={`status-badge status-${order.status
                    ?.toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  {order.status
                    ?.replaceAll("_", " ")}
                </span>

                <strong>
                  ₹{order.totalAmount}
                </strong>

              </div>


              <ChevronRight
                size={17}
                className="order-arrow"
              />

            </Link>

          ))}

        </div>

      )}

    </div>
  );
};

export default Orders;