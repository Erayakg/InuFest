import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { SidebarWidth } from "../../../assets/global/Theme-variable";
import LogoIcon from "../Logo/LogoIcon";
import Menuitems from "./data";
import axios from "axios"; // axios'u import etmeyi unutmayın

const Sidebar = (props) => {
  const [open, setOpen] = React.useState(true);
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const navigate = useNavigate();

  const handleClick = (index) => {
    if (open === index) {
      setOpen((prevopen) => !prevopen);
    } else {
      setOpen(index);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/v1/auth/logout/${token}`);
      
      // Kullanıcı bilgilerini temizle
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      // Giriş sayfasına yönlendirme
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getFilteredMenuItems = () => {
    const role = localStorage.getItem("role") || "guest";
    return Menuitems.filter(item => item.roles.includes(role));
  };

  const SidebarContent = (
    <Box sx={{ 
      p: 3,
      height: "100vh",
      "& .simplebar-scrollbar": {
        "&:before": {
          backgroundColor: "rgba(0,0,0,.05)",
        },
      },
    }}>
      <Link to="/">
        <Box sx={{ display: "flex", alignItems: "Center" }}>
          <LogoIcon />
        </Box>
      </Link>

      <Box
        sx={{
          mt: 4,
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,.2) transparent",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "10px",
            "&:hover": {
              background: "#a8a8a8",
            },
          },
        }}
      >
        <List>
          {getFilteredMenuItems().map((item, index) => (
            <List component="li" disablePadding key={item.title}>
              <ListItem
                onClick={() => item.href === "/logout" ? handleLogout() : handleClick(index)}
                button
                component={item.href !== "/logout" ? NavLink : "div"}
                to={item.href !== "/logout" ? item.href : "#"}
                selected={pathDirect === item.href}
                sx={{
                  mb: 1,
                  ...(pathDirect === item.href && {
                    color: "white",
                    backgroundColor: (theme) =>
                      `${theme.palette.primary.main}!important`,
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    ...(pathDirect === item.href && { color: "white" }),
                  }}
                >
                  <item.icon width="20" height="20" />
                </ListItemIcon>
                <ListItemText>{item.title}</ListItemText>
              </ListItem>
            </List>
          ))}
        </List>
      </Box>
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open={props.isSidebarOpen}
        variant="persistent"
        PaperProps={{
          sx: {
            width: SidebarWidth,
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={props.isMobileSidebarOpen}
      onClose={props.onSidebarClose}
      PaperProps={{
        sx: {
          width: SidebarWidth,
        },
      }}
      variant="temporary"
    >
      {SidebarContent}
    </Drawer>
  );
};

export default Sidebar;