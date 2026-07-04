import FullScreenSection from "../layouts/FullScreenSection"
import { VStack, Heading } from "@chakra-ui/react"

export default function QuizPage() {
  return (
    <FullScreenSection
      backgroundColor="#14532d"
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