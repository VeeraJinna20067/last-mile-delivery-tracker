import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Package,
  Search
} from "lucide-react";

import api from "../../services/api.js";


const Orders = () => {

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
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      return orders.filter(
        (order) => {

          const matchesStatus =
            statusFilter === "ALL" ||
            order.status === statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            order.orderNumber
              ?.toLowerCase()
              .includes(query) ||

            order.customerId?.name
              ?.toLowerCase()
              .includes(query) ||

            order.agentId?.name
              ?.toLowerCase()
              .includes(query) ||

            order.pickupAddress
              ?.toLowerCase()
              .includes(query) ||

            order.dropAddress
              ?.toLowerCase()
              .includes(query)
          );

        }
      );

    }, [
      orders,
      search,
      statusFilter
    ]);


  const formatDate = (date) => {

    if (!date) {
      return "—";
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


  if (loading) {

    return (
      <div className="loading-state">
        Loading orders...
      </div>
    );

  }


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
            Orders
          </h1>

          <p className="page-subtitle">
            Monitor every delivery order in the system.
          </p>

        </div>

      </div>


      {error && (
        <div className="page-alert">
          {error}
        </div>
      )}


      {/* -------------------------------- */}
      {/* FILTER BAR */}
      {/* -------------------------------- */}

      <div className="admin-order-toolbar card">

        <div className="admin-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search order, customer or agent..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="admin-status-filter"
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
            Picked up
          </option>

          <option value="IN_TRANSIT">
            In transit
          </option>

          <option value="OUT_FOR_DELIVERY">
            Out for delivery
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


      {/* -------------------------------- */}
      {/* RESULT COUNT */}
      {/* -------------------------------- */}

      <div className="admin-order-result">

        Showing{" "}
        <strong>
          {filteredOrders.length}
        </strong>{" "}
        of{" "}
        <strong>
          {orders.length}
        </strong>{" "}
        orders

      </div>


      {/* -------------------------------- */}
      {/* ORDER LIST */}
      {/* -------------------------------- */}

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

              <div
                key={order._id}
                className="admin-order-card card"
              >

                <div className="admin-order-main">

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


                <div className="admin-order-route">

                  <div>

                    <span>
                      PICKUP
                    </span>

                    <strong>
                      {order.pickupAddress}
                    </strong>

                  </div>

                  <div>

                    <span>
                      DROP
                    </span>

                    <strong>
                      {order.dropAddress}
                    </strong>

                  </div>

                </div>


                <div className="admin-order-people">

                  <div>

                    <span>
                      CUSTOMER
                    </span>

                    <strong>
                      {order.customerId?.name ||
                        "—"}
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

                </div>


                <div className="admin-order-status">

                  <span
                    className={`status-badge status-${order.status
                      ?.toLowerCase()
                      .replaceAll(
                        "_",
                        "-"
                      )}`}
                  >
                    {order.status
                      ?.replaceAll(
                        "_",
                        " "
                      )}
                  </span>

                  <strong>
                    ₹{order.totalAmount}
                  </strong>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
};


export default Orders;