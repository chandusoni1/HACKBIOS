import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DRDOApplicationForm from "./pages/Form1.jsx";
import DRDOForm2 from "./pages/Form2.jsx";
import ScientistDashboard from "./pages/Dashboard.jsx";
import Header from "./components/Header.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "Form1", element: <DRDOApplicationForm /> },
  { path: "form2", element: <DRDOForm2 /> },
  { path: "ScientistDashboard", element: <ScientistDashboard /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Header />
    <RouterProvider router={router} />
  </StrictMode>
);
