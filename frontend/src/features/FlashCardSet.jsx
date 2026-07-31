import { Box, HStack, Text } from "@chakra-ui/react"

export default function FlashCardSet({ flashCardSet, onClick }) {
  const total = flashCardSet.total_flash_cards ?? 0
  const remembered = flashCardSet.total_remembered_flash_cards ?? 0
  const forgotten = flashCardSet.total_forgotten_flash_cards ?? 0

  return (
    <Box as="button" type="button" onClick={() => onClick(flashCardSet)} cursor="pointer" textAlign="left" h="100%" w="100%" p="16px 24px" borderWidth="1px" borderRadius="4px" bg="white" color="bushido.ink" transition="all .2s" _hover={{ borderColor: "bushido.primary", bg: "bushido.surfaceLow", transform: "translate(2px, -2px)" }}>
      <Text fontSize="16px" fontWeight="600">{flashCardSet.name}</Text>
      <Text fontSize="14px" color="bushido.muted" mt={1}>{flashCardSet.description}</Text>
      {total > 0 ? (
        <Box mt={4} fontFamily="mono" fontSize="12px">
          <HStack justify="space-between"><Text>All</Text><Text>{total}</Text></HStack>
          <Box h="6px" mt={1} overflow="hidden" bg="bushido.surfaceContainerHigh" borderRadius="full" role="progressbar" aria-label="All flashcards" aria-valuemin={0} aria-valuemax={Math.max(total, 1)} aria-valuenow={total}>
            <Box h="100%" w={`${(total / Math.max(total, 1)) * 100}%`} bg="bushido.ink" />
          </Box>
          <HStack justify="space-between" mt={2} color="bushido.primary"><Text>Remembered</Text><Text>{remembered}</Text></HStack>
        <Box h="6px" mt={1} overflow="hidden" bg="bushido.surfaceContainerHigh" borderRadius="full" role="progressbar" aria-label="Remembered flashcards" aria-valuemin={0} aria-valuemax={Math.max(total, 1)} aria-valuenow={remembered}>
          <Box h="100%" w={`${(remembered / Math.max(total, 1)) * 100}%`} bg="bushido.primary" />
        </Box>
        <HStack justify="space-between" mt={2} color="bushido.tertiary"><Text>Forgotten</Text><Text>{forgotten}</Text></HStack>
        <Box h="6px" mt={1} overflow="hidden" bg="bushido.surfaceContainerHigh" borderRadius="full" role="progressbar" aria-label="Forgotten flashcards" aria-valuemin={0} aria-valuemax={Math.max(total, 1)} aria-valuenow={forgotten}>
          <Box h="100%" w={`${(forgotten / Math.max(total, 1)) * 100}%`} bg="bushido.tertiary" />
        </Box>
      </Box>) : (
        <Text mt={4} fontSize="12px" color="bushido.muted">No flashcards in this set yet.</Text>
      )}
      <Text color="bushido.primary" fontFamily="mono" fontSize="12px" fontWeight="500" letterSpacing="0.05em" mt={3}>Open set →</Text>
    </Box>
  )
}
