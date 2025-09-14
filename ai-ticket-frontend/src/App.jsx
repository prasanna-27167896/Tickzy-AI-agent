import React from "react";
import { Route, Routes } from "react-router-dom";
import CheckAuth from "./components/CheckAuth.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetailsPage from "./pages/TicketDetailsPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./video/HomePage.jsx";
import VideoPage from "./video/VideoPage.jsx";

export default function App() {
  console.log(import.meta.env.VITE_SERVER_URL);
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth protectedRoute={true}>
              <Tickets />
            </CheckAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <CheckAuth protectedRoute={true}>
              <TicketDetailsPage />
            </CheckAuth>
          }
        />
        <Route
          path="/room/"
          element={
            <CheckAuth protectedRoute={true}>
              <HomePage />
            </CheckAuth>
          }
        />
        <Route
          path="/room/:id"
          element={
            <CheckAuth protectedRoute={true}>
              <VideoPage />
            </CheckAuth>
          }
        />
        <Route
          path="/login"
          element={
            <CheckAuth protectedRoute={false}>
              <Login />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protectedRoute={false}>
              <Signup />
            </CheckAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <CheckAuth protectedRoute={true}>
              <Admin />
            </CheckAuth>
          }
        />
      </Routes>
    </>
  );
}
