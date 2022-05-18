import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import api from '../config/apisauce';

const Login = () => {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState(null);

  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setError('This field is required.');
    } else {
      const result = await api.post('/api/auth/login', { data: { username: username, password: password } });

      if (result.ok) {
        if (result.data) {
          localStorage.setItem('loginData', JSON.stringify(result.data));
          navigate('/dashboard');
        } else {
          setPassword('');
          setError('User not found or email and password are incorrect.');
        }
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Log In</Typography>

        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            // autoFocus
            error={!username && error !== null}
            helperText={!username && error}
            onChange={event => setUsername(event.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            error={!password && error !== null}
            helperText={!password && error}
            onChange={event => setPassword(event.target.value)}
          />
          <Button fullWidth variant="contained" onClick={login} sx={{ mt: 3, mb: 2 }}>Log In</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;