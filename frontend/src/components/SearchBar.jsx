import { Button, HStack, Input, VStack } from "@chakra-ui/react"
import { useState } from "react"
import useSuggestions from "../hooks/UseSuggestions.jsx"
import { useLanguage } from "../contexts/LanguageContext.jsx"
import SuggestionList from "./SuggestionList.jsx"

const modes = ["vocab", "grammar", "kanji"]

export default function SearchBar({ searchState, setSearchState }) {
  const { t } = useLanguage()
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const suggestions = useSuggestions(searchState.query)

  const handleChange = (event) => {
    const value = event.target.value
    setSearchState((state) => ({ ...state, query: value }))
    setIsSuggestionsOpen(Boolean(value.trim()))
  }

  const handleSearch = (value = searchState.query) => {
    const query = String(Array.isArray(value) ? value[0] ?? "" : value).trim()
    if (query) setSearchState((state) => ({ ...state, query, submittedQuery: query, page: 1, selectedId: null, showDetail: false }))
    setIsSuggestionsOpen(false)
  }

  return (
    <VStack gap={4} align="stretch" width="100%" maxW="900px" mx="auto">
      <HStack gap={2} align="center" position="relative">
        <Input h="56px" type="search" aria-label={`${t("Search")} ${t(searchState.type)}`} placeholder={`${t("Search")} ${t(searchState.type)}...`} value={searchState.query} onChange={handleChange} onKeyDown={(event) => event.key === "Enter" && handleSearch()} color="bushido.ink" backgroundColor="bushido.surface" borderWidth="2px" borderColor="bushido.outlineVariant" borderRadius="8px" _focusVisible={{ borderColor: "bushido.primary", outlineColor: "bushido.primarySoft" }} />
        <Button h="56px" type="button" bg="bushido.primary" color="white" borderRadius="8px" borderWidth="1px" borderColor="bushido.primary" _hover={{ bg: "bushido.primaryHover", borderWidth: "2px" }} onClick={() => handleSearch()}>{t("Search")}</Button>

        <SuggestionList open={isSuggestionsOpen} suggestions={suggestions} type={searchState.type} top="100%" right="84px" onSelect={(_, text) => handleSearch(text)} />
      </HStack>
      <HStack gap={2} overflowX="auto" pb={1}>
        {modes.map((item) => <Button key={item} size="sm" flexShrink={0} borderRadius="full" px={6} bg={searchState.type === item ? "bushido.primary" : "bushido.surfaceHigh"} color={searchState.type === item ? "white" : "bushido.muted"} onClick={() => setSearchState((state) => ({ ...state, type: item, submittedQuery: state.query.trim(), page: 1, selectedId: null, showDetail: false }))} textTransform="capitalize">{t(item)}</Button>)}
      </HStack>
    </VStack>
  )
}
