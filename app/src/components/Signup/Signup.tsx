import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signupUser } from '../../api/auth.ts';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      alert('Signup successful! Please check your email for verification.');
      navigate('/login');
    },
    onError: () => {
      alert('Signup failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ username, email, password });
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        <TextField label="Username" fullWidth margin="normal" required value={username} onChange={e => setUsername(e.target.value)} />
        <TextField label="Email" type="email" fullWidth margin="normal" required value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" required value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }} disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? 'Signing up...' : 'Sign Up'}
        </Button>
        <Link component={RouterLink} to="/login" variant="body2">Already have an account? Login</Link>
      </Box>
    </Container>
  );
}