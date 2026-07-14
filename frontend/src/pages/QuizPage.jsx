import FullScreenSection from "../layouts/FullScreenVSection"
import { VStack, Heading } from "@chakra-ui/react"

export default function QuizPage() {
  return (
    <FullScreenSection
      backgroundColor="bushido.surface"
      isDarkBackground={true}
    >
      <VStack spacing={4} align="center">
        <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          Quiz Page
        </Heading>
      </VStack>
    </FullScreenSection>
  )
}
