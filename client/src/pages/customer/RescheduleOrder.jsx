import {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  CalendarDays
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../../services/api.js";


const RescheduleOrder = () => {

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
    deliveryDate,
    setDeliveryDate
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {

    fetchOrder();

  }, [id]);


  const fetchOrder = async () => {

    try {

      const response =
        await api.get(
          `/orders/${id}`
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


  const getMinDate = () => {

    const date =
      new Date();

    date.setDate(
      date.getDate() + 1
    );

    return date
      .toISOString()
      .split("T")[0];
  };


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");


      if (!deliveryDate) {

        setError(
          "Please select a delivery date."
        );

        return;
      }


      try {

        setSubmitting(true);


        await api.post(
          `/orders/${id}/reschedule`,
          {
            newDeliveryDate:
              deliveryDate
          }
        );


        navigate(
          `/orders/${id}`
        );


      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to reschedule delivery"
        );

      } finally {

        setSubmitting(false);

      }
    };


  if (loading) {

    return (
      <div className="loading-state">
        Loading order...
      </div>
    );

  }


  if (!order) {

    return (
      <div className="page-alert">
        {error || "Order not found"}
      </div>
    );

  }


  return (
    <div className="reschedule-page">

      <Link
        to={`/orders/${id}`}
        className="back-link"
      >
        <ArrowLeft size={15} />
        Back to order
      </Link>


      <div className="reschedule-container">

        <div className="reschedule-heading">

          <div className="calendar-icon">
            <CalendarDays
              size={22}
            />
          </div>

          <div>

            <h1>
              Reschedule delivery
            </h1>

            <p>
              Choose a new delivery date for{" "}
              <strong>
                {order.orderNumber}
              </strong>
            </p>

          </div>

        </div>


        <div className="reschedule-card card">

          <div className="failed-notice">

            <strong>
              Previous delivery attempt failed
            </strong>

            <p>
              {order.failureReason ||
                "The delivery could not be completed."}
            </p>

          </div>


          <form
            className="reschedule-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label>
                New delivery date
              </label>

              <input
                className="form-input"
                type="date"
                min={getMinDate()}
                value={deliveryDate}
                onChange={(event) =>
                  setDeliveryDate(
                    event.target.value
                  )
                }
                required
              />

              <span className="field-help">
                Select a date from tomorrow onwards.
              </span>

            </div>


            {error && (
              <div className="form-error">
                {error}
              </div>
            )}


            <div className="reschedule-actions">

              <Link
                to={`/orders/${id}`}
                className="btn btn-secondary"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Rescheduling..."
                  : "Confirm new date"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default RescheduleOrder;