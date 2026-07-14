import { BrowserRouter } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import AppRoutes from './routes/AppRoutes.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import { HomeScreenNavItems } from './utils/HomeScreenNavItems.js'

export default function App() {
  return (
    <Box minH="100vh" bg="bushido.surface" color="bushido.ink">
      <BrowserRouter>
        <NavBar navItems={HomeScreenNavItems} />
        <Box as="main" ml={{ base: 0, lg: "248px" }} pt={{ base: "72px", lg: 0 }}><AppRoutes /></Box>
      </BrowserRouter>
      <Footer />
    </Box>
  )
}
