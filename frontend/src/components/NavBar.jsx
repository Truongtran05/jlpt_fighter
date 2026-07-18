import { Box, Button, HStack, IconButton, Text, VStack } from "@chakra-ui/react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FaScroll, FaSearch } from "react-icons/fa"
import { LuLogIn, LuLogOut, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu"
import SearchBar from "./SearchBar"
import { AUTH_CHANGED_EVENT, clearAuthSession, getStoredUser } from "../utils/AuthStorage"
import ApiClient from "../api/ApiClient"

const mainItems = [
  { name: "Explore", to: "/explore", icon: FaSearch },
  { name: "Learning", to: "/learning", icon: FaScroll },
]

export default function NavBar({ isCollapsed, onToggle }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const location = useLocation()
  const navigate = useNavigate()
  const isExplore = ["/explore", "/grammar", "/kanji", "/vocab"].some((path) => location.pathname.startsWith(path))
  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || currentUser?.email?.trim()?.[0]?.toUpperCase() || "?"
  useEffect(() => {
    const sync = () => setCurrentUser(getStoredUser())
    window.addEventListener(AUTH_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await ApiClient.post("/logout/")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      clearAuthSession()
      navigate("/explore", { replace: true })
    }
  }

  return (
    <>
      <Box as="nav" position="fixed" inset={{ base: "0 0 auto", lg: "0 auto 0 0" }} w={{ base: "100%", lg: isCollapsed ? "80px" : "248px" }} h={{ base: "72px", lg: "100vh" }} bg="white" borderRightWidth={{ lg: "1px" }} borderBottomWidth={{ base: "1px", lg: 0 }} p={{ base: 4, lg: isCollapsed ? "24px 12px" : "32px 20px" }} zIndex={1000} transition="width 0.2s ease, padding 0.2s ease">
        <HStack justify="space-between" display={{ base: "flex", lg: "none" }}>
          <Link to="/explore"><Text fontSize="22px" fontWeight="700" color="bushido.primary">JLPT Fighter</Text></Link>
          <HStack gap={1}>
            {mainItems.map((item) => {
              const active = item.to === "/explore" ? isExplore : location.pathname.startsWith(item.to)
              const Icon = item.icon
              return <IconButton key={item.name} asChild variant="ghost" color={active ? "bushido.primary" : "bushido.muted"} aria-label={item.name}><Link to={item.to}><Icon /></Link></IconButton>
            })}
          </HStack>
        </HStack>

        <VStack align="stretch" h="100%" display={{ base: "none", lg: "flex" }} gap={8}>
          <HStack justify={isCollapsed ? "center" : "space-between"}>
            <Link to="/explore" aria-label="JLPT Fighter">
              {!isCollapsed && <Text fontSize="24px" fontWeight="700" color="bushido.primary">JLPT Fighter</Text>}
            </Link>
            {!isCollapsed && <IconButton size="sm" variant="ghost" aria-label="Collapse navigation" onClick={onToggle}><LuPanelLeftClose /></IconButton>}
          </HStack>

          {isCollapsed && <IconButton alignSelf="center" size="sm" variant="ghost" aria-label="Expand navigation" onClick={onToggle}><LuPanelLeftOpen /></IconButton>}

          <VStack align="stretch" gap={1} flex="1">
            {mainItems.map((item) => {
              const active = item.to === "/explore" ? isExplore : location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link key={item.name} to={item.to} aria-label={item.name} title={isCollapsed ? item.name : undefined}>
                  <HStack justify={isCollapsed ? "center" : "flex-start"} p="11px 14px" borderRadius="8px" fontWeight="500" color={active ? "bushido.primary" : "bushido.muted"} bg={active ? "bushido.secondarySoft" : "transparent"} _hover={{ bg: "bushido.surfaceLow", color: "bushido.primary" }}>
                    <Icon />
                    {!isCollapsed && <Text>{item.name}</Text>}
                  </HStack>
                </Link>
              )
            })}
          </VStack>

          {currentUser ? (
            <VStack gap={2} pt={5} borderTopWidth="1px">
              <Link to="/me" title={isCollapsed ? currentUser.name || currentUser.email : undefined}>
                <HStack justify="center"><Box boxSize="32px" borderRadius="full" bg="bushido.primary" color="white" display="grid" placeItems="center" fontWeight="700">{initial}</Box>{!isCollapsed && <Text maxW="110px" truncate>{currentUser.name || currentUser.email}</Text>}</HStack>
              </Link>
              {isCollapsed ? <IconButton size="sm" variant="ghost" color="bushido.primary" aria-label="Logout" onClick={handleLogout}><LuLogOut /></IconButton> : <Button size="xs" variant="ghost" color="bushido.primary" onClick={handleLogout}>Logout</Button>}
            </VStack>
          ) : isCollapsed ? (
            <IconButton asChild alignSelf="center" variant="ghost" color="bushido.primary" aria-label="Log in"><Link to="/login"><LuLogIn /></Link></IconButton>
          ) : (
            <HStack pt={5} borderTopWidth="1px"><Button asChild size="sm" variant="ghost"><Link to="/login">Log in</Link></Button><Button asChild size="sm" bg="bushido.primary" color="white"><Link to="/register">Register</Link></Button></HStack>
          )}
        </VStack>
      </Box>

      {isExplore && (
        <>
          <Box position="fixed" top={0} left={{ base: 0, lg: isCollapsed ? "80px" : "248px" }} right={0} mt={{ base: "72px", lg: 0 }} px={{ base: 4, md: 6 }} py={3} bg="white" borderBottomWidth="1px" zIndex={900} transition="left 0.2s ease"><SearchBar /></Box>
          <Box h="72px" aria-hidden="true" />
        </>
      )}
    </>
  )
}
