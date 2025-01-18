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
import PrivateRoute from '../components/PrivateRoute';
import ProjectListAdmin from "../views/admin/ProjectList";
import RefereeProjectList from "../views/referee/RefereeProjectList";
/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout/FullLayout.js"));
/****End Layouts*****/

/*****Pages******/
const Dashboard1 = lazy(() => import("../views/dashboards/Dashboard1.js"));
const BasicTable = lazy(() => import("../views/tables/BasicTable.js"));
const ExAutoComplete = lazy(() => import("../views/FormElements/ExAutoComplete.js"));
const ExButton = lazy(() => import("../views/FormElements/ExButton.js"));
const ExCheckbox = lazy(() => import("../views/FormElements/ExCheckbox.js"));
const ExRadio = lazy(() => import("../views/FormElements/ExRadio.js"));
const ExSlider = lazy(() => import("../views/FormElements/ExSlider.js"));
const ExSwitch = lazy(() => import("../views/FormElements/ExSwitch.js"));
const FormLayouts = lazy(() => import("../views/FormLayouts/FormLayouts.js"));

const ThemeRoutes = [
  {
    path: "/",
    element: <PrivateRoute><FullLayout /></PrivateRoute>,
    children: [
      { path: "/", element: <Navigate to="/profile" /> },
      { path: "dashboards/dashboard1", element: <Dashboard1 /> },
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
      { path: "/projects/detail/:id", element: <ProjectDetail /> },
      { path: "/profile", element: <Profile /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/projectDetails/:id", element: <ProjectDetail /> },
      { path: "/admin/projects", element: <ProjectListAdmin /> },
      { path: "/referee-projects", element: <RefereeProjectList /> },
    ],
  },
  // Public routes - giriş yapmadan erişilebilen rotalar
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  }
];

export default ThemeRoutes;
