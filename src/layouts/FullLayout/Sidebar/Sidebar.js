import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  styled,
  useTheme,
  Collapse,
  Divider,
} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { SidebarWidth } from "../../../assets/global/Theme-variable";
import Menuitems from "./data";
import axios from "axios";
import logoInonu from '../../../assets/images/logo-inonu.png';

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  ...(selected && {
    color: 'white',
    backgroundColor: `${theme.palette.primary.main}!important`,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
  }),
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  '& img': {
    width: '140px',
    height: 'auto',
    maxWidth: '100%',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
}));

const Sidebar = ({ isSidebarOpen, isMobileSidebarOpen, onSidebarClose }) => {
  const [activeItem, setActiveItem] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  // Update active item when pathname changes
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:8080/v1/auth/logout/${token}`);
      
      if (response.status === 200) {
        localStorage.clear();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Çıkış yapılırken bir hata oluştu!');
    }
  };

  const filteredMenuItems = useMemo(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    return Menuitems.filter(item => {
      if (token) {
        return !item.roles.includes('guest') && item.roles.includes(userRole);
      }
      return item.roles.includes('guest');
    });
  }, []);

  const SidebarContent = (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <DrawerHeader>
        <LogoWrapper>
          <img 
            src={logoInonu} 
            alt="İnönü Üniversitesi Logo"
          />
        </LogoWrapper>
        {!lgUp && (
          <IconButton 
            onClick={onSidebarClose}
            sx={{
              fontSize: '1.5rem',
            }}
          >
            <ChevronLeftIcon 
              sx={{
                fontSize: '2rem',
              }}
            />
          </IconButton>
        )}
      </DrawerHeader>

      <Divider />

      <Box sx={{ 
        flexGrow: 1,
        px: 2,
        py: 3,
        overflowY: 'auto',
      }}>
        <List>
          {filteredMenuItems.map((item) => (
            <StyledListItem
              key={item.title}
              button
              selected={activeItem === item.href}
              onClick={item.href === '/logout' ? handleLogout : undefined}
              component={item.href === '/logout' ? 'div' : NavLink}
              to={item.href === '/logout' ? undefined : item.href}
              sx={{
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: '40px',
                  color: activeItem === item.href ? 'white' : 'inherit',
                }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: activeItem === item.href ? 600 : 400,
                  },
                }}
              />
            </StyledListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={lgUp ? isSidebarOpen : isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant={lgUp ? "persistent" : "temporary"}
      PaperProps={{
        sx: {
          width: SidebarWidth,
          border: 'none',
          boxShadow: theme.shadows[8],
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {SidebarContent}
    </Drawer>
  );
};

export default Sidebar;