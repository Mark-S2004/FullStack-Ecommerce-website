import * as React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
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
import axios from "axios"
import { toast } from "react-toastify"

const NavBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const navigate = useNavigate()

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const { mutate: logout } = useMutation({
    mutationFn: () => {
      return axios.post("/api/auth/logout")
    },
    onSuccess: () => {
      navigate("/auth/login")
    },
    onError: (error) => {
      toast.error(
        `An error occurred.\n${error.response.data.message} [${error.response.status}]`
      )
    },
  })
  const onLogout = () => {
    logout()
  }

  const { pathname } = useLocation()
  const isCustomer = pathname.includes("customer")
  let pages
  if (isCustomer) {
    pages = ["Products", "Cart", "Orders"]
  } else {
    pages = ["Inventory", "Orders"]
  }

  return (
    <AppBar position="static" sx={{ width: "100vw" }}>
      <Container>
        <Toolbar disableGutters>
          <StoreIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            onClick={() => {
              navigate(`/${isCustomer ? "customer" : "admin"}`)
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
            ECOMMERCE
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
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
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => {
                    handleCloseNavMenu()
                    navigate(
                      `${isCustomer ? "customer" : "admin"}/${page
                        .toLowerCase()
                        .replace(/ /g, "-")}`
                    )
                  }}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <StoreIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            EDU-CUBBY
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Link
                key={page}
                to={`${isCustomer ? "customer" : "admin"}/${page
                  .toLowerCase()
                  .replace(/ /g, "-")}`}
              >
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page}
                </Button>
              </Link>
            ))}
          </Box>

          <Button sx={{ color: "white" }} onClick={onLogout}>
            <LogoutIcon />
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default NavBar
