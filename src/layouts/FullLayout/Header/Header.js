import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  styled,
  useTheme,
  useMediaQuery,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import logoInonu from '../../../assets/images/logo-inonu.png';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100], // Daha modern ve nötr bir arka plan rengi
  color: theme.palette.text.primary,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Hafif gölge efekti
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& img': {
    height: '40px',
    width: 'auto',
  },
}));

const Header = ({ sx, customClass, toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <StyledAppBar 
      position="fixed" 
      sx={sx} 
      elevation={0} 
      className={customClass}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: { xs: '64px', lg: '70px' },
          px: { xs: 2, lg: 4 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label={isSidebarOpen ? "close menu" : "open menu"}
            onClick={toggleSidebar}
            edge="start"
            sx={{
              mr: 2,
              display: 'flex',
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shorter,
              }),
              transform: isSidebarOpen ? 'rotate(180deg)' : 'none',
            }}
          >
            {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>

          <LogoContainer>
            <img 
              src={logoInonu} 
              alt="İnönü Üniversitesi Logo"
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                display: 'block',
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              İnüFest
            </Typography>
          </LogoContainer>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2 
        }}>
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', md: 'block' },
              color: theme.palette.text.secondary,
            }}
          >
            {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;