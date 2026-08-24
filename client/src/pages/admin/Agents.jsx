import {
  useEffect,
  useState
} from "react";

import {
  UserPlus,
  MapPin,
  Circle
} from "lucide-react";

import api from "../../services/api.js";


const Agents = () => {

  const [agents, setAgents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      latitude: "",
      longitude: ""
    });


  useEffect(() => {

    fetchAgents();

  }, []);


  const fetchAgents = async () => {

    try {

      setLoading(true);

      const response =
        await api.get("/agents");

      setAgents(
        response.data.agents || []
      );

    } catch (error) {

      console.error(
        "Fetch agents error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load agents"
      );

    } finally {

      setLoading(false);

    }
  };


  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

  };


  const createAgent = async (event) => {

    event.preventDefault();

    try {

      setCreating(true);

      setError("");

      await api.post(
        "/agents",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          latitude:
            Number(form.latitude),
          longitude:
            Number(form.longitude)
        }
      );


      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        latitude: "",
        longitude: ""
      });

      setShowForm(false);

      await fetchAgents();

    } catch (error) {

      console.error(
        "Create agent error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to create agent"
      );

    } finally {

      setCreating(false);

    }
  };


  if (loading) {

    return (
      <div className="loading-state">
        Loading agents...
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
            Agents
          </h1>

          <p className="page-subtitle">
            Manage delivery agents and their availability.
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={() =>
            setShowForm(
              !showForm
            )
          }
        >
          <UserPlus size={16} />

          {showForm
            ? "Close"
            : "Add agent"}

        </button>

      </div>


      {/* -------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------- */}

      {error && (

        <div className="page-alert">
          {error}
        </div>

      )}


      {/* -------------------------------- */}
      {/* CREATE AGENT FORM */}
      {/* -------------------------------- */}

      {showForm && (

        <form
          className="admin-agent-form card"
          onSubmit={
            createAgent
          }
        >

          <div className="section-heading">

            <div>

              <h2>
                Create agent
              </h2>

              <p>
                Add a delivery agent with their current location.
              </p>

            </div>

          </div>


          <div className="admin-form-grid">

            <div className="form-field">

              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
                placeholder="Agent name"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={
                  handleChange
                }
                placeholder="agent@example.com"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={
                  handleChange
                }
                placeholder="Phone number"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={
                  handleChange
                }
                placeholder="Minimum 6 characters"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Latitude
              </label>

              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={
                  handleChange
                }
                placeholder="16.5062"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Longitude
              </label>

              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={
                  handleChange
                }
                placeholder="80.6480"
                required
              />

            </div>

          </div>


          <div className="admin-form-actions">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setShowForm(false)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create agent"}
            </button>

          </div>

        </form>

      )}


      {/* -------------------------------- */}
      {/* AGENT LIST */}
      {/* -------------------------------- */}

      <section className="admin-section">

        <div className="section-heading">

          <div>

            <h2>
              Delivery agents
            </h2>

            <p>
              {agents.length} agents registered in the system.
            </p>

          </div>

        </div>


        {agents.length === 0 ? (

          <div className="empty-state card">

            <UserPlus size={25} />

            <h3>
              No agents yet
            </h3>

            <p>
              Create your first delivery agent.
            </p>

          </div>

        ) : (

          <div className="admin-agent-list">

            {agents.map(
              (agent) => (

                <div
                  key={agent._id}
                  className="admin-agent-card card"
                >

                  <div className="admin-agent-main">

                    <div className="admin-agent-avatar">
                      {agent.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {agent.name}
                      </strong>

                      <span>
                        {agent.email}
                      </span>

                      <span>
                        {agent.phone}
                      </span>

                    </div>

                  </div>


                  <div className="admin-agent-location">

                    <MapPin size={15} />

                    <span>
                      {agent.currentLocation?.latitude
                        ?? "—"}
                      {", "}
                      {agent.currentLocation?.longitude
                        ?? "—"}
                    </span>

                  </div>


                  <div className="admin-agent-status">

                    <Circle
                      size={9}
                      fill={
                        agent.isAvailable
                          ? "currentColor"
                          : "none"
                      }
                    />

                    <span>
                      {agent.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
};


export default Agents;