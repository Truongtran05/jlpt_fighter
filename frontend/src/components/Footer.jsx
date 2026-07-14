import { Box, Text } from "@chakra-ui/react"
export default function Footer() {
  return <Box as="footer" ml={{ base: 0, lg: "248px" }} py={5} bg="bushido.surfaceHigh" color="bushido.muted" textAlign="center" borderTopWidth="1px"><Text fontSize="12px">&copy; {new Date().getFullYear()} JLPT Fighter. Study with discipline.</Text></Box>
}
