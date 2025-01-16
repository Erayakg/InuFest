import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

const Menuitems = [
  {
    title: "Anasyfa",
    icon: DashboardOutlinedIcon,
    href: "/admin",
    roles: ["ROLE_ADMIN"]
  },
  {
    
    title: "Projelerim",
    icon: DashboardOutlinedIcon,
    href: "/projects",
    roles: [ "ROLE_STUDENT"]
  },
  
  {
    title: "Proje Ekle",
    icon: DashboardOutlinedIcon,
    href: "/create-project",
    roles: [ "ROLE_STUDENT"]
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
    title: "Profile",
    icon: DashboardOutlinedIcon,
    href: "/profile",
    roles: ["ROLE_ADMIN", "ROLE_STUDENT", "ROLE_REFEREE"]
  },
  {
    title: "Çıkış Yap",
    icon: DashboardOutlinedIcon,
    href: "/logout",
    roles: ["ROLE_ADMIN", "ROLE_STUDENT", "ROLE_REFEREE"]
  },
  
];

export default Menuitems;