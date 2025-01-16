import { lazy } from "react";
import { Navigate } from "react-router-dom";
import CreateProject from "../views/CreateProject";
import Register from "../views/auth/Register";
import Login from "../views/auth/Login";
import ProjectList from "../views/ProjectList/ProjectList";
import ProjectEdit from "../views/ProjectEdit/ProjectEdit.js";
import ProjectDetail from "../views/ProjectDetail/ProjectDetail";
import Profile from "../views/Profile/Profile";
import AdminPage from "../views/pages/AdminPage.js";
import VerifyEmail from "../views/auth/VerifyEmail";
/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout/FullLayout.js"));
/****End Layouts*****/

/*****Pages******/
const Dashboard1 = lazy(() => import("../views/dashboards/Dashboard1.js"));

/*****Tables******/
const BasicTable = lazy(() => import("../views/tables/BasicTable.js"));

// form elements
const ExAutoComplete = lazy(() =>
  import("../views/FormElements/ExAutoComplete.js")
);
const ExButton = lazy(() => import("../views/FormElements/ExButton.js"));
const ExCheckbox = lazy(() => import("../views/FormElements/ExCheckbox.js"));
const ExRadio = lazy(() => import("../views/FormElements/ExRadio.js"));
const ExSlider = lazy(() => import("../views/FormElements/ExSlider.js"));
const ExSwitch = lazy(() => import("../views/FormElements/ExSwitch.js"));
// form layouts
const FormLayouts = lazy(() => import("../views/FormLayouts/FormLayouts.js"));

/*****Routes******/

const ThemeRoutes = [
  {
    path: "/",
    element: <FullLayout />,
    children: [
      { path: "/", element: <Navigate to="dashboards/dashboard1" /> },
      { path: "dashboards/dashboard1", exact: true, element: <Dashboard1 /> },
      { path: "tables/basic-table", element: <BasicTable /> },
      { path: "/create-project", element: <CreateProject /> },
      { path: "/form-layouts/form-layouts", element: <FormLayouts /> },
      { path: "/form-elements/autocomplete", element: <ExAutoComplete /> },
      { path: "/form-elements/button", element: <ExButton /> },
      { path: "/form-elements/checkbox", element: <ExCheckbox /> },
      { path: "/form-elements/radio", element: <ExRadio /> },
      { path: "/form-elements/slider", element: <ExSlider /> },
      { path: "/form-elements/switch", element: <ExSwitch /> },
      { path: "/projects", element: <ProjectList /> },
      { path: "/projects/edit/:id", element: <ProjectEdit /> },
      {path: "/projects/detail/:id", element: <ProjectDetail />},
      {path: "/profile", element: <Profile />},
      {path: "/admin", element: <AdminPage />},
      {path: "/verify-email", element: <VerifyEmail />},
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default ThemeRoutes;
