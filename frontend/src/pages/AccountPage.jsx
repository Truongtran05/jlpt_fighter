import FullScreenSection from "../layouts/FullScreenSection.jsx"
import { Box, Heading } from "@chakra-ui/react"
export default function AccountPage() {
  return (
    <FullScreenSection >
        <Box
          width="100%"
          maxWidth="420px"
        >
          <Heading as="h1" size="lg" mb={6}>
            My Account
          </Heading>
          {/* Add account details and settings here */}
        </Box>
    </FullScreenSection>
  )
}