import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  styled,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { useNavigate } from "react-router-dom";

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Header = ({ sx, customClass, toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <StyledAppBar position="fixed" sx={sx} elevation={0} className={customClass}>
      <Toolbar sx={{
        justifyContent: 'space-between',
        minHeight: { xs: '64px', lg: '70px' },
        px: { xs: 2, lg: 4 },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label={isSidebarOpen ? "close menu" : "open menu"}
            onClick={toggleSidebar}
            edge="start"
            sx={{
              mr: 2,
              transform: isSidebarOpen ? 'rotate(180deg)' : 'none',
              transition: theme.transitions.create('transform'),
            }}
          >
            {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            İNÜFEST Proje Yönetim Sistemi
          </Typography>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;