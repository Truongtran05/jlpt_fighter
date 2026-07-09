import {HStack, VStack, Box, Input, Text, Button} from "@chakra-ui/react";
import {useState, useEffect} from "react";
import {Link, useLocation} from "react-router-dom";
import {getStoredUser} from "../utils/AuthStorage.js";

export default function SideBar({navItems}) {
    const [currentUser, setCurrentUser] = useState(() => getStoredUser());

    return(
        <Box
            position="fixed"
            top="60px"
            left={0}
            width="250px"
            height="calc(100% - 60px)"
            backgroundColor="gray.800"
            padding="1rem"
        >
            <VStack
                spacing="1rem"
                align="stretch"
            >
                {navItems?.map((item) => (
                    <Link key={item.path} to={item.path}>
                        {item.name}
                    </Link>
                ))}
            </VStack>
        </Box>
    )
}