import {
  useState
} from "react";
import { ArrowRight, Calculator, PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";

const initialForm = {
  pickupAddress: "",
  pickupPincode: "",
  dropAddress: "",
  dropPincode: "",

  length: "",
  breadth: "",
  height: "",
  actualWeight: "",

  orderType: "B2C",
  paymentType: "PREPAID"
};

const CreateOrder = () => {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [calculation, setCalculation] =
    useState(null);

  const [error, setError] =
    useState("");

  const [calculating, setCalculating] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    // Price is no longer valid
    // if package information changes.
    setCalculation(null);
  };

  const calculatePrice = async () => {
    setError("");
    setCalculation(null);

    try {
      setCalculating(true);

      const response =
        await api.post(
          "/rate-cards/calculate",
          {
            pickupPincode:
              form.pickupPincode,

            dropPincode:
              form.dropPincode,

            length:
              Number(form.length),

            breadth:
              Number(form.breadth),

            height:
              Number(form.height),

            actualWeight:
              Number(form.actualWeight),

            orderType:
              form.orderType,

            paymentType:
              form.paymentType
          }
        );

      setCalculation(
        response.data.calculation
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to calculate delivery price"
      );
    } finally {
      setCalculating(false);
    }
  };

 const createOrder = async () => {

  setError("");

  if (!calculation) {
    setError(
      "Calculate the delivery price first."
    );
    return;
  }

  if (!navigator.geolocation) {
    setError(
      "Location services are not supported by this browser."
    );
    return;
  }

  try {

    setCreating(true);

    // --------------------------------
    // Get current pickup location
    // --------------------------------

    const position =
      await new Promise(
        (resolve, reject) => {

          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );

        }
      );


    const pickupLatitude =
      position.coords.latitude;

    const pickupLongitude =
      position.coords.longitude;


    console.log(
      "Pickup latitude:",
      pickupLatitude
    );

    console.log(
      "Pickup longitude:",
      pickupLongitude
    );


    // --------------------------------
    // Create order
    // --------------------------------

    const response =
      await api.post(
        "/orders",
        {
          pickupAddress:
            form.pickupAddress,

          dropAddress:
            form.dropAddress,

          pickupPincode:
            form.pickupPincode,

          dropPincode:
            form.dropPincode,

          pickupLatitude:
            pickupLatitude,

          pickupLongitude:
            pickupLongitude,

          length:
            Number(form.length),

          breadth:
            Number(form.breadth),

          height:
            Number(form.height),

          actualWeight:
            Number(form.actualWeight),

          orderType:
            form.orderType,

          paymentType:
            form.paymentType
        }
      );


    console.log(
      "Order created:",
      response.data
    );


    navigate(
      `/orders/${response.data.order._id}`
    );


  } catch (error) {

    console.error(
      "Create order error:",
      error
    );


    // --------------------------------
    // Location errors
    // --------------------------------

    if (error?.code === 1) {

      setError(
        "Location permission was denied. Please allow location access and try again."
      );

      return;
    }


    if (error?.code === 2) {

      setError(
        "Unable to determine your current location."
      );

      return;
    }


    if (error?.code === 3) {

      setError(
        "Location request timed out. Please try again."
      );

      return;
    }


    // --------------------------------
    // Backend error
    // --------------------------------

    setError(
      error.response?.data?.message ||
      "Unable to create order"
    );

  } finally {

    setCreating(false);

  }

};

  return (
    <div className="order-page">

      <div className="page-header">

        <div>
          <h1 className="page-title">
            Create delivery order
          </h1>

          <p className="page-subtitle">
            Enter shipment details and review the delivery charge before booking.
          </p>
        </div>

      </div>


      {error && (
        <div className="page-alert">
          {error}
        </div>
      )}


      <div className="order-layout">

        <div className="order-form-column">

          {/* ADDRESS */}

          <section className="form-section card">

            <div className="form-section-header">
              <div>
                <h2>
                  Route
                </h2>

                <p>
                  Where should the package travel?
                </p>
              </div>
            </div>


            <div className="form-grid">

              <div className="form-group full-width">

                <label>
                  Pickup address
                </label>

                <textarea
                  className="form-input textarea"
                  name="pickupAddress"
                  value={form.pickupAddress}
                  onChange={handleChange}
                  placeholder="Street, area, city"
                  rows="3"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Pickup pincode
                </label>

                <input
                  className="form-input"
                  name="pickupPincode"
                  value={form.pickupPincode}
                  onChange={handleChange}
                  placeholder="e.g. 520010"
                  maxLength="6"
                  required
                />

              </div>


              <div className="form-group full-width">

                <label>
                  Drop address
                </label>

                <textarea
                  className="form-input textarea"
                  name="dropAddress"
                  value={form.dropAddress}
                  onChange={handleChange}
                  placeholder="Street, area, city"
                  rows="3"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Drop pincode
                </label>

                <input
                  className="form-input"
                  name="dropPincode"
                  value={form.dropPincode}
                  onChange={handleChange}
                  placeholder="e.g. 522001"
                  maxLength="6"
                  required
                />

              </div>

            </div>

          </section>


          {/* PACKAGE */}

          <section className="form-section card">

            <div className="form-section-header">

              <div>
                <h2>
                  Package
                </h2>

                <p>
                  Dimensions and actual weight determine the chargeable weight.
                </p>
              </div>

              <PackageCheck
                size={20}
              />

            </div>


            <div className="form-grid">

              <div className="form-group">

                <label>
                  Length (cm)
                </label>

                <input
                  className="form-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  name="length"
                  value={form.length}
                  onChange={handleChange}
                  placeholder="50"
                />

              </div>


              <div className="form-group">

                <label>
                  Breadth (cm)
                </label>

                <input
                  className="form-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  name="breadth"
                  value={form.breadth}
                  onChange={handleChange}
                  placeholder="40"
                />

              </div>


              <div className="form-group">

                <label>
                  Height (cm)
                </label>

                <input
                  className="form-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="30"
                />

              </div>


              <div className="form-group">

                <label>
                  Actual weight (kg)
                </label>

                <input
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="actualWeight"
                  value={form.actualWeight}
                  onChange={handleChange}
                  placeholder="8"
                />

              </div>

            </div>

          </section>


          {/* ORDER OPTIONS */}

          <section className="form-section card">

            <div className="form-section-header">

              <div>
                <h2>
                  Billing
                </h2>

                <p>
                  Choose the shipment and payment type.
                </p>
              </div>

            </div>


            <div className="choice-grid">

              <div className="choice-group">

                <span className="choice-label">
                  Order type
                </span>

                <div className="choice-options">

                  <button
                    type="button"
                    className={
                      form.orderType === "B2C"
                        ? "choice active"
                        : "choice"
                    }
                    onClick={() => {
                      setForm((previous) => ({
                        ...previous,
                        orderType: "B2C"
                      }));

                      setCalculation(null);
                    }}
                  >
                    <strong>
                      B2C
                    </strong>

                    <span>
                      Business to customer
                    </span>
                  </button>


                  <button
                    type="button"
                    className={
                      form.orderType === "B2B"
                        ? "choice active"
                        : "choice"
                    }
                    onClick={() => {
                      setForm((previous) => ({
                        ...previous,
                        orderType: "B2B"
                      }));

                      setCalculation(null);
                    }}
                  >
                    <strong>
                      B2B
                    </strong>

                    <span>
                      Business shipment
                    </span>
                  </button>

                </div>

              </div>


              <div className="choice-group">

                <span className="choice-label">
                  Payment
                </span>

                <div className="choice-options">

                  <button
                    type="button"
                    className={
                      form.paymentType === "PREPAID"
                        ? "choice active"
                        : "choice"
                    }
                    onClick={() => {
                      setForm((previous) => ({
                        ...previous,
                        paymentType: "PREPAID"
                      }));

                      setCalculation(null);
                    }}
                  >
                    <strong>
                      Prepaid
                    </strong>

                    <span>
                      Already paid
                    </span>
                  </button>


                  <button
                    type="button"
                    className={
                      form.paymentType === "COD"
                        ? "choice active"
                        : "choice"
                    }
                    onClick={() => {
                      setForm((previous) => ({
                        ...previous,
                        paymentType: "COD"
                      }));

                      setCalculation(null);
                    }}
                  >
                    <strong>
                      COD
                    </strong>

                    <span>
                      Pay on delivery
                    </span>
                  </button>

                </div>

              </div>

            </div>

          </section>


          <div className="form-actions">

            <button
              className="btn btn-primary"
              type="button"
              onClick={calculatePrice}
              disabled={calculating}
            >
              <Calculator size={16} />

              {calculating
                ? "Calculating..."
                : "Calculate delivery charge"}
            </button>

          </div>

        </div>


        {/* PRICE SUMMARY */}

        <aside className="price-column">

          <div className="price-card card">

            <div className="price-card-header">
              <div>
                <span>
                  ESTIMATE
                </span>

                <h2>
                  Delivery charge
                </h2>
              </div>

              <Calculator
                size={18}
              />

            </div>


            {!calculation ? (

              <div className="price-empty">

                <Calculator
                  size={25}
                />

                <p>
                  Enter the package details and calculate the price.
                </p>

              </div>

            ) : (

              <>

                <div className="total-price">

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {calculation.totalAmount}
                  </strong>

                </div>


                <div className="price-breakdown">

                  <div>
                    <span>
                      Actual weight
                    </span>

                    <strong>
                      {calculation.actualWeight} kg
                    </strong>
                  </div>


                  <div>
                    <span>
                      Volumetric weight
                    </span>

                    <strong>
                      {calculation.volumetricWeight} kg
                    </strong>
                  </div>


                  <div>
                    <span>
                      Chargeable weight
                    </span>

                    <strong>
                      {calculation.chargeableWeight} kg
                    </strong>
                  </div>


                  <div className="divider" />


                  <div>
                    <span>
                      Delivery charge
                    </span>

                    <strong>
                      ₹
                      {calculation.deliveryCharge}
                    </strong>
                  </div>


                  <div>
                    <span>
                      COD surcharge
                    </span>

                    <strong>
                      ₹
                      {calculation.codSurcharge}
                    </strong>
                  </div>

                </div>


                <div className="zone-summary">

                  <div>
                    <span>
                      From
                    </span>

                    <strong>
                      {calculation.pickupZone.name}
                    </strong>
                  </div>

                  <ArrowRight
                    size={15}
                  />

                  <div>
                    <span>
                      To
                    </span>

                    <strong>
                      {calculation.dropZone.name}
                    </strong>
                  </div>

                </div>


                <button
                  className="btn btn-primary create-order-button"
                  type="button"
                  onClick={createOrder}
                  disabled={creating}
                >
                  {creating
                    ? "Creating order..."
                    : "Confirm and create order"}
                </button>

              </>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
};

export default CreateOrder;