import {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  Package,
  User,
  MapPin
} from "lucide-react";

import {
  Link,
  useParams
} from "react-router-dom";

import api from "../../services/api.js";


const AdminOrderDetails = () => {

  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    fetchOrder();

  }, [id]);


  const fetchOrder = async () => {

    try {

      setLoading(true);

      const response =
        await api.get(
          `/admin/orders/${id}`
        );

      setOrder(
        response.data.order
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


  if (loading) {

    return (
      <div className="loading-state">
        Loading order details...
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


  if (!order) return null;


  return (
    <div>

      <Link
        to="/admin/orders"
        className="back-link"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>


      <div className="page-header">

        <div>

          <div className="agent-kicker">
            ORDER DETAILS
          </div>

          <h1 className="page-title">
            {order.orderNumber}
          </h1>

          <p className="page-subtitle">
            Complete delivery information.
          </p>

        </div>


        <span
          className={`status-badge status-${order.status
            ?.toLowerCase()
            .replaceAll("_", "-")}`}
        >
          {order.status?.replaceAll(
            "_",
            " "
          )}
        </span>

      </div>


      <div className="admin-detail-grid">


        {/* CUSTOMER */}

        <section className="card admin-detail-card">

          <div className="admin-detail-heading">

            <User size={18} />

            <h2>
              Customer
            </h2>

          </div>


          <strong>
            {order.customerId?.name ||
              "Unknown"}
          </strong>

          <span>
            {order.customerId?.email}
          </span>

          <span>
            {order.customerId?.phone}
          </span>

        </section>


        {/* AGENT */}

        <section className="card admin-detail-card">

          <div className="admin-detail-heading">

            <User size={18} />

            <h2>
              Delivery agent
            </h2>

          </div>


          {order.agentId ? (

            <>
              <strong>
                {order.agentId.name}
              </strong>

              <span>
                {order.agentId.email}
              </span>

              <span>
                {order.agentId.phone}
              </span>
            </>

          ) : (

            <span>
              No agent assigned
            </span>

          )}

        </section>


        {/* ROUTE */}

        <section className="card admin-detail-card full">

          <div className="admin-detail-heading">

            <MapPin size={18} />

            <h2>
              Delivery route
            </h2>

          </div>


          <div className="admin-detail-route">

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


            <div className="admin-route-arrow">
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

        </section>


        {/* PACKAGE */}

        <section className="card admin-detail-card">

          <div className="admin-detail-heading">

            <Package size={18} />

            <h2>
              Package
            </h2>

          </div>


          <div className="admin-detail-row">
            <span>
              Dimensions
            </span>

            <strong>
              {order.package?.length} ×{" "}
              {order.package?.breadth} ×{" "}
              {order.package?.height} cm
            </strong>
          </div>


          <div className="admin-detail-row">
            <span>
              Actual weight
            </span>

            <strong>
              {order.package?.actualWeight} kg
            </strong>
          </div>


          <div className="admin-detail-row">
            <span>
              Chargeable weight
            </span>

            <strong>
              {order.package?.chargeableWeight} kg
            </strong>
          </div>

        </section>


        {/* PAYMENT */}

        <section className="card admin-detail-card">

          <div className="admin-detail-heading">

            <h2>
              Payment
            </h2>

          </div>


          <div className="admin-detail-row">
            <span>
              Method
            </span>

            <strong>
              {order.paymentType}
            </strong>
          </div>


          <div className="admin-detail-row">
            <span>
              Delivery charge
            </span>

            <strong>
              ₹{order.deliveryCharge}
            </strong>
          </div>


          <div className="admin-detail-row">
            <span>
              COD surcharge
            </span>

            <strong>
              ₹{order.codSurcharge}
            </strong>
          </div>


          <div className="admin-detail-row total">
            <span>
              Total
            </span>

            <strong>
              ₹{order.totalAmount}
            </strong>
          </div>

        </section>

      </div>

    </div>
  );
};


export default AdminOrderDetails;