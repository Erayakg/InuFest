import React from "react";
import { Grid, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';

import {
  BlogCard,
  SalesOverview,
  ProductPerformance,
  DailyActivities,
} from "./dashboard1-components";

const Dashboard1 = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Grid container spacing={0}>
        {/* Yeni Proje Oluştur Butonu */}
        <Grid item xs={12} lg={12} mb={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-project')}
            sx={{ float: 'right' }}
          >
            Yeni Proje Oluştur
          </Button>
        </Grid>
        {/* ------------------------- row 1 ------------------------- */}
        <Grid item xs={12} lg={12}>
          <SalesOverview />
        </Grid>
        {/* ------------------------- row 2 ------------------------- */}
        <Grid item xs={12} lg={4}>
          <DailyActivities />
        </Grid>
        <Grid item xs={12} lg={8}>
          <ProductPerformance />
        </Grid>
        {/* ------------------------- row 3 ------------------------- */}
        <BlogCard />
      </Grid>
    </Box>
  );
};

export default Dashboard1;
