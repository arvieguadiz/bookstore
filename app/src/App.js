import React, { useEffect, useState } from 'react';
import { AppBar, Box, Button, Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Toolbar, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet, Routes, Route, useNavigate } from 'react-router-dom';

import api from './config/apisauce';

import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const loginData = localStorage.getItem('loginData') ? JSON.parse(localStorage.getItem('loginData')) : null;
  const navigate = useNavigate();

  const [ logoutDialog, setLogoutDialog ] = useState(false);

  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const logout = async () => {
    const result = await api.post('/api/auth/logout');

    if (result.ok) {
      localStorage.removeItem('loginData');
      setLogoutDialog(false);
      navigate('/');
    }
  };

  const backendSessionChecker = async () => {
    const result = await api.get('/api/auth/session-checker');

    if (result.ok) {
      if (!result.data.body.loginData) {
        localStorage.removeItem('loginData');
        if (window.location.pathname !== '/login') {
          navigate('/');
        }
      } else {
        if (window.location.pathname === '/')
          navigate('/dashboard');
        else if (window.location.pathname === '/login')
          navigate('/dashboard');
        else
          navigate(window.location.pathname);
      }
    }
  };

  useEffect(() => {
    backendSessionChecker();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main">
        <CssBaseline />

        <AppBar position="fixed">
          <Toolbar>
            {
              loginData &&
              <Typography variant="h6" noWrap component="div">Hi, {loginData?.first_name} {loginData.last_name}!</Typography>
            }
            <Box sx={{ marginLeft: 'auto' }}>
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    variant="text"
                    onClick={() => loginData ? setLogoutDialog(true) : navigate('/login')}
                  >
                    {
                      loginData
                        ? 'Logout'
                        : window.location.pathname !== '/login' && 'Login'
                    }
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, pl: 3, pr: 3, pb: 3 }}>
          <Toolbar disableGutters />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="*"
              element={
                <main style={{ padding: '1rem', paddingTop: '3rem', textAlign: 'center' }}>
                  <h1>404</h1>
                  <h4>Not Found</h4>
                  <p>There's nothing here!</p>
                </main>
              }
            />
          </Routes>

          <Outlet />
        </Box>

        <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText>This will logout you from the system.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
            <Button autoFocus onClick={logout}>Ok</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
