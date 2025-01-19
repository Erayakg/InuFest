import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Menuitems = [
  {
    title: "Anasayfa",
    icon: DashboardOutlinedIcon,
    href: "/admin",
    roles: ["ROLE_ADMIN"]
  },
  {
    title: "Tüm Projeler",
    icon: ListAltIcon,
    href: "/admin/projects",
    roles: ["ROLE_ADMIN"]
  },
  {
    title: "Projelerim",
    icon: DashboardOutlinedIcon,
    href: "/projects",
    roles: ["ROLE_STUDENT"]
  },
  {
    title: "Proje Ekle",
    icon: DashboardOutlinedIcon,
    href: "/create-project",
    roles: ["ROLE_STUDENT"]
  },
  {
    title: "Üzerime Atanan Projeler",
    icon: AssignmentIcon,
    href: "/referee-projects",
    roles: ["ROLE_REFEREE"]
  },
  {
    title: "Hakem Profili",
    icon: DashboardOutlinedIcon,
    href: "/referee",
    roles: ["ROLE_REFEREE"]
  },
  {
    title: "Giriş",
    icon: DashboardOutlinedIcon,
    href: "/login",
    roles: ["guest"]
  },
  {
    title: "Kayıt Ol",
    icon: DashboardOutlinedIcon,
    href: "/register",
    roles: ["guest"]
  },
  {
    title: "Profil",
    icon: DashboardOutlinedIcon,
    href: "/profile",
    roles: [ "ROLE_STUDENT"]
  },
  {
    title: "Çıkış Yap",
    icon: DashboardOutlinedIcon,
    href: "/logout",
    roles: ["ROLE_ADMIN", "ROLE_STUDENT", "ROLE_REFEREE"]
  },
];

export default Menuitems;