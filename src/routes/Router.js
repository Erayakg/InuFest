import { Navigate } from "react-router-dom";
import FullLayout from "../layouts/FullLayout/FullLayout";
import CreateProject from "../views/CreateProject";
import Register from "../views/auth/Register";
import Login from "../views/auth/Login";
import ProjectList from "../views/ProjectList/ProjectList";
import ProjectEdit from "../views/ProjectEdit/ProjectEdit";
import ProjectDetail from "../views/ProjectDetail/ProjectDetail";
import Profile from "../views/Profile/Profile";
import AdminPage from "../views/pages/AdminPage";
import VerifyEmail from "../views/auth/VerifyEmail";
import PrivateRoute from "../components/PrivateRoute";
import ProjectListAdmin from "../views/admin/ProjectList";
import RefereeProjectList from "../views/referee/RefereeProjectList";
import RefereePage from "../views/referee/referee";
import Dashboard1 from "../views/dashboards/Dashboard1";
import BasicTable from "../views/tables/BasicTable";
import ExAutoComplete from "../views/FormElements/ExAutoComplete";
import ExButton from "../views/FormElements/ExButton";
import ExCheckbox from "../views/FormElements/ExCheckbox";
import ExRadio from "../views/FormElements/ExRadio";
import ExSlider from "../views/FormElements/ExSlider";
import ExSwitch from "../views/FormElements/ExSwitch";
import FormLayouts from "../views/FormLayouts/FormLayouts";

const ThemeRoutes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <FullLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/login" /> },
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
      { path: "/projectDetails/:id", element: <ProjectDetail /> },
      { path: "/projects/edit/:id", element: <ProjectEdit /> },
      { path: "/projects/detail/:id", element: <ProjectDetail /> },
      { path: "/profile", element: <Profile /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/admin/projects", element: <ProjectListAdmin /> },
      { path: "/referee-projects", element: <RefereeProjectList /> },
      { path: "/referee", element: <RefereePage /> },
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
  },
];

export default ThemeRoutes;
