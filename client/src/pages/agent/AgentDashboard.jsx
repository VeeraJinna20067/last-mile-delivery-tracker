import {
  useEffect,
  useState
} from "react";

import {
  Package,
  MapPin,
  Clock3,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import api from "../../services/api.js";


const AgentDashboard = () => {

  const [
    orders,
    setOrders
  ] = useState([]);

  const [
    agent,
    setAgent
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    updatingAvailability,
    setUpdatingAvailability
  ] = useState(false);

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

        const [
          profileResponse,
          ordersResponse
        ] = await Promise.all([
          api.get("/agents/me"),
          api.get("/agents/my-orders")
        ]);


        setAgent(
          profileResponse.data.agent
        );

        setOrders(
          ordersResponse.data.orders || []
        );


      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to load dashboard"
        );

      } finally {

        setLoading(false);

      }
    };


  const toggleAvailability =
    async () => {

      if (!agent) return;


      try {

        setUpdatingAvailability(true);


        const newStatus =
          !agent.isAvailable;


        const response =
          await api.put(
            "/agents/availability",
            {
              isAvailable:
                newStatus
            }
          );


     setAgent((currentAgent) => ({
  ...currentAgent,
  isAvailable: response.data.isAvailable
}));


      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to update availability"
        );

      } finally {

        setUpdatingAvailability(false);

      }
    };


  const activeOrders =
    orders.filter(
      (order) =>
        ![
          "DELIVERED",
          "FAILED"
        ].includes(
          order.status
        )
    );


  const completedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "DELIVERED"
    );
    const assignedOrders =
  orders.filter(
    (order) =>
      order.status === "ASSIGNED"
  );

const pickedUpOrders =
  orders.filter(
    (order) =>
      order.status === "PICKED_UP"
  );

const inTransitOrders =
  orders.filter(
    (order) =>
      [
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY"
      ].includes(order.status)
  );


  const formatTime = (date) => {

    if (!date) return "—";

    return new Date(date)
      .toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );
  };


  if (loading) {

    return (
      <div className="loading-state">
        Loading delivery workspace...
      </div>
    );

  }


  return (
    <div>

      <div className="page-header">

        <div>

          <div className="agent-kicker">
            DELIVERY WORKSPACE
          </div>

         <h1 className="page-title">
  Good morning, {agent?.name?.split(" ")[0] || "Agent"}
</h1>
          <p className="page-subtitle">
  Here are the deliveries currently assigned to you.
</p>

        </div>


        <button
          className={
            agent?.isAvailable
              ? "availability-button online"
              : "availability-button"
          }
          onClick={
            toggleAvailability
          }
          disabled={
            updatingAvailability
          }
        >

          <span className="availability-dot" />

          {updatingAvailability
            ? "Updating..."
            : agent?.isAvailable
              ? "Online"
              : "Offline"}

        </button>

      </div>


      {error && (
        <div className="page-alert">
          {error}
        </div>
      )}


     <div className="agent-stats">

  <div className="agent-stat card">

    <div className="stat-icon">
      <Package size={18} />
    </div>

    <div>
      <span>
        Assigned
      </span>

      <strong>
        {assignedOrders.length}
      </strong>
    </div>

  </div>


  <div className="agent-stat card">

    <div className="stat-icon">
      <MapPin size={18} />
    </div>

    <div>
      <span>
        Picked up
      </span>

      <strong>
        {pickedUpOrders.length}
      </strong>
    </div>

  </div>


  <div className="agent-stat card">

    <div className="stat-icon">
      <Clock3 size={18} />
    </div>

    <div>
      <span>
        In transit
      </span>

      <strong>
        {inTransitOrders.length}
      </strong>
    </div>

  </div>


  <div className="agent-stat card">

    <div className="stat-icon">
      <CheckCircle2 size={18} />
    </div>

    <div>
      <span>
        Delivered
      </span>

      <strong>
        {completedOrders.length}
      </strong>
    </div>

  </div>

</div>
      <section className="agent-section">

        <div className="section-heading">

          <div>
            <h2>
              Assigned deliveries
            </h2>

            <p>
              Orders currently assigned to you.
            </p>
          </div>

        </div>


        {orders.length === 0 ? (

          <div className="empty-state card">

            <Package size={25} />

            <h3>
              No deliveries assigned
            </h3>

            <p>
              New assignments will appear here.
            </p>

          </div>

        ) : (

          <div className="agent-order-list">

            {orders.map(
              (order) => (

                <Link
                  key={order._id}
                  to={`/agent/orders/${order._id}`}
                  className="agent-order card"
                >

                  <div className="agent-order-id">

                    <div className="order-icon">
                      <Package size={17} />
                    </div>

                    <div>

                      <strong>
                        {order.orderNumber}
                      </strong>

                      <span>
                        {formatTime(
                          order.createdAt
                        )}
                      </span>

                    </div>

                  </div>


                  <div className="agent-route">

                    <div>
                      <span>
                        PICKUP
                      </span>

                      <strong>
                        {order.pickupAddress}
                      </strong>
                    </div>

                    <ArrowRight
                      size={15}
                    />

                    <div>
                      <span>
                        DROP
                      </span>

                      <strong>
                        {order.dropAddress}
                      </strong>
                    </div>

                  </div>


                 <div className="agent-order-status">

  <div className="agent-order-meta">

    <span>
      {order.orderType}
    </span>

    <span>
      {order.paymentType}
    </span>

  </div>

  <span
    className={`status-badge status-${order.status
      ?.toLowerCase()
      .replaceAll("_", "-")}`}
  >
    {order.status
      ?.replaceAll("_", " ")}
  </span>

</div>

                </Link>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
};


export default AgentDashboard;