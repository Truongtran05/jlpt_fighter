import { Box, Text } from "@chakra-ui/react"

export default function FlashCardSet({ flashCardSet, onClick }) {
  return (
    <Box as="button" type="button" onClick={() => onClick(flashCardSet)} cursor="pointer" textAlign="left" w="100%" p="16px 24px" borderWidth="1px" borderRadius="4px" bg="white" color="bushido.ink" transition="all .2s" _hover={{ borderColor: "bushido.primary", bg: "bushido.surfaceLow", transform: "translate(2px, -2px)" }}>
      <Text fontSize="16px" fontWeight="600">{flashCardSet.name}</Text>
      <Text fontSize="14px" color="bushido.muted" mt={1}>{flashCardSet.description}</Text>
      <Text color="bushido.primary" fontFamily="mono" fontSize="12px" fontWeight="500" letterSpacing="0.05em" mt={3}>Open set →</Text>
    </Box>
  )
}
