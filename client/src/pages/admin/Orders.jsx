import {
  useEffect,
  useState
} from "react";

import {
  Package,
  Search
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import api from "../../services/api.js";


const AdminOrders = () => {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");


  useEffect(() => {

    fetchOrders();

  }, []);


  const fetchOrders = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await api.get(
          "/admin/orders"
        );

      setOrders(
        response.data.orders || []
      );

    } catch (error) {

      console.error(
        "Fetch admin orders error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load orders"
      );

    } finally {

      setLoading(false);

    }

  };


  const filteredOrders =
    orders.filter((order) => {

      const searchValue =
        search.toLowerCase().trim();


      const matchesSearch =
        !searchValue ||

        order.orderNumber
          ?.toLowerCase()
          .includes(searchValue) ||

        order.customerId?.name
          ?.toLowerCase()
          .includes(searchValue) ||

        order.agentId?.name
          ?.toLowerCase()
          .includes(searchValue) ||

        order.pickupAddress
          ?.toLowerCase()
          .includes(searchValue) ||

        order.dropAddress
          ?.toLowerCase()
          .includes(searchValue);


      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  const formatAmount = (amount) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }
    ).format(amount || 0);

  };


  const formatDate = (date) => {

    if (!date) return "—";

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

    if (!status) return "—";

    return status.replaceAll(
      "_",
      " "
    );

  };


  if (loading) {

    return (
      <div className="loading-state">
        Loading orders...
      </div>
    );

  }


  return (
    <div>

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="page-header">

        <div>

          <div className="agent-kicker">
            OPERATIONS
          </div>

          <h1 className="page-title">
            Delivery Orders
          </h1>

          <p className="page-subtitle">
            Monitor all shipments and their current delivery status.
          </p>

        </div>

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
          FILTER BAR
      ========================== */}

      <div className="card admin-orders-toolbar">

        <div className="admin-order-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search order, customer, agent..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
          className="admin-order-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="ALL">
            All statuses
          </option>

          <option value="CREATED">
            Created
          </option>

          <option value="ASSIGNED">
            Assigned
          </option>

          <option value="PICKED_UP">
            Picked Up
          </option>

          <option value="IN_TRANSIT">
            In Transit
          </option>

          <option value="OUT_FOR_DELIVERY">
            Out for Delivery
          </option>

          <option value="DELIVERED">
            Delivered
          </option>

          <option value="FAILED">
            Failed
          </option>

          <option value="RESCHEDULED">
            Rescheduled
          </option>

        </select>

      </div>


      {/* =========================
          ORDER COUNT
      ========================== */}

      <div className="admin-orders-summary">

        <span>
          Showing
        </span>

        <strong>
          {filteredOrders.length}
        </strong>

        <span>
          of {orders.length} orders
        </span>

      </div>


      {/* =========================
          ORDERS
      ========================== */}

      {filteredOrders.length === 0 ? (

        <div className="empty-state card">

          <Package size={25} />

          <h3>
            No orders found
          </h3>

          <p>
            Try changing your search or status filter.
          </p>

        </div>

      ) : (

        <div className="admin-order-list">

          {filteredOrders.map(
            (order) => (

              <Link
                key={order._id}
                to={`/admin/orders/${order._id}`}
                className="card admin-order-card"
              >

                {/* =========================
                    ORDER HEADER
                ========================== */}

                <div className="admin-order-header">

                  <div className="admin-order-number">

                    <div className="order-icon">

                      <Package size={17} />

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

                </div>


                {/* =========================
                    ORDER BODY
                ========================== */}

                <div className="admin-order-body">

                  {/* ROUTE */}

                  <div className="admin-order-route">

                    <div>

                      <span>
                        PICKUP
                      </span>

                      <strong>
                        {order.pickupAddress}
                      </strong>

                      <small>
                        {order.pickupPincode}
                      </small>

                    </div>


                    <div className="admin-order-arrow">
                      →
                    </div>


                    <div>

                      <span>
                        DROP
                      </span>

                      <strong>
                        {order.dropAddress}
                      </strong>

                      <small>
                        {order.dropPincode}
                      </small>

                    </div>

                  </div>


                  {/* ORDER DETAILS */}

                  <div className="admin-order-details">

                    <div>

                      <span>
                        CUSTOMER
                      </span>

                      <strong>
                        {order.customerId?.name ||
                          "Unknown"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        AGENT
                      </span>

                      <strong>
                        {order.agentId?.name ||
                          "Not assigned"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        PAYMENT
                      </span>

                      <strong>
                        {order.paymentType ||
                          "—"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        AMOUNT
                      </span>

                      <strong>
                        {formatAmount(
                          order.totalAmount
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              </Link>

            )
          )}

        </div>

      )}

    </div>
  );

};


export default AdminOrders;