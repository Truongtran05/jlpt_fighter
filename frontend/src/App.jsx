import { BrowserRouter } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import AppRoutes from './routes/AppRoutes.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import { Toaster } from './components/ui/toaster.jsx'

export default function App() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const sidebarWidth = isNavCollapsed ? "80px" : "248px"

  return (
    <Box minH="100vh" bg="bushido.surface" color="bushido.ink">
      <BrowserRouter>
        <NavBar isCollapsed={isNavCollapsed} onToggle={() => setIsNavCollapsed((value) => !value)} />
        <Box as="main" ml={{ base: 0, lg: sidebarWidth }} pt={{ base: "72px", lg: 0 }} transition="margin-left 0.2s ease"><AppRoutes /></Box>
        <Footer sidebarWidth={sidebarWidth} />
        <Toaster />
      </BrowserRouter>
    </Box>
  )
}
