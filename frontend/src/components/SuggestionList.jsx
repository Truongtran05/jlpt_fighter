import { Box, Text, VStack } from "@chakra-ui/react"

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

export default function SuggestionList({
  open,
  suggestions = [],
  type,
  onSelect,
  right = 0,
  top = "calc(100% + 4px)",
  maxHeight = "240px",
}) {
  const items = suggestions.flatMap((suggestion) => {
    const meanings = asList(suggestion.meaning)
    if ((type && suggestion.type !== type) || meanings.length === 0) return []
    return asList(suggestion.text).map((text) => ({ suggestion, text, meanings }))
  })

  if (!open || items.length === 0) return null

  return (
    <VStack
      align="stretch"
      gap={0}
      position="absolute"
      top={top}
      left={0}
      right={right}
      overflowY="auto"
      maxHeight={maxHeight}
      backgroundColor="white"
      borderWidth="1px"
      borderRadius="4px"
      zIndex={1000}
    >
      {items.map(({ suggestion, text, meanings }) => (
        <Box
          as="button"
          type="button"
          key={`${suggestion.type}-${suggestion.id}-${text}`}
          onClick={() => onSelect(suggestion, text)}
          padding="8px"
          textAlign="left"
          cursor="pointer"
          _hover={{ backgroundColor: "bushido.surfaceLow" }}
          _focusVisible={{ backgroundColor: "bushido.surfaceLow", outlineColor: "bushido.primary" }}
        >
          <Text color="bushido.ink">{text}</Text>
          <Text color="bushido.muted" fontSize="sm">
            {meanings.join(", ").substring(0, 90).concat("...")}
          </Text>
        </Box>
      ))}
    </VStack>
  )
}
