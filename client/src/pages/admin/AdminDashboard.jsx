import {
  useEffect,
  useState
} from "react";

import api from "../../services/api.js";

const AdminDashboard = () => {

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const fetchDashboard =
      async () => {

        try {

          const response =
            await api.get(
              "/admin/dashboard"
            );

          setStats(
            response.data.stats
          );

        } catch (error) {

          console.error(
            "Admin dashboard error:",
            error
          );

          setError(
            error.response?.data?.message ||
            "Unable to load admin dashboard"
          );

        } finally {

          setLoading(false);

        }

      };

    fetchDashboard();

  }, []);


  if (loading) {

    return (
      <div>
        Loading admin dashboard...
      </div>
    );

  }


  if (error) {

    return (
      <div>
        {error}
      </div>
    );

  }


  return (
    <div>

      <h1>
        Admin Dashboard
      </h1>

      <p>
        Delivery operations overview
      </p>


      <div>

        <h2>
          Total Orders
        </h2>

        <strong>
          {stats?.totalOrders ?? 0}
        </strong>

      </div>


      <div>

        <h2>
          Customers
        </h2>

        <strong>
          {stats?.users?.totalCustomers ?? 0}
        </strong>

      </div>


      <div>

        <h2>
          Agents
        </h2>

        <strong>
          {stats?.users?.totalAgents ?? 0}
        </strong>

      </div>


      <div>

        <h2>
          Available Agents
        </h2>

        <strong>
          {stats?.users?.availableAgents ?? 0}
        </strong>

      </div>


      <h2>
        Order Status
      </h2>


      <p>
        Created:{" "}
        {stats?.orders?.created ?? 0}
      </p>

      <p>
        Assigned:{" "}
        {stats?.orders?.assigned ?? 0}
      </p>

      <p>
        Picked Up:{" "}
        {stats?.orders?.pickedUp ?? 0}
      </p>

      <p>
        In Transit:{" "}
        {stats?.orders?.inTransit ?? 0}
      </p>

      <p>
        Out for Delivery:{" "}
        {stats?.orders?.outForDelivery ?? 0}
      </p>

      <p>
        Delivered:{" "}
        {stats?.orders?.delivered ?? 0}
      </p>

      <p>
        Failed:{" "}
        {stats?.orders?.failed ?? 0}
      </p>

      <p>
        Rescheduled:{" "}
        {stats?.orders?.rescheduled ?? 0}
      </p>

    </div>
  );
};

export default AdminDashboard;