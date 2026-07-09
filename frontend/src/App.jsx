import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import {HomeScreenNavItems} from "./utils/HomeScreenNavItems.js"

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
