import { Box, Button, Grid, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import SearchBar from "../components/SearchBar.jsx"
import Grammar from "../features/Grammar.jsx"
import Kanji from "../features/Kanji.jsx"
import Vocabulary from "../features/Vocabulary.jsx"
import useSearch from "../hooks/UseSearch.jsx"
import FullScreenVSection from "../layouts/FullScreenVSection.jsx"
import { normalizeSearchText } from "../utils/UtilFunctions.js"
import { useLanguage } from "../contexts/LanguageContext.jsx"
import { getRelatedKanji, getRelatedVocab } from "../api/services/DictionaryServices.js"

function resultSummary(entry, type) {
  if (type === "kanji") return {
    title: entry.kanji,
    meta: [...(entry.onyomi ?? []), ...(entry.kunyomi ?? [])].join(", "),
    meaning: (entry.meaning ?? []).join(", "),
    level: entry.jlptLevel,
  }
  if (type === "grammar") return {
    title: entry.grammar,
    meta: entry.formation,
    meaning: (entry.meaning ?? []).join(", "),
    level: entry.jlpt_level,
  }
  return {
    title: entry.kanji?.[0] ?? entry.kana?.[0] ?? "—",
    meta: (entry.kana ?? []).join(", "),
    meaning: (entry.meaning ?? entry.senses?.flatMap((sense) => sense.meanings) ?? []).join(", "),
  }
}

export default function DictionaryPage() {
  const { language, t } = useLanguage()
  const [searchState, setSearchState] = useState({ type: "vocab", query: "", submittedQuery: "", page: 1, selectedId: null, showDetail: false })
  const [relatedResponse, setRelatedResponse] = useState(null)
  const normalizedQuery = normalizeSearchText(searchState.submittedQuery)
  const [response, isLoading, search, error] = useSearch({ type: searchState.type, page: searchState.page, pageSize: 10 })

  useEffect(() => {
    if (normalizedQuery) search(normalizedQuery)
  }, [normalizedQuery, search])

  const isCurrentResponse = response?.searchType === searchState.type && response.searchQuery === normalizedQuery && response.searchPage === searchState.page
  const results = isCurrentResponse ? response.results ?? [] : []
  const selectedEntry = results.find((entry) => entry.id === searchState.selectedId) ?? results[0] ?? null
  const relatedQuery = selectedEntry
    ? searchState.type === "kanji"
      ? selectedEntry.kanji
      : searchState.type === "grammar"
        ? selectedEntry.grammar
        : (selectedEntry.kanji ?? []).join("")
    : ""
  const relatedKey = selectedEntry ? `${searchState.type}:${selectedEntry.id}:${language}:${relatedQuery}` : ""

  useEffect(() => {
    if (!relatedKey) return
    let cancelled = false
    const request = searchState.type === "kanji" ? getRelatedVocab : getRelatedKanji
    request({ q: relatedQuery, lang: language })
      .then(({ data }) => {
        if (!cancelled) setRelatedResponse({ key: relatedKey, results: data.results ?? [], error: false })
      })
      .catch(() => {
        if (!cancelled) setRelatedResponse({ key: relatedKey, results: [], error: true })
      })
    return () => { cancelled = true }
  }, [language, relatedKey, relatedQuery, searchState.type])

  const relatedIsLoading = Boolean(relatedKey) && relatedResponse?.key !== relatedKey
  const relatedResults = relatedResponse?.key === relatedKey ? relatedResponse.results : []
  const setPage = (page) => setSearchState((state) => ({ ...state, page, selectedId: null, showDetail: false }))
  const selectEntry = (id) => setSearchState((state) => ({ ...state, selectedId: id, showDetail: true }))

  return (
    <FullScreenVSection backgroundColor="bushido.surface" gap={6} align="stretch" width="100%" paddingX={{ base: 4, md: 6 }} paddingTop={6}>
      <Box bg="white" borderWidth="1px" borderColor="bushido.outlineVariant" borderRadius="8px" p={{ base: 4, md: 6 }}>
        <SearchBar searchState={searchState} setSearchState={setSearchState} />
      </Box>

      {error && normalizedQuery ? (
        <Heading as="h1" size="2xl" textAlign="center">{t(`Error occurred while searching for ${searchState.type === "vocab" ? "vocabulary" : searchState.type}.`)}</Heading>
      ) : isLoading || (normalizedQuery && !isCurrentResponse) ? (
        <Heading as="h1" size="2xl" textAlign="center">{t("Loading...")}</Heading>
      ) : !normalizedQuery ? (
        <Heading as="h1" size="2xl" textAlign="center">{t("Dictionary Page")}</Heading>
      ) : results.length === 0 ? (
        <Heading as="h1" size="2xl" textAlign="center">{t("No dictionary entries found for")} “{searchState.submittedQuery}”.</Heading>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "minmax(280px, 4fr) minmax(0, 8fr)" }} gap={6} alignItems="start">
          <VStack display={{ base: searchState.showDetail ? "none" : "flex", md: "flex" }} align="stretch" gap={0} bg="bushido.surfaceLow" borderWidth="1px" borderColor="bushido.outlineVariant" borderRadius="8px" overflow="hidden" maxH={{ md: "calc(100vh - 250px)" }}>
            <HStack justify="space-between" p={4} borderBottomWidth="1px">
              <Text fontFamily="mono" fontSize="12px" color="bushido.muted" textTransform="uppercase">{t("Search results")} ({response.count})</Text>
            </HStack>
            <VStack align="stretch" gap={2} p={2} overflowY={{ md: "auto" }}>
              {results.map((entry) => {
                const summary = resultSummary(entry, searchState.type)
                const selected = entry.id === selectedEntry.id
                return (
                  <Box key={entry.id} as="button" type="button" textAlign="left" p={4} bg="white" color="bushido.ink" borderWidth={selected ? "3px" : "1px"} borderColor={selected ? "bushido.primary" : "bushido.outlineVariant"} borderRadius="4px" transform={selected ? "translate(4px, -4px)" : "none"} transition="all 0.2s ease" cursor="pointer" aria-pressed={selected} onClick={() => selectEntry(entry.id)} _hover={{ borderColor: "bushido.primary" }}>
                    <HStack justify="space-between" align="start" gap={3}>
                      <Box minW={0}>
                        <Heading as="h2" fontFamily="body" fontSize={searchState.type === "kanji" ? "36px" : "20px"} lineHeight="1.25" color={selected ? "bushido.primary" : "bushido.ink"}>{summary.title}</Heading>
                        {summary.meta && <Text mt={1} fontFamily="mono" fontSize="12px" color="bushido.muted" truncate>{summary.meta}</Text>}
                      </Box>
                      {summary.level > 0 && <Text flexShrink={0} bg="bushido.primaryHover" color="white" fontFamily="mono" fontSize="10px" px={2} py={0.5} borderRadius="4px">N{summary.level}</Text>}
                    </HStack>
                    {summary.meaning && <Text mt={2} fontSize="14px" color="bushido.muted" lineClamp="2">{summary.meaning}</Text>}
                  </Box>
                )
              })}
            </VStack>
            <HStack justify="center" gap={3} p={3} borderTopWidth="1px">
              <Button size="sm" variant="ghost" disabled={!response.previous} onClick={() => setPage(response.previous)}>{t("Previous")}</Button>
              <Text fontFamily="mono" fontSize="12px">{searchState.page}/{response.total_pages || 1}</Text>
              <Button size="sm" variant="ghost" disabled={!response.next} onClick={() => setPage(response.next)}>{t("Next")}</Button>
            </HStack>
          </VStack>

          <VStack display={{ base: searchState.showDetail ? "flex" : "none", md: "flex" }} align="stretch" gap={6} bg="white" borderWidth="1px" borderColor="bushido.outlineVariant" borderRadius="8px" p={{ base: 4, md: 6 }} maxH={{ md: "calc(100vh - 250px)" }} overflowY={{ md: "auto" }}>
            <Button display={{ md: "none" }} alignSelf="flex-start" size="sm" variant="ghost" onClick={() => setSearchState((state) => ({ ...state, showDetail: false }))}>← {t("Back to results")}</Button>
            {searchState.type === "grammar" ? (
              <Grammar grammar={selectedEntry.grammar} formation={selectedEntry.formation} meaning={selectedEntry.meaning} jlpt_level={selectedEntry.jlpt_level} examples={selectedEntry.examples ?? []} />
            ) : searchState.type === "kanji" ? (
              <Kanji kanji={selectedEntry.kanji} onyomi={selectedEntry.onyomi} kunyomi={selectedEntry.kunyomi} strokeCount={selectedEntry.strokeCount} jlptLevel={selectedEntry.jlptLevel} meaning={selectedEntry.meaning} />
            ) : (
              <Vocabulary kanji={selectedEntry.kanji} kana={selectedEntry.kana} meaning={selectedEntry.meaning ?? selectedEntry.senses?.flatMap((sense) => sense.meanings) ?? []} />
            )}

            <Box borderTopWidth="1px" pt={5}>
              <Heading as="h3" size="md" mb={3}>{t(searchState.type === "kanji" ? "Related vocabulary" : "Related kanji")}</Heading>
              {relatedIsLoading ? (
                <Text color="bushido.muted">{t("Loading related entries...")}</Text>
              ) : relatedResponse?.key === relatedKey && relatedResponse.error ? (
                <Text color="bushido.error">{t("Unable to load related entries.")}</Text>
              ) : relatedResults.length === 0 ? (
                <Text color="bushido.muted">{t("No related entries found.")}</Text>
              ) : (
                <VStack align="stretch" gap={2}>
                  {relatedResults.map((entry) => (
                    <HStack key={entry.kanji_id ?? entry.vocab_id} justify="space-between" gap={4} bg="bushido.surface" borderLeftWidth="4px" borderLeftColor="bushido.primary" borderRadius="4px" p={4}>
                      <Text fontFamily="body" fontSize="24px" fontWeight="600">{entry.kanji ?? entry.writting}</Text>
                      <Text color="bushido.muted" textAlign="right">{Array.isArray(entry.meaning) ? entry.meaning.join(", ") : entry.meaning}</Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Grid>
      )}
    </FullScreenVSection>
  )
}
