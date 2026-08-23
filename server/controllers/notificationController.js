import Notification from "../models/Notification.js";


// -----------------------------------------
// GET MY NOTIFICATIONS
// -----------------------------------------

export const getMyNotifications = async (
  req,
  res
) => {
  try {

    const notifications =
      await Notification.find({
        userId: req.user.userId
      })
        .populate(
          "orderId",
          "orderNumber status"
        )
        .sort({
          createdAt: -1
        });


    res.status(200).json({
      success: true,

      count:
        notifications.length,

      notifications
    });

  } catch (error) {

    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications"
    });
  }
};


// -----------------------------------------
// MARK AS READ
// -----------------------------------------

export const markNotificationAsRead =
  async (req, res) => {
    try {

      const notification =
        await Notification.findOne({
          _id: req.params.id,

          userId:
            req.user.userId
        });


      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found"
        });
      }


      notification.isRead = true;

      await notification.save();


      res.status(200).json({
        success: true,

        message:
          "Notification marked as read",

        notification
      });

    } catch (error) {

      console.error(
        "Mark notification error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notification"
      });
    }
  };


// -----------------------------------------
// MARK ALL AS READ
// -----------------------------------------

export const markAllNotificationsAsRead =
  async (req, res) => {
    try {

      await Notification.updateMany(
        {
          userId:
            req.user.userId,

          isRead: false
        },
        {
          isRead: true
        }
      );


      res.status(200).json({
        success: true,

        message:
          "All notifications marked as read"
      });

    } catch (error) {

      console.error(
        "Mark all notifications error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notifications"
      });
    }
  };