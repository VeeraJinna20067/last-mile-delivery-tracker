import {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  MapPin,
  Package,
  Phone,
  UserRound
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../../services/api.js";


const nextActions = {
  ASSIGNED: {
    label: "Confirm pickup",
    nextStatus: "PICKED_UP"
  },

  PICKED_UP: {
    label: "Start transit",
    nextStatus: "IN_TRANSIT"
  },

  IN_TRANSIT: {
    label: "Out for delivery",
    nextStatus: "OUT_FOR_DELIVERY"
  },

  OUT_FOR_DELIVERY: {
    label: "Mark delivered",
    nextStatus: "DELIVERED"
  }
};


const AgentOrderDetails = () => {

  const {
    id
  } = useParams();

  const navigate =
    useNavigate();


  const [
    order,
    setOrder
  ] = useState(null);


  const [
    tracking,
    setTracking
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    updating,
    setUpdating
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {

    fetchOrder();

  }, [id]);


  const fetchOrder =
    async () => {

      try {

        setLoading(true);

        const [
          orderResponse,
          trackingResponse
        ] = await Promise.all([
          api.get(
            `/orders/${id}`
          ),

          api.get(
            `/tracking/orders/${id}`
          )
        ]);


        setOrder(
          orderResponse.data.order
        );

        setTracking(
          trackingResponse.data.tracking || []
        );


      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to load delivery"
        );

      } finally {

        setLoading(false);

      }
    };


  const updateStatus =
  async (status) => {

    try {

      setUpdating(true);

      setError("");

      await api.put(
        `/agents/orders/${id}/status`,
        {
          status
        }
      );

      await fetchOrder();

    } catch (error) {

      console.error(
        "Update delivery status error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to update delivery status"
      );

    } finally {

      setUpdating(false);

    }
  };

  const markFailed =
    async () => {

      const reason =
        window.prompt(
          "Enter the reason for failed delivery:"
        );


      if (!reason?.trim()) {
        return;
      }


      try {

        setUpdating(true);

        setError("");


        await api.put(
          `/tracking/orders/${id}/status`,
          {
            status: "FAILED",
            remarks: reason
          }
        );


        await fetchOrder();


      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to mark delivery as failed"
        );

      } finally {

        setUpdating(false);

      }
    };


  if (loading) {

    return (
      <div className="loading-state">
        Loading delivery...
      </div>
    );

  }


  if (!order) {

    return (
      <div>

        <div className="page-alert">
          {error || "Order not found"}
        </div>

        <Link
          to="/agent"
          className="btn btn-secondary"
        >
          Back to dashboard
        </Link>

      </div>
    );

  }


  const action =
    nextActions[
      order.status
    ];


  return (
    <div>

      <Link
        to="/agent"
        className="back-link"
      >
        <ArrowLeft size={15} />
        Back to deliveries
      </Link>


      <div className="page-header">

        <div>

          <div className="order-number">
            {order.orderNumber}
          </div>

          <h1 className="page-title">
            Delivery
          </h1>

          <p className="page-subtitle">
            Update the shipment as you complete each step.
          </p>

        </div>


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

      </div>


      {error && (
        <div className="page-alert">
          {error}
        </div>
      )}


      <div className="agent-detail-layout">

        <main>

          {/* ACTION */}

          {action && (

            <section className="agent-action card">

              <div>

                <span>
                  NEXT STEP
                </span>

                <h2>
                  {action.label}
                </h2>

                <p>
                  Confirm this action after completing the current delivery step.
                </p>

              </div>


              <button
                className="btn btn-primary"
                onClick={() =>
                  updateStatus(
                    action.nextStatus
                  )
                }
                disabled={updating}
              >
                {updating
                  ? "Updating..."
                  : action.label}
              </button>

            </section>

          )}


          {order.status ===
            "OUT_FOR_DELIVERY" && (

            <section className="failed-action card">

              <div>

                <strong>
                  Unable to complete delivery?
                </strong>

                <p>
                  Record the reason if the customer cannot receive the package.
                </p>

              </div>

              <button
                className="btn btn-danger"
                onClick={markFailed}
                disabled={updating}
              >
                Mark as failed
              </button>

            </section>

          )}


          {/* ROUTE */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>
                <h2>
                  Delivery route
                </h2>

                <p>
                  Pickup and drop information.
                </p>
              </div>

              <MapPin size={18} />

            </div>


            <div className="agent-route-detail">

              <div className="agent-route-point">

                <div className="agent-route-marker">
                  P
                </div>

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

              </div>


              <div className="agent-route-connector" />


              <div className="agent-route-point">

                <div className="agent-route-marker drop">
                  D
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

            </div>

          </section>


          {/* TRACKING */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>

                <h2>
                  Delivery history
                </h2>

                <p>
                  Recorded status updates.
                </p>

              </div>

            </div>


            <div className="agent-history">

              {tracking.length === 0 ? (

                <p className="text-muted">
                  No tracking events recorded.
                </p>

              ) : (

                tracking.map(
                  (event) => (

                    <div
                      className="agent-history-row"
                      key={event._id}
                    >

                      <div className="history-marker" />

                      <div>

                        <strong>
                          {event.status
                            ?.replaceAll(
                              "_",
                              " "
                            )}
                        </strong>

                        <p>
                          {event.remarks ||
                            "Status updated"}
                        </p>

                      </div>

                      <span>
                        {new Date(
                          event.timestamp ||
                          event.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </section>

        </main>


        <aside>

          {/* CUSTOMER */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>
                <h2>
                  Customer
                </h2>
              </div>

              <UserRound size={17} />

            </div>


            <div className="customer-detail">

              <div className="agent-avatar">
                {order.customerId?.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div>

                <strong>
                  {order.customerId?.name ||
                    "Customer"}
                </strong>

                <span>
                  {order.customerId?.phone ||
                    "Phone unavailable"}
                </span>

              </div>

            </div>


            {order.customerId?.phone && (

              <a
                href={`tel:${order.customerId.phone}`}
                className="call-customer"
              >
                <Phone size={15} />
                Call customer
              </a>

            )}

          </section>


          {/* PACKAGE */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>
                <h2>
                  Package
                </h2>
              </div>

              <Package size={17} />

            </div>


            <div className="info-list">

              <div>

                <span>
                  Dimensions
                </span>

                <strong>
                 {order.package?.length} ×{" "}
{order.package?.breadth} ×{" "}
{order.package?.height} cm
                </strong>

              </div>


              <div>

                <span>
                  Weight
                </span>

                <strong>
                  {order.package?.chargeableWeight} kg
                </strong>

              </div>


              <div>

                <span>
                  Payment
                </span>

                <strong>
                  {order.paymentType}
                </strong>

              </div>


              <div>

                <span>
                  Amount
                </span>

                <strong>
                  ₹{order.totalAmount}
                </strong>

              </div>

            </div>

          </section>

        </aside>

      </div>

    </div>
  );
};


export default AgentOrderDetails;