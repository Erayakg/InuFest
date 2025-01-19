import React from "react";
import { AppBar, Toolbar } from "@mui/material";

const Header = (props) => {
  return (
    <AppBar sx={props.sx} elevation={0} className={props.customClass}>
      <Toolbar>
        {/* Header is intentionally left empty */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
