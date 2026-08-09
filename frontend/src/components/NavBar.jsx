import { Box, Button, HStack, IconButton, Text, VStack, Switch } from "@chakra-ui/react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FaScroll, FaSearch } from "react-icons/fa"
import { LuLogIn, LuLogOut, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu"
import { AUTH_CHANGED_EVENT, clearAuthSession, getStoredUser } from "../utils/AuthStorage"
import {logoutUser} from "../api/services/AuthServices"
import { useLanguage } from "../contexts/LanguageContext.jsx"

const mainItems = [
  { name: "Dictionary", to: "/dictionary", icon: FaSearch },
  { name: "Learning", to: "/learning", icon: FaScroll },
]

export default function NavBar({ isCollapsed, onToggle }) {
  const { language, setLanguage, t } = useLanguage()
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const location = useLocation()
  const navigate = useNavigate()
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
      await logoutUser()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      clearAuthSession()
      navigate("/", { replace: true })
    }
  }

  return (
    <>
      <Box as="nav" position="fixed" inset={{ base: "0 0 auto", lg: "0 auto 0 0" }} w={{ base: "100%", lg: isCollapsed ? "80px" : "248px" }} h={{ base: "72px", lg: "100vh" }} bg="white" borderRightWidth={{ lg: "1px" }} borderBottomWidth={{ base: "1px", lg: 0 }} p={{ base: 4, lg: isCollapsed ? "24px 12px" : "32px 20px" }} zIndex={1000} transition="width 0.2s ease, padding 0.2s ease">
        <HStack justify="space-between" display={{ base: "flex", lg: "none" }} gap={2}>
          <Link to="/" aria-label="JLPT Fighter">
            <Text display={{ base: "none", sm: "block" }} fontSize="22px" fontWeight="700" color="bushido.primary">JLPT Fighter</Text>
            <Text display={{ base: "block", sm: "none" }} fontSize="20px" fontWeight="700" color="bushido.primary">JLPT</Text>
          </Link>
          <HStack gap={0}>
            {mainItems.map((item) => {
              const active = location.pathname.startsWith(item.to)
              const Icon = item.icon
              return <IconButton key={item.name} asChild size="sm" variant="ghost" color={active ? "bushido.primary" : "bushido.muted"} aria-label={t(item.name)}><Link to={item.to}><Icon /></Link></IconButton>
            })}
            <Switch.Root ml={1} size="sm" checked={language === "vi"} onCheckedChange={({ checked }) => setLanguage(checked ? "vi" : "eng")} colorPalette="green" aria-label={t("Change language")}>
              <Switch.HiddenInput />
              <Switch.Control><Switch.Thumb /></Switch.Control>
              <Switch.Label fontSize="10px" fontFamily="mono" color="bushido.muted">{language === "vi" ? "VI" : "EN"}</Switch.Label>
            </Switch.Root>
            {currentUser ? (
              <IconButton asChild ml={1} size="sm" variant="ghost" aria-label={t("Account")}>
                <Link to="/me"><Box boxSize="28px" borderRadius="full" bg="bushido.primary" color="white" display="grid" placeItems="center" fontSize="12px" fontWeight="700">{initial}</Box></Link>
              </IconButton>
            ) : (
              <IconButton asChild ml={1} size="sm" variant="ghost" color="bushido.primary" aria-label={t("Log in")}><Link to="/login"><LuLogIn /></Link></IconButton>
            )}
          </HStack>
        </HStack>

        <VStack align="stretch" h="100%" display={{ base: "none", lg: "flex" }} gap={8}>
          <HStack justify={isCollapsed ? "center" : "space-between"}>
            <Link to="/" aria-label="JLPT Fighter">
              {!isCollapsed && <Text fontSize="24px" fontWeight="700" color="bushido.primary">JLPT Fighter</Text>}
            </Link>
            {!isCollapsed && <IconButton size="sm" variant="ghost" aria-label={t("Collapse navigation")} onClick={onToggle}><LuPanelLeftClose /></IconButton>}
          </HStack>

          {isCollapsed && <IconButton alignSelf="center" size="sm" variant="ghost" aria-label={t("Expand navigation")} onClick={onToggle}><LuPanelLeftOpen /></IconButton>}

          <VStack align="stretch" gap={1} flex="1">
            {mainItems.map((item) => {
              const active = location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link key={item.name} to={item.to} aria-label={t(item.name)} title={isCollapsed ? t(item.name) : undefined}>
                  <HStack justify={isCollapsed ? "center" : "flex-start"} p="11px 14px" borderRadius="4px" fontWeight="500" color={active ? "bushido.primary" : "bushido.muted"} bg={active ? "bushido.secondarySoft" : "transparent"} _hover={{ bg: "bushido.surfaceLow", color: "bushido.primary" }}>
                    <Icon />
                    {!isCollapsed && <Text>{t(item.name)}</Text>}
                  </HStack>
                </Link>
              )
            })}
          </VStack>
          <Switch.Root flexWrap="wrap" alignSelf="center" justifySelf="end" checked={language === "vi"}  onCheckedChange={({ checked }) => setLanguage(checked ? "vi" : "eng")} colorPalette="green">
            <Switch.HiddenInput />
            <Switch.Control><Switch.Thumb /></Switch.Control>
            {!isCollapsed && <Switch.Label >{language === "vi" ? "VI" : "ENG"}</Switch.Label>}
          </Switch.Root>
          {currentUser ? (
            <VStack gap={2} pt={5} borderTopWidth="1px">
              <Link to="/me" title={isCollapsed ? currentUser.name || currentUser.email : undefined}>
                <HStack justify="center"><Box boxSize="32px" borderRadius="full" bg="bushido.primary" color="white" display="grid" placeItems="center" fontWeight="700">{initial}</Box>{!isCollapsed && <Text maxW="110px" truncate>{currentUser.name || currentUser.email}</Text>}</HStack>
              </Link>
              {isCollapsed ? <IconButton size="sm" variant="ghost" color="bushido.primary" aria-label={t("Logout")} onClick={handleLogout}><LuLogOut /></IconButton> : <Button size="xs" variant="ghost" color="bushido.primary" onClick={handleLogout}>{t("Logout")}</Button>}
            </VStack>
          ) : isCollapsed ? (
            <IconButton asChild alignSelf="center" variant="ghost" color="bushido.primary" aria-label={t("Log in")}><Link to="/login"><LuLogIn /></Link></IconButton>
          ) : (
            <HStack pt={5} borderTopWidth="1px"><Button asChild size="sm" variant="ghost"><Link to="/login">{t("Log in")}</Link></Button><Button asChild size="sm" bg="bushido.primary" color="white"><Link to="/register">{t("Register")}</Link></Button></HStack>
          )}
        </VStack>
      </Box>
    </>
  )
}
