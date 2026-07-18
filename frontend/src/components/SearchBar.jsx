import { Box, Button, HStack, Input, Text, VStack } from "@chakra-ui/react"
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import useSuggestions from "../hooks/UseSuggestions.jsx"

const modes = ["vocab", "grammar", "kanji"]

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const suggestions = useSuggestions(searchQuery)
  const routeMode = location.pathname.split("/").filter(Boolean)[0]
  const mode = modes.includes(routeMode) ? routeMode : "vocab"

  const handleChange = (event) => {
    const value = event.target.value
    setSearchQuery(value)
    setIsSuggestionsOpen(Boolean(value.trim()))
  }

  const handleSearch = (value = searchQuery) => {
    const query = value.trim()
    if (query) navigate(`/${mode}/${encodeURIComponent(query)}`)
  }

  return (
    <HStack gap={2} align="center" position="relative" width="100%" maxW="900px" mx="auto">
      <HStack gap={1}>
        {modes.map((item) => <Button key={item} size="sm" variant="ghost" bg={mode === item ? "bushido.secondarySoft" : "transparent"} color={mode === item ? "bushido.primary" : "bushido.muted"} onClick={() => navigate(`/${item}`)} textTransform="capitalize">{item}</Button>)}
      </HStack>
      <Input type="search" aria-label={`Search ${mode}`} placeholder={`Search ${mode}...`} value={searchQuery} onChange={handleChange} onKeyDown={(event) => event.key === "Enter" && handleSearch()} color="bushido.ink" backgroundColor="white" />
      <Button type="button" bg="bushido.primary" color="white" onClick={() => handleSearch()}>Search</Button>

      {isSuggestionsOpen && suggestions.length > 0 && (
        <VStack align="stretch" gap={0} position="absolute" top="100%" left={{ base: 0, md: "230px" }} right="84px" overflowY="auto" maxHeight="240px" backgroundColor="white" borderWidth="1px" borderRadius="8px" zIndex={1000}>
          {suggestions.filter((suggestion) => suggestion.type === mode).map((suggestion) => (
            <Box key={`${suggestion.type}-${suggestion.id}-${suggestion.text}`} onClick={() => { setSearchQuery(suggestion.text); setIsSuggestionsOpen(false); handleSearch(suggestion.text) }} padding="8px" cursor="pointer" _hover={{ backgroundColor: "bushido.surfaceLow" }}>
              <Text color="bushido.ink">{suggestion.text}</Text>
              <Text color="bushido.muted" fontSize="sm">{(suggestion.meaning ?? []).join(", ")}</Text>
            </Box>
          ))}
        </VStack>
      )}
    </HStack>
  )
}
