import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react"
import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import SearchBar from "./SearchBar"
import { AUTH_CHANGED_EVENT, clearAuthSession, getStoredUser } from "../utils/AuthStorage"

export default function NavBar({ navItems }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const location = useLocation()
  const searchable = ['/', '/grammar', '/kanji', '/vocab'].includes(location.pathname)
  useEffect(() => {
    const sync = () => setCurrentUser(getStoredUser())
    window.addEventListener(AUTH_CHANGED_EVENT, sync); window.addEventListener('storage', sync)
    return () => { window.removeEventListener(AUTH_CHANGED_EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])
  const items = navItems?.filter((item) => currentUser ? !['Login', 'Register'].includes(item.name) : true)
  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || currentUser?.email?.trim()?.[0]?.toUpperCase() || '?'
  return (
    <Box as="nav" position="fixed" inset={{ base: "0 0 auto", lg: "0 auto 0 0" }} w={{ base: "100%", lg: "248px" }} h={{ base: "72px", lg: "100vh" }} bg="white" borderRightWidth={{ lg: "1px" }} borderBottomWidth={{ base: "1px", lg: 0 }} p={{ base: 4, lg: "32px 20px" }} zIndex={1000}>
      <HStack justify="space-between" display={{ base: "flex", lg: "none" }}><Link to="/"><Text fontSize="22px" fontWeight="700" color="bushido.primary">JLPT Fighter</Text></Link>{searchable && <SearchBar compact />}</HStack>
      <VStack align="stretch" h="100%" display={{ base: "none", lg: "flex" }} gap={8}>
        <Link to="/"><Text fontSize="24px" fontWeight="700" color="bushido.primary">JLPT Fighter</Text><Text fontSize="12px" color="bushido.muted">Bushido Academic</Text></Link>
        {searchable && <SearchBar />}
        <VStack align="stretch" gap={1} flex="1">{items?.map((item) => { const to = item.to || item.path; return <Link key={item.name} to={to}><Box p="11px 14px" borderRadius="8px" fontWeight="500" color={to === location.pathname ? "bushido.primary" : "bushido.muted"} bg={to === location.pathname ? "bushido.secondarySoft" : "transparent"} _hover={{ bg: "bushido.surfaceLow", color: "bushido.primary" }}>{item.name}</Box></Link> })}</VStack>
        {currentUser && <HStack gap={3} pt={5} borderTopWidth="1px"><Box boxSize="32px" borderRadius="full" bg="bushido.primary" color="white" display="grid" placeItems="center" fontWeight="700">{initial}</Box><Link to="/me"><Text maxW="95px" truncate>{currentUser.name || currentUser.email}</Text></Link><Button size="xs" variant="ghost" color="bushido.primary" onClick={clearAuthSession}>Logout</Button></HStack>}
      </VStack>
    </Box>
  )
}
