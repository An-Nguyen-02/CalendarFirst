// pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../../api/auth.ts';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import type { User } from '../../types/types.ts';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation<User,Error,{ username: string; password: string }>({
    mutationFn: loginUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/');
    },
    onError: () => {
      alert('Invalid credentials');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ username, password });
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <TextField label="Username" fullWidth margin="normal" required value={username} onChange={e => setUsername(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" required value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }} disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? 'Logging in...' : 'Login'}
        </Button>
        <Link component={RouterLink} to="/signup" variant="body2">Don't have an account? Sign Up</Link>
      </Box>
    </Container>
  );
}
