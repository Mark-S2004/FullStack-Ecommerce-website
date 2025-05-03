import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import StoreIcon from "@mui/icons-material/Store"
import InventoryIcon from "@mui/icons-material/Inventory"
import ListAltIcon from "@mui/icons-material/ListAlt"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import { toast } from "react-toastify"
import { getCurrentUser, logoutUser } from "@/api/auth"
import { authService } from "@/services/auth.service"

// User data type
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const NavBar: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        await authService.checkAuth()
        if (authService.isAuthenticated && authService.currentUser) {
          setUser(authService.currentUser)
        } else {
          // Redirect to login if not authenticated
          navigate("/auth/login")
        }
      } catch (error) {
        navigate("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [navigate])

  const { mutate: logout } = useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      authService.clearAuth()
      navigate("/auth/login")
    },
    onError: (err) => {
      let message = 'An error occurred'
      let status = 'unknown'
      
      toast.error(`${message} [${status}]`)
    },
  })

  // Navigation handlers
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const onLogout = () => {
    logout()
  }

  // Handle loading state
  if (isLoading || !user) return null

  const isAdmin = user.role === "admin"
  const baseUrl = isAdmin ? "/admin" : "/customer"

  // Define navigation based on user role
  const navigationItems: NavItem[] = isAdmin
    ? [
        { name: "Inventory", path: `${baseUrl}/inventory`, icon: <InventoryIcon /> },
        { name: "Orders", path: `${baseUrl}/orders`, icon: <ListAltIcon /> },
      ]
    : [
        { name: "Products", path: `${baseUrl}/products`, icon: <StoreIcon /> },
        { name: "Cart", path: `${baseUrl}/cart`, icon: <ShoppingCartIcon /> },
        { name: "Orders", path: `${baseUrl}/orders`, icon: <ListAltIcon /> },
      ]

  return (
    <AppBar position="static" sx={{ width: "100vw" }}>
      <Container>
        <Toolbar disableGutters>
          <StoreIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            onClick={() => {
              navigate(baseUrl)
            }}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            {isAdmin ? "ADMIN PANEL" : "ECOMMERCE"}
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.name}
                  onClick={() => {
                    handleCloseNavMenu()
                    navigate(item.path)
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.icon}
                    <Typography textAlign="center">{item.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile logo */}
          <StoreIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            onClick={() => navigate(baseUrl)}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            {isAdmin ? "ADMIN" : "SHOP"}
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                onClick={() => {
                  handleCloseNavMenu()
                  navigate(item.path)
                }}
                startIcon={item.icon}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 2, display: { xs: "none", md: "flex" } }}>
              Hello, {user.name}
            </Typography>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user.name} src="/static/avatar.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              id="user-menu"
              sx={{ mt: "45px" }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={onLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default NavBar
