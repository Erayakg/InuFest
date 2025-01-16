import React from "react";
import { useLocation, useNavigate } from "react-router";
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
import Menuitems from "./data";
import axios from "axios";

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
      const token = localStorage.getItem('token');
      
      // Önce backend'e logout isteği at
      const response = await axios.post(`http://localhost:8080/v1/auth/logout/${token}`);
      
      // Backend isteği başarılı olduysa
      if (response.status === 200) {
        // localStorage'ı temizle
        localStorage.clear();
        // Login sayfasına yönlendir
        navigate('/login');
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      // Hata durumunda kullanıcıya bilgi verilebilir
      alert('Çıkış yapılırken bir hata oluştu!');
    }
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
          {Menuitems.map((item, index) => {
            if (item.href === '/logout') {
              return (
                <ListItem
                  key={item.title}
                  button
                  onClick={handleLogout}
                  sx={{
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItem>
              );
            }

            return (
              <ListItem
                key={item.title}
                button
                component={NavLink}
                to={item.href}
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
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            );
          })}
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
