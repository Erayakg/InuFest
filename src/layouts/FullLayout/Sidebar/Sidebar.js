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
  Typography,
  Badge,
  Chip,
} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { SidebarWidth } from "../../../assets/global/Theme-variable";
import Menuitems from "./data";
import axios from "axios";
import logoInonu from '../../../assets/images/logo-inonu.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
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
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4, 2),
  '& img': {
    width: '120px',
    height: 'auto',
    marginBottom: theme.spacing(2),
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
}));

const UniversityTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.2rem',
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  letterSpacing: '0.5px',
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  textAlign: 'center',
  letterSpacing: '0.25px',
}));

const Sidebar = ({ isSidebarOpen, isMobileSidebarOpen, onSidebarClose }) => {
  const [activeItem, setActiveItem] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const userRole = localStorage.getItem('role');

  // Update active item when pathname changes
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/v1/auth/logout/${token}`);
      
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
          <UniversityTitle>
            İnönü Üniversitesi
          </UniversityTitle>
          <SubTitle>
            İNÜFEST Proje Yönetim Sistemi
          </SubTitle>
        </LogoWrapper>
        {!lgUp && (
          <IconButton onClick={onSidebarClose}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ px: 2 }}>
        <Chip
          label={`${userRole === 'ADMIN' ? 'Yönetici' : userRole === 'REFEREE' ? 'Hakem' : 'Kullanıcı'} Paneli`}
          color="primary"
          variant="outlined"
          sx={{ width: '100%', justifyContent: 'center' }}
        />
      </Box>

      <Box sx={{ 
        flexGrow: 1,
        px: 2,
        mt: 3,
        height: 'calc(100vh - 300px)', // Logo ve alt kısım için alan bırakıyoruz
        display: 'flex',
        flexDirection: 'column',
      }}>
        <List sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 1, // Menu itemler arası boşluk
        }}>
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
                mb: 0, // Margin bottom'ı kaldırdık çünkü gap kullanıyoruz
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: '40px',
                  color: activeItem === item.href ? 'white' : 'inherit',
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <item.icon />
                  </Badge>
                ) : (
                  <item.icon />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                secondary={item.subtitle}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: activeItem === item.href ? 600 : 400,
                  },
                }}
              />
              {item.chip && (
                <Chip
                  label={item.chip}
                  size="small"
                  color={item.chipColor || "default"}
                  sx={{ ml: 1 }}
                />
              )}
            </StyledListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ 
        mt: 'auto', // Alt kısmı en alta sabitler
        pt: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography 
          variant="caption" 
          color="textSecondary" 
          align="center" 
          display="block"
          sx={{ p: 2 }}
        >
          © 2024 İnönü Üniversitesi
        </Typography>
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