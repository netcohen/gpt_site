import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Button, Typography, TextField, Box, AppBar, Toolbar, Container } from '@mui/material';
import AdminDashboard from './AdminDashboard';
import TrainerDashboard from './TrainerDashboard';
import ClientDashboard from './ClientDashboard';

const socket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
  }, []);

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setUser(response.data.user);
      setRole(response.data.user.role);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('role', response.data.user.role);
    } catch (error) {
      console.error('🔴 שגיאה בהתחברות:', error);
      alert('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <Container>
      {/* ✅ סרגל עליון משותף לכל המשתמשים */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>🐾 מערכת ניהול מאלפים</Typography>
          {user && (
            <Button color="inherit" onClick={() => { 
              setUser(null); 
              setRole(null); 
              localStorage.removeItem('token'); 
              localStorage.removeItem('user'); 
              localStorage.removeItem('role'); 
            }}>
              התנתק
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {!user ? (
        <Box textAlign="center" mt={5}>
          <TextField label="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="סיסמה" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" onClick={login}>התחבר</Button>
        </Box>
      ) : role === "admin" ? (
        <AdminDashboard />
      ) : role === "trainer" ? (
        <TrainerDashboard />
      ) : (
        <ClientDashboard />
      )}
    </Container>
  );
}

export default App;
