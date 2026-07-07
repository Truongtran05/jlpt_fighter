import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import {HomeScreenNavItems} from "./utils/HomeScreenNavItems.js"
import {VStack} from "@chakra-ui/react"
function App() {
  return (
    <>
      <BrowserRouter>
          <NavBar navItems={HomeScreenNavItems} />
          <AppRoutes/>
      </BrowserRouter>
      <Footer/>
    </>
  )
}

export default App
