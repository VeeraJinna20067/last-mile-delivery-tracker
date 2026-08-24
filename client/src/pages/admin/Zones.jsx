import {
  useEffect,
  useState
} from "react";

import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X
} from "lucide-react";

import api from "../../services/api.js";


const AdminZones = () => {

  const [zones, setZones] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingZone, setEditingZone] =
    useState(null);

  const [saving, setSaving] =
    useState(false);


  const [form, setForm] = useState({
    name: "",
    code: "",
    areas: [
      {
        areaName: "",
        pincode: ""
      }
    ]
  });


  useEffect(() => {

    fetchZones();

  }, []);


  const fetchZones = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/zones"
        );

      setZones(
        response.data.zones || []
      );

    } catch (error) {

      console.error(
        "Fetch zones error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load zones"
      );

    } finally {

      setLoading(false);

    }
  };


  const resetForm = () => {

    setForm({
      name: "",
      code: "",
      areas: [
        {
          areaName: "",
          pincode: ""
        }
      ]
    });

    setEditingZone(null);

  };


  const openCreateForm = () => {

    resetForm();

    setShowForm(true);

  };


  const openEditForm = (zone) => {

    setEditingZone(zone);

    setForm({
      name: zone.name || "",
      code: zone.code || "",
      areas:
        zone.areas?.length
          ? zone.areas.map(
              (area) => ({
                areaName:
                  area.areaName || "",
                pincode:
                  area.pincode || ""
              })
            )
          : [
              {
                areaName: "",
                pincode: ""
              }
            ]
    });

    setShowForm(true);

  };


  const closeForm = () => {

    if (saving) return;

    setShowForm(false);

    resetForm();

  };


  const handleFormChange = (
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


  const handleAreaChange = (
    index,
    field,
    value
  ) => {

    setForm(
      (previous) => {

        const areas = [
          ...previous.areas
        ];

        areas[index] = {
          ...areas[index],
          [field]: value
        };

        return {
          ...previous,
          areas
        };

      }
    );

  };


  const addArea = () => {

    setForm(
      (previous) => ({
        ...previous,
        areas: [
          ...previous.areas,
          {
            areaName: "",
            pincode: ""
          }
        ]
      })
    );

  };


  const removeArea = (index) => {

    setForm(
      (previous) => {

        const areas =
          previous.areas.filter(
            (_, areaIndex) =>
              areaIndex !== index
          );

        return {
          ...previous,
          areas:
            areas.length
              ? areas
              : [
                  {
                    areaName: "",
                    pincode: ""
                  }
                ]
        };

      }
    );

  };


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      try {

        setSaving(true);
        setError("");


        const cleanedAreas =
          form.areas.filter(
            (area) =>
              area.areaName.trim() ||
              area.pincode.trim()
          );


        const payload = {
          name:
            form.name.trim(),

          code:
            form.code.trim(),

          areas:
            cleanedAreas
        };


        if (editingZone) {

          const response =
            await api.put(
              `/zones/${editingZone._id}`,
              payload
            );


          setZones(
            (previous) =>
              previous.map(
                (zone) =>
                  zone._id ===
                  editingZone._id
                    ? response.data.zone
                    : zone
              )
          );

        } else {

          const response =
            await api.post(
              "/zones",
              payload
            );


          setZones(
            (previous) => [
              response.data.zone,
              ...previous
            ]
          );

        }


        closeForm();

      } catch (error) {

        console.error(
          "Save zone error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to save zone"
        );

      } finally {

        setSaving(false);

      }

    };


  const toggleZoneStatus =
    async (zone) => {

      try {

        const response =
          await api.put(
            `/zones/${zone._id}`,
            {
              isActive:
                !zone.isActive
            }
          );


        setZones(
          (previous) =>
            previous.map(
              (item) =>
                item._id === zone._id
                  ? response.data.zone
                  : item
            )
        );

      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to update zone status"
        );

      }

    };


  const deleteZone =
    async (zone) => {

      const confirmed =
        window.confirm(
          `Delete ${zone.name}?`
        );

      if (!confirmed) return;


      try {

        await api.delete(
          `/zones/${zone._id}`
        );


        setZones(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !== zone._id
            )
        );

      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Unable to delete zone"
        );

      }

    };


  if (loading) {

    return (
      <div className="loading-state">
        Loading zones...
      </div>
    );

  }


  return (
    <div>

      {/* HEADER */}

      <div className="page-header">

        <div>

          <div className="agent-kicker">
            CONFIGURATION
          </div>

          <h1 className="page-title">
            Delivery Zones
          </h1>

          <p className="page-subtitle">
            Manage delivery zones and their service areas.
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={
            openCreateForm
          }
        >

          <Plus size={16} />

          Create Zone

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="page-alert">
          {error}
        </div>

      )}


      {/* FORM */}

      {showForm && (

        <section className="card admin-zone-form">

          <div className="admin-zone-form-header">

            <div>

              <h2>
                {editingZone
                  ? "Edit Zone"
                  : "Create Zone"}
              </h2>

              <p>
                Configure the zone and its service areas.
              </p>

            </div>


            <button
              className="icon-button"
              onClick={
                closeForm
              }
              type="button"
            >

              <X size={17} />

            </button>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="admin-zone-basic">

              <div className="form-group">

                <label>
                  Zone Name
                </label>

                <input
                  className="form-input"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Vijayawada Zone"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Zone Code
                </label>

                <input
                  className="form-input"
                  name="code"
                  value={
                    form.code
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Z001"
                  required
                />

              </div>

            </div>


            <div className="admin-zone-areas">

              <div className="admin-zone-area-header">

                <div>

                  <h3>
                    Service Areas
                  </h3>

                  <p>
                    Add the areas and pincodes covered by this zone.
                  </p>

                </div>


                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    addArea
                  }
                >

                  <Plus size={14} />

                  Add Area

                </button>

              </div>


              {form.areas.map(
                (
                  area,
                  index
                ) => (

                  <div
                    className="admin-zone-area-row"
                    key={index}
                  >

                    <input
                      className="form-input"
                      value={
                        area.areaName
                      }
                      onChange={
                        (event) =>
                          handleAreaChange(
                            index,
                            "areaName",
                            event.target.value
                          )
                      }
                      placeholder="Area name"
                    />


                    <input
                      className="form-input"
                      value={
                        area.pincode
                      }
                      onChange={
                        (event) =>
                          handleAreaChange(
                            index,
                            "pincode",
                            event.target.value
                          )
                      }
                      placeholder="Pincode"
                    />


                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={
                        () =>
                          removeArea(
                            index
                          )
                      }
                    >

                      <Trash2 size={15} />

                    </button>

                  </div>

                )
              )}

            </div>


            <div className="admin-zone-form-actions">

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
                  : editingZone
                    ? "Update Zone"
                    : "Create Zone"}

              </button>

            </div>

          </form>

        </section>

      )}


      {/* ZONES */}

      {zones.length === 0 ? (

        <div className="empty-state card">

          <MapPin size={25} />

          <h3>
            No zones found
          </h3>

          <p>
            Create your first delivery zone.
          </p>

        </div>

      ) : (

        <div className="admin-zone-grid">

          {zones.map(
            (zone) => (

              <div
                key={zone._id}
                className="card admin-zone-card"
              >

                <div className="admin-zone-card-header">

                  <div className="admin-zone-title">

                    <div className="admin-zone-icon">
                      <MapPin size={17} />
                    </div>

                    <div>

                      <strong>
                        {zone.name}
                      </strong>

                      <span>
                        {zone.code}
                      </span>

                    </div>

                  </div>


                  <span
                    className={
                      zone.isActive
                        ? "zone-status active"
                        : "zone-status inactive"
                    }
                  >

                    {zone.isActive
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                <div className="admin-zone-area-list">

                  <span className="admin-zone-label">
                    SERVICE AREAS
                  </span>


                  {zone.areas?.length ? (

                    zone.areas.map(
                      (
                        area,
                        index
                      ) => (

                        <div
                          className="admin-zone-area"
                          key={index}
                        >

                          <span>
                            {area.areaName}
                          </span>

                          <strong>
                            {area.pincode}
                          </strong>

                        </div>

                      )
                    )

                  ) : (

                    <span className="admin-zone-empty">
                      No areas configured
                    </span>

                  )}

                </div>


                <div className="admin-zone-card-footer">

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      openEditForm(
                        zone
                      )
                    }
                  >

                    <Pencil size={14} />

                    Edit

                  </button>


                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      toggleZoneStatus(
                        zone
                      )
                    }
                  >

                    {zone.isActive
                      ? "Deactivate"
                      : "Activate"}

                  </button>


                  <button
                    className="icon-button danger"
                    onClick={() =>
                      deleteZone(
                        zone
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


export default AdminZones;