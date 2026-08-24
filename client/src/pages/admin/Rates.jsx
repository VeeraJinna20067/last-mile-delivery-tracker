import {
  useEffect,
  useState
} from "react";

import {
  Pencil,
  Plus,
  Trash2,
  X,
  IndianRupee
} from "lucide-react";

import api from "../../services/api.js";


const AdminRates = () => {

  const [rates, setRates] =
    useState([]);

  const [zones, setZones] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingRate, setEditingRate] =
    useState(null);

  const [saving, setSaving] =
    useState(false);


  const [form, setForm] = useState({
    fromZone: "",
    toZone: "",
    orderType: "B2C",
    baseRate: "",
    additionalWeightRate: "",
    codSurcharge: "",
    weightSlabs: []
  });


  /* =========================================
     FETCH RATE CARDS + ZONES
     ========================================= */

  useEffect(() => {

    fetchData();

  }, []);


  const fetchData = async () => {

    try {

      setLoading(true);

      setError("");


      const [
        ratesResponse,
        zonesResponse
      ] = await Promise.all([

        api.get("/rate-cards"),

        api.get("/zones")

      ]);


      setRates(
        ratesResponse.data.rateCards || []
      );


      setZones(
        zonesResponse.data.zones || []
      );

    } catch (error) {

      console.error(
        "Fetch rate data error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load rate cards"
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================
     RESET FORM
     ========================================= */

  const resetForm = () => {

    setForm({
      fromZone: "",
      toZone: "",
      orderType: "B2C",
      baseRate: "",
      additionalWeightRate: "",
      codSurcharge: "",
      weightSlabs: []
    });

    setEditingRate(null);

  };


  /* =========================================
     OPEN CREATE
     ========================================= */

  const openCreateForm = () => {

    resetForm();

    setShowForm(true);

  };


  /* =========================================
     OPEN EDIT
     ========================================= */

  const openEditForm = (rate) => {

    setEditingRate(rate);

    setForm({

      fromZone:
        rate.fromZone?._id || "",

      toZone:
        rate.toZone?._id || "",

      orderType:
        rate.orderType || "B2C",

      baseRate:
        rate.baseRate ?? "",

      additionalWeightRate:
        rate.additionalWeightRate ?? "",

      codSurcharge:
        rate.codSurcharge ?? "",

      weightSlabs:
        rate.weightSlabs || []

    });

    setShowForm(true);

  };


  /* =========================================
     CLOSE FORM
     ========================================= */

  const closeForm = () => {

    if (saving) return;

    setShowForm(false);

    resetForm();

  };


  /* =========================================
     BASIC FORM CHANGE
     ========================================= */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value
    } = event.target;


    setForm(
      (previous) => ({
        ...previous,
        [name]: value
      })
    );

  };


  /* =========================================
     ADD WEIGHT SLAB
     ========================================= */

  const addWeightSlab = () => {

    setForm(
      (previous) => ({
        ...previous,

        weightSlabs: [
          ...previous.weightSlabs,

          {
            minWeight: "",
            maxWeight: "",
            rate: ""
          }
        ]

      })
    );

  };


  /* =========================================
     REMOVE WEIGHT SLAB
     ========================================= */

  const removeWeightSlab = (
    index
  ) => {

    setForm(
      (previous) => ({
        ...previous,

        weightSlabs:
          previous.weightSlabs.filter(
            (_, slabIndex) =>
              slabIndex !== index
          )

      })
    );

  };


  /* =========================================
     UPDATE WEIGHT SLAB
     ========================================= */

  const updateWeightSlab = (
    index,
    field,
    value
  ) => {

    setForm(
      (previous) => {

        const slabs = [
          ...previous.weightSlabs
        ];


        slabs[index] = {
          ...slabs[index],
          [field]: value
        };


        return {
          ...previous,
          weightSlabs: slabs
        };

      }
    );

  };


  /* =========================================
     CREATE / UPDATE RATE CARD
     ========================================= */

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      try {

        setSaving(true);

        setError("");


        if (
          !form.fromZone ||
          !form.toZone ||
          !form.orderType ||
          form.baseRate === ""
        ) {

          setError(
            "Please fill all required rate card fields"
          );

          setSaving(false);

          return;

        }


        if (
          form.fromZone ===
          form.toZone
        ) {

          setError(
            "Source and destination zones cannot be the same"
          );

          setSaving(false);

          return;

        }


        const payload = {

          fromZone:
            form.fromZone,

          toZone:
            form.toZone,

          orderType:
            form.orderType,

          baseRate:
            Number(
              form.baseRate
            ),

          additionalWeightRate:
            Number(
              form.additionalWeightRate || 0
            ),

          codSurcharge:
            Number(
              form.codSurcharge || 0
            ),

          weightSlabs:
            form.weightSlabs.map(
              (slab) => ({

                minWeight:
                  Number(
                    slab.minWeight
                  ),

                maxWeight:
                  Number(
                    slab.maxWeight
                  ),

                rate:
                  Number(
                    slab.rate
                  )

              })
            )

        };


        /* ===============================
           UPDATE
           =============================== */

        if (editingRate) {

          const response =
            await api.put(
              `/rate-cards/${editingRate._id}`,
              payload
            );


          setRates(
            (previous) =>
              previous.map(
                (rate) =>
                  rate._id ===
                  editingRate._id
                    ? response.data.rateCard
                    : rate
              )
          );

        }

        /* ===============================
           CREATE
           =============================== */

        else {

          const response =
            await api.post(
              "/rate-cards",
              payload
            );


          setRates(
            (previous) => [

              response.data.rateCard,

              ...previous

            ]
          );

        }


        closeForm();


      } catch (error) {

        console.error(
          "Save rate card error:",
          error
        );


        setError(
          error.response?.data?.message ||
          "Unable to save rate card"
        );

      } finally {

        setSaving(false);

      }

    };


  /* =========================================
     TOGGLE ACTIVE STATUS
     ========================================= */

  const toggleRateStatus =
    async (rate) => {

      try {

        setError("");


        const response =
          await api.put(
            `/rate-cards/${rate._id}`,
            {
              isActive:
                !rate.isActive
            }
          );


        setRates(
          (previous) =>
            previous.map(
              (item) =>
                item._id === rate._id
                  ? response.data.rateCard
                  : item
            )
        );


      } catch (error) {

        console.error(
          "Update rate status error:",
          error
        );


        setError(
          error.response?.data?.message ||
          "Unable to update rate status"
        );

      }

    };


  /* =========================================
     DELETE RATE CARD
     ========================================= */

  const deleteRate =
    async (rate) => {

      const confirmed =
        window.confirm(
          `Delete rate card ${rate.fromZone?.code || ""} → ${rate.toZone?.code || ""}?`
        );


      if (!confirmed) return;


      try {

        setError("");


        await api.delete(
          `/rate-cards/${rate._id}`
        );


        setRates(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !== rate._id
            )
        );


      } catch (error) {

        console.error(
          "Delete rate card error:",
          error
        );


        setError(
          error.response?.data?.message ||
          "Unable to delete rate card"
        );

      }

    };


  /* =========================================
     LOADING
     ========================================= */

  if (loading) {

    return (
      <div className="loading-state">
        Loading rate cards...
      </div>
    );

  }


  return (
    <div>


      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="page-header">

        <div>

          <div className="agent-kicker">
            CONFIGURATION
          </div>

          <h1 className="page-title">
            Rate Cards
          </h1>

          <p className="page-subtitle">
            Manage delivery pricing for routes and order types.
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={
            openCreateForm
          }
        >

          <Plus size={16} />

          Create Rate Card

        </button>

      </div>


      {/* =====================================
          ERROR
          ===================================== */}

      {error && (

        <div className="page-alert">

          {error}

        </div>

      )}


      {/* =====================================
          CREATE / EDIT FORM
          ===================================== */}

      {showForm && (

        <section className="card admin-rate-form">


          <div className="admin-rate-form-header">

            <div>

              <h2>

                {editingRate
                  ? "Edit Rate Card"
                  : "Create Rate Card"}

              </h2>

              <p>
                Configure pricing for a delivery route.
              </p>

            </div>


            <button
              type="button"
              className="icon-button"
              onClick={
                closeForm
              }
            >

              <X size={17} />

            </button>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >


            {/* =================================
                BASIC RATE INFORMATION
                ================================= */}

            <div className="admin-rate-basic">


              {/* FROM ZONE */}

              <div className="form-group">

                <label>
                  From Zone
                </label>


                <select
                  className="form-input"
                  name="fromZone"
                  value={
                    form.fromZone
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select source zone
                  </option>


                  {zones.map(
                    (zone) => (

                      <option
                        key={
                          zone._id
                        }
                        value={
                          zone._id
                        }
                      >

                        {zone.name}
                        {" ("}
                        {zone.code}
                        {")"}

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* TO ZONE */}

              <div className="form-group">

                <label>
                  To Zone
                </label>


                <select
                  className="form-input"
                  name="toZone"
                  value={
                    form.toZone
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select destination zone
                  </option>


                  {zones.map(
                    (zone) => (

                      <option
                        key={
                          zone._id
                        }
                        value={
                          zone._id
                        }
                      >

                        {zone.name}
                        {" ("}
                        {zone.code}
                        {")"}

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ORDER TYPE */}

              <div className="form-group">

                <label>
                  Order Type
                </label>


                <select
                  className="form-input"
                  name="orderType"
                  value={
                    form.orderType
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="B2C">
                    B2C
                  </option>

                  <option value="B2B">
                    B2B
                  </option>

                </select>

              </div>


              {/* BASE RATE */}

              <div className="form-group">

                <label>
                  Base Rate (₹)
                </label>


                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  name="baseRate"
                  value={
                    form.baseRate
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="100"
                  required
                />

              </div>


              {/* ADDITIONAL WEIGHT */}

              <div className="form-group">

                <label>
                  Additional Weight Rate (₹)
                </label>


                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  name="additionalWeightRate"
                  value={
                    form.additionalWeightRate
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="20"
                />

              </div>


              {/* COD */}

              <div className="form-group">

                <label>
                  COD Surcharge (₹)
                </label>


                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  name="codSurcharge"
                  value={
                    form.codSurcharge
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="30"
                />

              </div>

            </div>


            {/* =================================
                WEIGHT SLABS
                ================================= */}

            <div className="admin-rate-slabs">


              <div className="admin-rate-slab-header">

                <div>

                  <h3>
                    Weight Slabs
                  </h3>

                  <p>
                    Optional pricing based on package weight.
                  </p>

                </div>


                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    addWeightSlab
                  }
                >

                  <Plus size={14} />

                  Add Slab

                </button>

              </div>


              {form.weightSlabs.length === 0 ? (

                <div className="admin-rate-empty">

                  No weight slabs configured.

                </div>

              ) : (

                form.weightSlabs.map(
                  (
                    slab,
                    index
                  ) => (

                    <div
                      className="admin-rate-slab-row"
                      key={index}
                    >


                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          slab.minWeight
                        }
                        onChange={
                          (event) =>
                            updateWeightSlab(
                              index,
                              "minWeight",
                              event.target.value
                            )
                        }
                        placeholder="Min kg"
                        required
                      />


                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          slab.maxWeight
                        }
                        onChange={
                          (event) =>
                            updateWeightSlab(
                              index,
                              "maxWeight",
                              event.target.value
                            )
                        }
                        placeholder="Max kg"
                        required
                      />


                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          slab.rate
                        }
                        onChange={
                          (event) =>
                            updateWeightSlab(
                              index,
                              "rate",
                              event.target.value
                            )
                        }
                        placeholder="Rate ₹"
                        required
                      />


                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() =>
                          removeWeightSlab(
                            index
                          )
                        }
                      >

                        <Trash2 size={15} />

                      </button>

                    </div>

                  )
                )

              )}

            </div>


            {/* =================================
                FORM ACTIONS
                ================================= */}

            <div className="admin-rate-form-actions">


              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
              >

                Cancel

              </button>


              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  saving
                }
              >

                {saving
                  ? "Saving..."
                  : editingRate
                    ? "Update Rate Card"
                    : "Create Rate Card"}

              </button>

            </div>


          </form>

        </section>

      )}


      {/* =====================================
          RATE CARDS LIST
          ===================================== */}

      {rates.length === 0 ? (

        <div className="empty-state card">

          <IndianRupee size={25} />

          <h3>
            No rate cards found
          </h3>

          <p>
            Create a rate card to configure delivery pricing.
          </p>

        </div>

      ) : (

        <div className="admin-rate-grid">

          {rates.map(
            (rate) => (

              <div
                key={
                  rate._id
                }
                className="card admin-rate-card"
              >


                {/* HEADER */}

                <div className="admin-rate-card-header">

                  <div className="admin-rate-route">

                    <strong>
                      {rate.fromZone?.code ||
                        "—"}
                    </strong>

                    <span>
                      →
                    </span>

                    <strong>
                      {rate.toZone?.code ||
                        "—"}
                    </strong>

                  </div>


                  <span
                    className={
                      rate.isActive
                        ? "zone-status active"
                        : "zone-status inactive"
                    }
                  >

                    {rate.isActive
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                {/* ROUTE NAME */}

                <div className="admin-rate-route-name">

                  {rate.fromZone?.name ||
                    "Unknown"}

                  {" → "}

                  {rate.toZone?.name ||
                    "Unknown"}

                </div>


                {/* ORDER TYPE */}

                <div className="admin-rate-type">

                  <span>
                    ORDER TYPE
                  </span>

                  <strong>
                    {rate.orderType}
                  </strong>

                </div>


                {/* PRICING */}

                <div className="admin-rate-pricing">


                  <div>

                    <span>
                      BASE RATE
                    </span>

                    <strong>
                      ₹{rate.baseRate}
                    </strong>

                  </div>


                  <div>

                    <span>
                      EXTRA WEIGHT
                    </span>

                    <strong>
                      ₹{
                        rate.additionalWeightRate
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      COD
                    </span>

                    <strong>
                      ₹{
                        rate.codSurcharge
                      }
                    </strong>

                  </div>


                </div>


                {/* WEIGHT SLABS */}

                {rate.weightSlabs?.length > 0 && (

                  <div className="admin-rate-slab-list">

                    <span>
                      WEIGHT SLABS
                    </span>


                    {rate.weightSlabs.map(
                      (
                        slab,
                        index
                      ) => (

                        <div
                          key={
                            index
                          }
                        >

                          <span>

                            {slab.minWeight}

                            {" - "}

                            {slab.maxWeight}

                            {" kg"}

                          </span>


                          <strong>

                            ₹{
                              slab.rate
                            }

                          </strong>

                        </div>

                      )
                    )}

                  </div>

                )}


                {/* ACTIONS */}

                <div className="admin-rate-card-footer">


                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      openEditForm(
                        rate
                      )
                    }
                  >

                    <Pencil size={14} />

                    Edit

                  </button>


                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      toggleRateStatus(
                        rate
                      )
                    }
                  >

                    {rate.isActive
                      ? "Deactivate"
                      : "Activate"}

                  </button>


                  <button
                    className="icon-button danger"
                    onClick={() =>
                      deleteRate(
                        rate
                      )
                    }
                  >

                    <Trash2 size={15} />

                  </button>


                </div>


              </div>

            )
          )}

        </div>

      )}

    </div>
  );

};


export default AdminRates;