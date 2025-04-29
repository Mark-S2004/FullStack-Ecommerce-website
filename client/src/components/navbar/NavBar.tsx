import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import Menu from "@mui/material/Menu"
import MenuIcon from "@mui/icons-material/Menu"
import Container from "@mui/material/Container"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import StoreIcon from "@mui/icons-material/Store"
import LogoutIcon from "@mui/icons-material/Logout"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import InventoryIcon from "@mui/icons-material/Inventory"
import ListAltIcon from "@mui/icons-material/ListAlt"
import Avatar from "@mui/material/Avatar"
import axios from "axios"
import { toast } from "react-toastify"

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
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)
  const navigate = useNavigate()

  // Fetch current user
  const userQuery: UseQueryResult<UserData> = useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<UserData> => {
      try {
        const response = await axios.get("/api/auth/me")
        const userData = response.data.data || response.data
        
        // Validate the user data format
        if (!userData || typeof userData !== 'object' || !userData.role) {
          throw new Error('Invalid user data format');
        }
        
        return userData as UserData
      } catch (err) {
        console.error("Error fetching user data:", err)
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/auth/login")
        }
        throw err
      }
    },
    retry: false,
  })

  const { mutate: logout } = useMutation({
    mutationFn: () => axios.post("/api/auth/logout"),
    onSuccess: () => navigate("/auth/login"),
    onError: (err) => {
      let message = 'An error occurred'
      let status = 'unknown'
      
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message
        status = err.response?.status?.toString() || 'unknown'
      }
      
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

  // Handle loading or error states
  if (userQuery.isLoading) return null
  
  if (userQuery.error || !userQuery.data) {
    React.useEffect(() => {
      navigate("/auth/login")
    }, [navigate])
    return null
  }

  const currentUser = userQuery.data
  const isAdmin = currentUser.role === "admin"
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
              Hello, {currentUser.name}
            </Typography>
            
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, mr: 1 }}>
              <Avatar alt={currentUser.name} src="/static/images/avatar/default.jpg">
                {currentUser.name.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LogoutIcon />
                  <Typography textAlign="center">Logout</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default NavBar
