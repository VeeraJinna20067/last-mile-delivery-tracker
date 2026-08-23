import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Bell
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../services/notificationService.js";


const Navbar = () => {

  const navigate =
    useNavigate();


  const [
    notifications,
    setNotifications
  ] = useState([]);


  const [
    open,
    setOpen
  ] = useState(false);


  const notificationRef =
    useRef(null);


  const unreadCount =
    notifications.filter(
      (item) =>
        !item.isRead
    ).length;


  useEffect(() => {

    fetchNotifications();


    const interval =
      setInterval(
        fetchNotifications,
        30000
      );


    return () =>
      clearInterval(
        interval
      );

  }, []);


  useEffect(() => {

    const handleClick =
      (event) => {

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };


    document.addEventListener(
      "mousedown",
      handleClick
    );


    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );

  }, []);


 const fetchNotifications =
  async () => {

    try {

      const data =
        await getNotifications();

      console.log(
        "FRONTEND NOTIFICATIONS:",
        data
      );

      setNotifications(
        data
      );

    } catch (error) {

      console.error(
        "NOTIFICATION FETCH ERROR:",
        error
      );

    }
  };

  const handleNotificationClick =
    async (notification) => {

      try {

        if (!notification.isRead) {

          await markNotificationRead(
            notification._id
          );

          setNotifications(
            (previous) =>
              previous.map(
                (item) =>
                  item._id ===
                  notification._id
                    ? {
                        ...item,
                        isRead: true
                      }
                    : item
              )
          );
        }


        setOpen(false);


        if (
          notification.orderId?._id
        ) {

          navigate(
            `/orders/${notification.orderId._id}`
          );
        }

      } catch {

        // Ignore UI-only notification errors.
      }
    };


  const handleMarkAll =
    async () => {

      try {

        await markAllNotificationsRead();

        setNotifications(
          (previous) =>
            previous.map(
              (item) => ({
                ...item,
                isRead: true
              })
            )
        );

      } catch {

        // Ignore notification update errors.
      }
    };


  return (
    <header className="topbar">

      <div>
        <span className="topbar-label">
          Workspace
        </span>

        <strong>
          Delivery operations
        </strong>
      </div>


      <div
        className="notification-wrapper"
        ref={notificationRef}
      >

        <button
          className="notification-button"
          onClick={() =>
            setOpen(
              (previous) =>
                !previous
            )
          }
        >

          <Bell size={18} />

          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </span>
          )}

        </button>


        {open && (

          <div className="notification-panel">

            <div className="notification-header">

              <div>
                <strong>
                  Notifications
                </strong>

                <span>
                  {unreadCount} unread
                </span>
              </div>


              {unreadCount > 0 && (
                <button
                  onClick={
                    handleMarkAll
                  }
                  className="mark-all-button"
                >
                  Mark all read
                </button>
              )}

            </div>


            {notifications.length === 0 ? (

              <div className="notification-empty">
                <Bell size={20} />

                <p>
                  You're all caught up.
                </p>
              </div>

            ) : (

              <div className="notification-list">

                {notifications
                  .slice(0, 8)
                  .map(
                    (notification) => (

                      <button
                        key={
                          notification._id
                        }
                        className={
                          notification.isRead
                            ? "notification-item"
                            : "notification-item unread"
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >

                        <div className="notification-dot" />

                        <div>

                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <span>
                            {
                              new Date(
                                notification.createdAt
                              ).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }
                              )
                            }
                          </span>

                        </div>

                      </button>

                    )
                  )}

              </div>

            )}

          </div>

        )}

      </div>

    </header>
  );
};

export default Navbar;