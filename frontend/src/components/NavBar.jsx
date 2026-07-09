import { Button, HStack, Box, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import {
  AUTH_CHANGED_EVENT,
  clearAuthSession,
  getStoredUser,
} from "../utils/AuthStorage";

//reusable navigation bar component that is used across the app
export default function NavBar({navItems}) {
    const [visible, setVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [currentUser, setCurrentUser] = useState(() => getStoredUser());
    const searchablePaths = new Set([ '/', '/grammar', '/kanji', '/vocab']);
    const location = window.location.pathname;

    // Auto hidden when scrolling down
    useEffect(() => {
      const handleScroll = () => {
        const currentScrollPos = window.scrollY;
        if (currentScrollPos < 10) setVisible(true);
        else if (currentScrollPos < prevScrollPos && prevScrollPos - currentScrollPos > 70) setVisible(true);
        else setVisible(false);
        setPrevScrollPos(currentScrollPos);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [prevScrollPos]);

    useEffect(() => {
      const syncCurrentUser = () => setCurrentUser(getStoredUser());

      window.addEventListener(AUTH_CHANGED_EVENT, syncCurrentUser);
      window.addEventListener("storage", syncCurrentUser);
      return () => {
        window.removeEventListener(AUTH_CHANGED_EVENT, syncCurrentUser);
        window.removeEventListener("storage", syncCurrentUser);
      };
    }, []);

    const visibleNavItems = navItems?.filter((item) => {
      if (currentUser) return item.name !== "Login" && item.name !== "Register";
      return true;
    });

    const accountInitial = currentUser?.name?.trim()?.[0]?.toUpperCase()
      || currentUser?.email?.trim()?.[0]?.toUpperCase()
      || "?";
  
  // Main component
  return ( 
    <Box
        position="fixed"
        top={0}
        left={0}
        width="100%"
        height="60px"
        backgroundColor="gray.800"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingX={6}
        boxSizing="border-box"
        zIndex={1000}
        opacity ={visible ? 1 : 0}
        transition="opacity 0.3s"
    >
      <Link to="/">JLPT Fighter</Link>
      {searchablePaths.has(location) && <SearchBar/>}
      <HStack gap={4}>
        {visibleNavItems && visibleNavItems.map((item, index) => (
          <Link key={index} to={item.to}>
            {item.name}
          </Link>
        ))}
        {currentUser && (
          <Link to="/me">
          <HStack gap={2} marginLeft={2}>
            <Box
              width="32px"
              height="32px"
              borderRadius="50%"
              backgroundColor="green.500"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              title={currentUser.email}
            >
              {accountInitial}
            </Box>
            <Text maxWidth="120px" truncate title={currentUser.email}>
              {currentUser.name || currentUser.email}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              onClick={clearAuthSession}
            >
              Logout
            </Button>
          </HStack>
          </Link>
        )}
      </HStack>
    </Box>
  )
}
