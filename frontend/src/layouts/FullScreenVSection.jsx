import { VStack } from "@chakra-ui/react"

export default function FullScreenVSection({ children, ...props }) {
  return (
    <VStack bg={props.backgroundColor || "bushido.surface"} color="bushido.ink">
      <VStack maxW="1280px" w="100%" minH="100vh" align="stretch" p={{ base: "32px 16px", md: "48px 40px" }} {...props}>{children}</VStack>
    </VStack>
  )
}
