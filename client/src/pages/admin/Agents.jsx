import {
  useEffect,
  useState
} from "react";
import {
  UserPlus,
  X
} from "lucide-react";
import {
  Users,
  MapPin,
  Phone,
  Mail,
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

const [showCreateForm, setShowCreateForm] =
  useState(false);

const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  password: "",
  latitude: "",
  longitude: ""
});

const [creating, setCreating] =
  useState(false);
  useEffect(() => {

    fetchAgents();

  }, []);

 
  const fetchAgents = async () => {

    try {

      setLoading(true);

      const response =
        await api.get(
          "/agents"
        );

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

   const handleCreateAgent = async (event) => {

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
        latitude: Number(form.latitude),
        longitude: Number(form.longitude)
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

    setShowCreateForm(false);

    await fetchAgents();

  } catch (error) {

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

      {/* HEADER */}

      <div className="page-header">

        <div>

          <div className="agent-kicker">
            OPERATIONS
          </div>

          <h1 className="page-title">
            Delivery Agents
          </h1>

          <p className="page-subtitle">
            Monitor your delivery agents and their availability.
          </p>

        </div>
 {showCreateForm && (

  <div className="card admin-create-agent">

    <div className="admin-create-header">

      <div>
        <h2>
          Create delivery agent
        </h2>

        <p>
          Create an account for a new delivery agent.
        </p>
      </div>

      <button
        className="icon-button"
        onClick={() =>
          setShowCreateForm(false)
        }
      >
        <X size={17} />
      </button>

    </div>


    <form
      className="admin-agent-form"
      onSubmit={handleCreateAgent}
    >

      <div className="form-group">

        <label>
          Full name
        </label>

        <input
          className="form-input"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
          required
        />

      </div>


      <div className="form-group">

        <label>
          Email
        </label>

        <input
          className="form-input"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
          required
        />

      </div>


      <div className="form-group">

        <label>
          Phone
        </label>

        <input
          className="form-input"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value
            })
          }
          required
        />

      </div>


      <div className="form-group">

        <label>
          Temporary password
        </label>

        <input
          className="form-input"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
          minLength={6}
          required
        />

      </div>


      <div className="form-group">

        <label>
          Latitude
        </label>

        <input
          className="form-input"
          type="number"
          step="any"
          value={form.latitude}
          onChange={(e) =>
            setForm({
              ...form,
              latitude: e.target.value
            })
          }
          required
        />

      </div>


      <div className="form-group">

        <label>
          Longitude
        </label>

        <input
          className="form-input"
          type="number"
          step="any"
          value={form.longitude}
          onChange={(e) =>
            setForm({
              ...form,
              longitude: e.target.value
            })
          }
          required
        />

      </div>


      <div className="admin-form-actions">

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setShowCreateForm(false)
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

  </div>

)}

        <div className="admin-agent-actions">

  <div className="admin-agent-count">
    <Users size={17} />

    <span>
      {agents.length} agents
    </span>
  </div>

  <button
    className="btn btn-primary"
    onClick={() =>
      setShowCreateForm(true)
    }
  >
    <UserPlus size={16} />
    Create agent
  </button>

</div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="page-alert">
          {error}
        </div>

      )}


      {/* AGENT LIST */}

      {agents.length === 0 ? (

        <div className="empty-state card">

          <Users size={25} />

          <h3>
            No agents found
          </h3>

          <p>
            Create an agent to start assigning deliveries.
          </p>

        </div>

      ) : (

        <div className="admin-agent-grid">

          {agents.map(
            (agent) => (

              <div
                key={agent._id}
                className="admin-agent-card card"
              >

                {/* TOP */}

                <div className="admin-agent-top">

                  <div className="admin-agent-avatar">

                    {agent.name
                      ?.charAt(0)
                      .toUpperCase()}

                  </div>


                  <div className="admin-agent-name">

                    <strong>
                      {agent.name}
                    </strong>

                    <span>
                      Delivery Agent
                    </span>

                  </div>


                  <div
                    className={
                      agent.isAvailable
                        ? "agent-live-status online"
                        : "agent-live-status"
                    }
                  >

                    <Circle size={8} />

                    {agent.isAvailable
                      ? "Available"
                      : "Busy"}

                  </div>

                </div>


                {/* CONTACT */}

                <div className="admin-agent-info">

                  <div>

                    <Mail size={14} />

                    <span>
                      {agent.email}
                    </span>

                  </div>


                  <div>

                    <Phone size={14} />

                    <span>
                      {agent.phone}
                    </span>

                  </div>


                  <div>

                    <MapPin size={14} />

                    <span>

                      {agent.currentLocation?.latitude !== null &&
                      agent.currentLocation?.longitude !== null
                        ? `${agent.currentLocation.latitude}, ${agent.currentLocation.longitude}`
                        : "Location unavailable"}

                    </span>

                  </div>

                </div>


                {/* FOOTER */}

               <div className="admin-agent-footer">

  <div className="agent-order-stats">

    <div>
      <span>
        Active
      </span>

      <strong>
        {agent.orderStats?.activeOrders ?? 0}
      </strong>
    </div>

    <div>
      <span>
        Completed
      </span>

      <strong>
        {agent.orderStats?.completedOrders ?? 0}
      </strong>
    </div>

    <div>
      <span>
        Total
      </span>

      <strong>
        {agent.orderStats?.totalOrders ?? 0}
      </strong>
    </div>

  </div>


  <strong
    className={
      agent.isActive
        ? "agent-active"
        : "agent-inactive"
    }
  >
    {agent.isActive
      ? "Active"
      : "Inactive"}
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


export default Agents;