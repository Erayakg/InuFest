import React from 'react'
import {
    Box,
    Link,
    Typography,
    
  } from "@mui/material";
const Footer = () => {
    return ( 
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                İnönü Üniversitesi Dijital Dönüşüm Ofisi
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                powered by kv97
            </Typography>
        </Box>
     );
}
 
export default Footer;