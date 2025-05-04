import { useState } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, Container } from "@mui/material";
import { loginUser, User } from "@/api/auth";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: () => loginUser({ email, password }),
    onSuccess: (user) => {
      // Store user data immediately
      localStorage.setItem("userRole", user.role);
      // Force auth service to update with the new user
      authService.updateUserData(user);
      
      // Navigate based on role
      navigate(`/${user.role}`);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    login();
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          width: "100%"
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/auth/register")}
          >
            Don't have an account? Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 