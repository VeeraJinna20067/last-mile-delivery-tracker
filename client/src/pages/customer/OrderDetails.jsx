import {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  MapPin,
  Package,
  CreditCard,
  UserRound,
  CalendarDays
} from "lucide-react";

import {
  Link,
  useParams
} from "react-router-dom";

import api from "../../services/api.js";

const statusSteps = [
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

const OrderDetails = () => {

  const {
    id
  } = useParams();


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
    error,
    setError
  ] = useState("");


  useEffect(() => {

    fetchOrder();

  }, [id]);


  const fetchOrder = async () => {

    try {

      setLoading(true);

      const [
        orderResponse,
        trackingResponse
      ] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get(`/tracking/orders/${id}`)
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
        "Unable to load order"
      );

    } finally {

      setLoading(false);

    }
  };


  const formatDate = (date) => {

    if (!date) return "—";

    return new Date(date)
      .toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );
  };


  const getStepState = (
    step
  ) => {

    const currentIndex =
      statusSteps.indexOf(
        order?.status
      );

    const stepIndex =
      statusSteps.indexOf(step);


    if (
      order?.status === "FAILED"
    ) {
      return "failed";
    }


    if (
      order?.status === "RESCHEDULED"
    ) {

      if (step === "CREATED") {
        return "completed";
      }

      return "pending";
    }


    if (stepIndex < currentIndex) {
      return "completed";
    }


    if (stepIndex === currentIndex) {
      return "current";
    }


    return "pending";
  };


  if (loading) {
    return (
      <div className="loading-state">
        Loading order...
      </div>
    );
  }


  if (error || !order) {
    return (
      <div>

        <div className="page-alert">
          {error || "Order not found"}
        </div>

        <Link
          to="/orders"
          className="btn btn-secondary"
        >
          Back to orders
        </Link>

      </div>
    );
  }


  return (
    <div>

      <Link
        to="/orders"
        className="back-link"
      >
        <ArrowLeft size={15} />
        Back to orders
      </Link>


      <div className="page-header order-detail-header">

        <div>

          <div className="order-number">
            {order.orderNumber}
          </div>

          <h1 className="page-title">
            Delivery details
          </h1>

          <p className="page-subtitle">
            Created {formatDate(order.createdAt)}
          </p>

        </div>

<div className="detail-status-area">

  <span
    className={`status-badge status-${order.status
      ?.toLowerCase()
      .replaceAll("_", "-")}`}
  >
    {order.status?.replaceAll("_", " ")}
  </span>

  {order.status === "FAILED" && (
    <Link
      to={`/orders/${order._id}/reschedule`}
      className="btn btn-primary reschedule-button"
    >
      Reschedule delivery
    </Link>
  )}

</div>

      </div>


      <div className="detail-grid">

        <div className="detail-main">

          {/* TRACKING */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>
                <h2>
                  Delivery progress
                </h2>

                <p>
                  Latest updates for this shipment.
                </p>
              </div>

            </div>


            <div className="tracking-timeline">

              {statusSteps.map(
                (step, index) => {

                  const state =
                    getStepState(step);

                  const event =
                    tracking.find(
                      (item) =>
                        item.status === step
                    );


                  return (
                    <div
                      className={`timeline-item ${state}`}
                      key={step}
                    >

                      <div className="timeline-marker">

                        {state === "completed"
                          ? "✓"
                          : state === "current"
                            ? "•"
                            : index + 1}

                      </div>


                      <div className="timeline-content">

                        <div className="timeline-top">

                          <strong>
                            {step.replaceAll(
                              "_",
                              " "
                            )}
                          </strong>

                          {event && (
                            <span>
                              {formatDate(
                                event.timestamp
                              )}
                            </span>
                          )}

                        </div>


                        {event?.remarks && (
                          <p>
                            {event.remarks}
                          </p>
                        )}

                      </div>

                    </div>
                  );
                }
              )}


              {order.status === "FAILED" && (

                <div className="timeline-item failed">

                  <div className="timeline-marker">
                    !
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-top">

                      <strong>
                        DELIVERY FAILED
                      </strong>

                      <span>
                        {formatDate(
                          order.failedAt
                        )}
                      </span>

                    </div>

                    <p>
                      {order.failureReason ||
                        "Delivery could not be completed."}
                    </p>

                  </div>

                </div>

              )}


              {order.status === "RESCHEDULED" && (

                <div className="timeline-item current">

                  <div className="timeline-marker">
                    •
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-top">

                      <strong>
                        RESCHEDULED
                      </strong>

                      <span>
                        {formatDate(
                          order.rescheduledDate
                        )}
                      </span>

                    </div>

                    <p>
                      Your delivery has been rescheduled.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </section>


          {/* ROUTE */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>
                <h2>
                  Route
                </h2>

                <p>
                  Pickup and delivery locations.
                </p>
              </div>

              <MapPin size={18} />

            </div>


            <div className="route-detail">

              <div className="route-point">

                <div className="route-dot pickup" />

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


              <div className="route-line" />


              <div className="route-point">

                <div className="route-dot drop" />

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

        </div>


        {/* SIDEBAR */}

        <aside className="detail-sidebar">

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
                  Actual weight
                </span>

                <strong>
                  {order.package?.actualWeight} kg
                </strong>
              </div>


              <div>
                <span>
                  Chargeable weight
                </span>

                <strong>
                 {order.package?.chargeableWeight} kg
                </strong>
              </div>


              <div>
                <span>
                  Order type
                </span>

                <strong>
                  {order.orderType}
                </strong>
              </div>

            </div>

          </section>


          {/* PAYMENT */}

          <section className="detail-card card">

            <div className="detail-card-header">

              <div>
                <h2>
                  Payment
                </h2>
              </div>

              <CreditCard size={17} />

            </div>


            <div className="info-list">

              <div>
                <span>
                  Method
                </span>

                <strong>
                  {order.paymentType}
                </strong>
              </div>


              <div>
                <span>
                  Delivery charge
                </span>

                <strong>
                  ₹{order.deliveryCharge}
                </strong>
              </div>


              <div>
                <span>
                  COD surcharge
                </span>

                <strong>
                  ₹{order.codSurcharge}
                </strong>
              </div>


              <div className="info-total">
                <span>
                  Total
                </span>

                <strong>
                  ₹{order.totalAmount}
                </strong>
              </div>

            </div>

          </section>


          {/* AGENT */}

          {order.agentId && (

            <section className="detail-card card">

              <div className="detail-card-header">

                <div>
                  <h2>
                    Delivery agent
                  </h2>
                </div>

                <UserRound size={17} />

              </div>


              <div className="agent-detail">

                <div className="agent-avatar">
                  {order.agentId.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>

                  <strong>
                    {order.agentId.name}
                  </strong>

                  <span>
                    {order.agentId.phone}
                  </span>

                </div>

              </div>

            </section>

          )}


          {/* ESTIMATED DELIVERY */}

          {order.estimatedDeliveryDate && (

            <section className="delivery-date">

              <CalendarDays size={16} />

              <div>

                <span>
                  Estimated delivery
                </span>

                <strong>
                  {formatDate(
                    order.estimatedDeliveryDate
                  )}
                </strong>

              </div>

            </section>

          )}

        </aside>

      </div>

    </div>
  );
};

export default OrderDetails;