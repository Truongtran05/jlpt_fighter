import FullScreenVSection from "../layouts/FullScreenVSection"
import { VStack, Heading, Text } from "@chakra-ui/react"
export default function HomePage() {
  return (
    <FullScreenVSection
      backgroundColor="#14532d"
      isDarkBackground={true}
    >
      <VStack spacing={4} align="center" width="100%" paddingX={6} paddingTop="80px">
        {/* Hero section with a welcome message and a brief description of the app */}
        <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          Welcome to JLPT Fighter!
        </Heading>
        <Text fontSize="xl" textAlign="center" position="absolute" top="60%" left="50%" transform="translate(-50%, -50%)">
          Your ultimate tool for mastering Japanese language and JLPT exam preparation.
        </Text>
      </VStack>
    </FullScreenVSection>
  )
}