import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api.js";

const AuthContext =
  createContext(null);

export const AuthProvider = ({
  children
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    const token =
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("user");

    if (token && savedUser) {

      try {

        setUser(
          JSON.parse(savedUser)
        );

      } catch {

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "token"
        );
      }
    }

    setLoading(false);

  }, []);


  const login = async (
    email,
    password
  ) => {

    const response =
      await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

    const {
      token,
      user
    } = response.data;


    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );


    setUser(user);

    return user;
  };


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated:
          Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>
  useContext(AuthContext);