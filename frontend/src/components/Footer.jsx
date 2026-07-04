import {Box, Text} from "@chakra-ui/react";
export default function Footer() {
  return (
    <Box as="footer" py={4} backgroundColor="gray.800" color="white" textAlign="center">
      <Text>&copy; {new Date().getFullYear()} JLPT Fighter. All rights reserved.</Text>
    </Box>
  )
}