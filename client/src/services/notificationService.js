import api from "./api.js";


export const getNotifications =
  async () => {

    const response =
      await api.get(
        "/notifications"
      );

    return response.data.notifications || [];
  };


export const markNotificationRead =
  async (id) => {

    const response =
      await api.put(
        `/notifications/${id}/read`
      );

    return response.data;
  };


export const markAllNotificationsRead =
  async () => {

    const response =
      await api.put(
        "/notifications/read-all"
      );

    return response.data;
  };