import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";

import { AuthContext } from "../../contexts/auth-context";

// Extract just the first part of the email (username)
function extractEmailPrefix(email: string) {
	return email.substring(0, email.indexOf("@"));
}

// Get initials for avatar
function getInitials(email: string) {
	if (!email) return "G";
	const username = email.split("@")[0];
	if (username.length <= 1) return username.toUpperCase();
	return username.substring(0, 2).toUpperCase();
}

function Header() {
	const navigate = useNavigate();
	const auth = useContext(AuthContext);
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Navigation items with icons and descriptions
	const navItems = [
		{
			name: "recipes",
			label: "Browse Recipes",
			icon: <RestaurantMenuIcon sx={{ mr: 1 }} />,
			description: "Explore our collection of recipes",
		},
		{
			name: "shopping",
			label: "Shopping Lists",
			icon: <ShoppingCartIcon sx={{ mr: 1 }} />,
			description: "Manage your shopping lists",
		},
		{
			name: "mealPlans",
			label: "Meal Plans",
			icon: <CalendarTodayIcon sx={{ mr: 1 }} />,
			description: "Plan your weekly meals",
		},
	];

	// Only show contribute if logged in
	const allNavItems = auth.isLoggedIn
		? [
				...navItems,
				{
					name: "contribute",
					label: "Add Recipe",
					icon: <AddCircleOutlineIcon sx={{ mr: 1 }} />,
					description: "Share your own recipe",
				},
		  ]
		: navItems;

	// User menu items based on authentication state
	const userMenuItems = auth.isLoggedIn
		? [
				{
					name: "Profile",
					icon: <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />,
					action: () => handleCloseUserMenu(),
				},
				{
					name: "Dashboard",
					icon: <DashboardIcon fontSize="small" sx={{ mr: 1 }} />,
					action: () => handleCloseUserMenu(),
				},
				{
					name: "Settings",
					icon: <SettingsIcon fontSize="small" sx={{ mr: 1 }} />,
					action: () => handleCloseUserMenu(),
				},
				{
					name: "Logout",
					icon: <LogoutIcon fontSize="small" sx={{ mr: 1 }} />,
					action: () => {
						handleCloseUserMenu();
						auth.logout();
					},
				},
		  ]
		: [
				{
					name: "Login",
					icon: <LoginIcon fontSize="small" sx={{ mr: 1 }} />,
					action: () => {
						handleCloseUserMenu();
						navigate("login");
					},
				},
		  ];

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const navigateTo = (path: string) => {
		handleCloseNavMenu();

		if (path === "shopping") {
			if (sessionStorage.getItem("returnToShoppingList") === "true") {
				sessionStorage.removeItem("returnToShoppingList");
				window.location.href = "/shopping";
			} else {
				navigate("/shopping");
			}
		} else {
			navigate(`/${path}`);
		}
	};

	return (
		<AppBar
			position="static"
			sx={{
				background: "linear-gradient(90deg, #EB5A3C 0%, #FF8A65 100%)",
				height: "70px",
				boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
			}}
		>
			<Container maxWidth="xl">
				<Toolbar disableGutters sx={{ height: "70px" }}>
					{/* Logo for desktop */}
					<RestaurantMenuIcon
						sx={{
							display: { xs: "none", md: "flex" },
							mr: 1,
							fontSize: "2rem",
						}}
					/>
					<Typography
						variant="h5"
						noWrap
						component="a"
						href="/"
						sx={{
							mr: 2,
							display: { xs: "none", md: "flex" },
							fontFamily: "'Roboto Slab', serif",
							fontWeight: 700,
							letterSpacing: ".1rem",
							color: "inherit",
							textDecoration: "none",
						}}
					>
						FlavorForge
					</Typography>

					{/* Mobile menu */}
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: "flex", md: "none" },
						}}
					>
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
							sx={{ display: { xs: "block", md: "none" } }}
						>
							{allNavItems.map((item) => (
								<MenuItem
									key={item.name}
									onClick={() => navigateTo(item.name)}
									sx={{ py: 1, px: 2 }}
								>
									{item.icon}
									<Box sx={{ ml: 1 }}>
										<Typography variant="body1">
											{item.label}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{item.description}
										</Typography>
									</Box>
								</MenuItem>
							))}
						</Menu>
					</Box>

					{/* Logo for mobile */}
					<RestaurantMenuIcon
						sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
					/>
					<Typography
						variant="h6"
						noWrap
						component="a"
						href="/"
						sx={{
							mr: 2,
							display: { xs: "flex", md: "none" },
							flexGrow: 1,
							fontFamily: "'Roboto Slab', serif",
							fontWeight: 700,
							color: "inherit",
							textDecoration: "none",
						}}
					>
						FlavorForge
					</Typography>

					{/* Desktop navigation */}
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: "none", md: "flex" },
						}}
					>
						{allNavItems.map((item) => (
							<Button
								key={item.name}
								onClick={() => navigateTo(item.name)}
								startIcon={item.icon}
								sx={{
									my: 2,
									color: "white",
									display: "block",
									mx: 1,
									px: 2,
									borderRadius: "20px",
									"&:hover": {
										backgroundColor:
											"rgba(255, 255, 255, 0.2)",
									},
								}}
							>
								{item.label}
							</Button>
						))}
					</Box>

					{/* User menu */}
					<Box sx={{ flexGrow: 0 }}>
						<Tooltip
							title={
								auth.isLoggedIn ? "Account settings" : "Login"
							}
						>
							<IconButton
								onClick={handleOpenUserMenu}
								sx={{ p: 0 }}
							>
								<Avatar
									alt={
										auth.isLoggedIn
											? extractEmailPrefix(auth.userEmail)
											: "Guest"
									}
									src="/static/images/avatar/2.jpg"
									sx={{
										bgcolor: auth.isLoggedIn
											? "#4caf50"
											: "#9e9e9e",
										border: "2px solid white",
									}}
								>
									{auth.isLoggedIn
										? getInitials(auth.userEmail)
										: "G"}
								</Avatar>
							</IconButton>
						</Tooltip>
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
							PaperProps={{
								elevation: 3,
								sx: {
									minWidth: 180,
									borderRadius: 2,
									overflow: "visible",
									mt: 1.5,
								},
							}}
						>
							{auth.isLoggedIn && (
								<Box sx={{ px: 2, py: 1 }}>
									<Typography
										variant="subtitle2"
										color="text.secondary"
									>
										Signed in as
									</Typography>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										{auth.userEmail}
									</Typography>
									<Divider sx={{ my: 1 }} />
								</Box>
							)}

							{userMenuItems.map((item) => (
								<MenuItem
									key={item.name}
									onClick={item.action}
									sx={{
										px: 2,
										py: 1,
										borderRadius: 1,
										mx: 1,
										my: 0.5,
									}}
								>
									{item.icon}
									<Typography textAlign="center">
										{item.name}
									</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}

export default Header;
