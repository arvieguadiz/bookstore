import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// import api from '../config/apisauce';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h3">Welcome!</Typography>
        <Typography component="h1" variant="h6">Please login to use the system.</Typography>
        <Box sx={{ mt: 6 }}>
          <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;