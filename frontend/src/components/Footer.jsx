import { Box, Text } from "@chakra-ui/react"
export default function Footer({ sidebarWidth = "248px" }) {
  return <Box as="footer" ml={{ base: 0, lg: sidebarWidth }} py={5} bg="bushido.surfaceHigh" color="bushido.muted" textAlign="center" borderTopWidth="1px" transition="margin-left 0.2s ease"><Text fontSize="12px">&copy; {new Date().getFullYear()} JLPT Fighter. Study with discipline.</Text></Box>
}
