import { Box, Button, Dialog, Grid, Heading, HStack, Portal, Text, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SearchBar from "../components/SearchBar.jsx"
import Grammar from "../features/Grammar.jsx"
import Kanji from "../features/Kanji.jsx"
import Vocabulary from "../features/Vocabulary.jsx"
import useSearch from "../hooks/UseSearch.jsx"
import FullScreenVSection from "../layouts/FullScreenVSection.jsx"
import { normalizeSearchText } from "../utils/UtilFunctions.js"
import { useLanguage } from "../contexts/LanguageContext.jsx"
import { getJlptEntries, getRelatedKanji, getRelatedVocab } from "../api/services/DictionaryServices.js"
import { createFlashCard, getFlashCardSets } from "../api/services/LearningServices.js"
import { getStoredUser } from "../utils/AuthStorage.js"
import { toaster } from "../components/ui/toaster.jsx"

const jlptLevels = [5, 4, 3, 2, 1]

function JlptBrowser({ type, onSelect, t }) {
  const [state, setState] = useState({ type: null, data: null, error: false })

  useEffect(() => {
    let cancelled = false
    getJlptEntries(type)
      .then(({ data }) => {
        if (!cancelled) setState({ type, data, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ type, data: null, error: true })
      })
    return () => { cancelled = true }
  }, [type])

  if (state.type !== type) {
    return <Heading as="h1" size="2xl" textAlign="center">{t("Loading...")}</Heading>
  }
  if (state.error) {
    return <Heading as="h1" size="lg" textAlign="center">{t("Unable to load JLPT entries.")}</Heading>
  }

  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading as="h1" fontFamily="heading" fontSize={{ base: "24px", md: "32px" }}>{t("Browse by JLPT level")}</Heading>
        <Text mt={1} color="bushido.muted">{t("Select an entry to open its dictionary details.")}</Text>
      </Box>
      {jlptLevels.map((level) => {
        const entries = [...new Set(state.data?.[`N${level}`] ?? [])]
        return (
          <Box key={level} as="section" bg="white" borderWidth="1px" borderColor="bushido.outlineVariant" borderRadius="8px" overflow="hidden">
            <HStack justify="space-between" px={{ base: 4, md: 6 }} py={4} bg="bushido.surfaceLow" borderBottomWidth="1px" borderColor="bushido.outlineVariant">
              <Heading as="h2" fontFamily="heading" fontSize="20px">JLPT N{level}</Heading>
              <Text fontFamily="mono" fontSize="12px" color="bushido.muted">{entries.length} {t("entries")}</Text>
            </HStack>
            {entries.length === 0 ? (
              <Text p={6} color="bushido.muted">{t("No entries available for this level.")}</Text>
            ) : (
              <Grid
                templateColumns={type === "kanji"
                  ? { base: "repeat(4, 1fr)", sm: "repeat(6, 1fr)", md: "repeat(10, 1fr)", lg: "repeat(12, 1fr)" }
                  : { base: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
                gap="1px"
                bg="bushido.outlineVariant"
              >
                {entries.map((entry) => (
                  <Button
                    key={entry}
                    type="button"
                    h="auto"
                    minH={type === "kanji" ? "64px" : "56px"}
                    p={3}
                    justifyContent={type === "kanji" ? "center" : "flex-start"}
                    bg="white"
                    color="bushido.ink"
                    borderRadius="0"
                    fontFamily="body"
                    fontSize={type === "kanji" ? "28px" : "16px"}
                    fontWeight={type === "kanji" ? "500" : "600"}
                    whiteSpace="normal"
                    textAlign="left"
                    _hover={{ bg: "bushido.surfaceLow", color: "bushido.primary" }}
                    _focusVisible={{ outline: "3px solid", outlineColor: "bushido.primary", outlineOffset: "-3px" }}
                    onClick={() => onSelect(entry)}
                  >
                    {entry}
                  </Button>
                ))}
              </Grid>
            )}
          </Box>
        )
      })}
    </VStack>
  )
}

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
  const navigate = useNavigate()
  const [searchState, setSearchState] = useState({ type: "vocab", query: "", submittedQuery: "", page: 1, selectedId: null, showDetail: false })
  const [relatedResponse, setRelatedResponse] = useState(null)
  const [setPicker, setSetPicker] = useState({ open: false, sets: [], loading: false, submittingId: null, error: null })
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
  const relatedResults = (relatedResponse?.key === relatedKey ? relatedResponse.results : [])
    .filter((entry) => {
      const meanings = Array.isArray(entry.meaning) ? entry.meaning : [entry.meaning]
      return meanings.some((meaning) => String(meaning ?? "").trim())
    })
  const setPage = (page) => setSearchState((state) => ({ ...state, page, selectedId: null, showDetail: false }))
  const selectEntry = (id) => setSearchState((state) => ({ ...state, selectedId: id, showDetail: true }))
  const searchRelatedEntry = (entry) => {
    const type = searchState.type === "kanji" ? "vocab" : "kanji"
    const query = String(entry.writting ?? entry.kanji ?? "").trim()
    if (!query) return
    setRelatedResponse(null)
    setSearchState({
      type,
      query,
      submittedQuery: query,
      page: 1,
      selectedId: null,
      showDetail: false,
    })
  }
  const browseEntry = (query) => {
    setSearchState((state) => ({ ...state, query, submittedQuery: query, page: 1, selectedId: null, showDetail: false }))
  }
  const openSetPicker = async () => {
    if (!getStoredUser()) {
      toaster.create({
        title: t("Login required"),
        description: t("Please log in before adding a flashcard."),
        type: "warning",
      })
      navigate("/login")
      return
    }

    setSetPicker({ open: true, sets: [], loading: true, submittingId: null, error: null })
    try {
      const { data } = await getFlashCardSets()
      setSetPicker({ open: true, sets: data, loading: false, submittingId: null, error: null })
    } catch {
      setSetPicker({ open: true, sets: [], loading: false, submittingId: null, error: t("Unable to load flashcard sets.") })
    }
  }
  const addToSet = async (set) => {
    if (!selectedEntry) return
    setSetPicker((state) => ({ ...state, submittingId: set.flash_card_set_id, error: null }))
    try {
      await createFlashCard(set.flash_card_set_id, { type: searchState.type, entry_id: selectedEntry.id }, language)
      setSetPicker((state) => ({ ...state, open: false, submittingId: null }))
      toaster.create({
        title: t("Flashcard added"),
        description: `${t("Added to")} ${set.name}.`,
        type: "success",
      })
    } catch {
      setSetPicker((state) => ({ ...state, submittingId: null, error: t("Unable to add flashcard to this set.") }))
    }
  }

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
        <JlptBrowser type={searchState.type} onSelect={browseEntry} t={t} />
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
            <HStack justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Button display={{ md: "none" }} size="sm" variant="ghost" onClick={() => setSearchState((state) => ({ ...state, showDetail: false }))}>← {t("Back to results")}</Button>
              <Button ml={{ md: "auto" }} bg="bushido.primary" color="white" borderRadius="8px" borderWidth="1px" borderColor="bushido.primary" _hover={{ bg: "bushido.primaryHover", borderWidth: "2px" }} onClick={openSetPicker}>+ {t("Add to flashcard set")}</Button>
            </HStack>
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
                    <HStack as="button" type="button" key={entry.kanji_id ?? entry.vocab_id} width="100%" justify="space-between" gap={4} bg="bushido.surface" borderWidth="1px" borderColor="transparent" borderLeftWidth="4px" borderLeftColor="bushido.primary" borderRadius="4px" p={4} textAlign="left" cursor="pointer" onClick={() => searchRelatedEntry(entry)} _hover={{ bg: "bushido.surfaceLow", borderColor: "bushido.primary" }} _focusVisible={{ outlineColor: "bushido.primary" }}>
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

      <Dialog.Root open={setPicker.open} onOpenChange={({ open }) => !setPicker.submittingId && setSetPicker((state) => ({ ...state, open }))}>
        <Portal>
          <Dialog.Backdrop backdropFilter="blur(8px)" />
          <Dialog.Positioner p={4}>
            <Dialog.Content maxW="520px" bg="bushido.surfaceLowest" borderWidth="1px" borderColor="bushido.outline" borderRadius="4px">
              <Dialog.Header borderBottomWidth="1px" borderColor="bushido.outlineVariant">
                <Dialog.Title>{t("Choose a flashcard set")}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body py={5}>
                {setPicker.loading ? (
                  <Text color="bushido.muted">{t("Loading flashcard sets...")}</Text>
                ) : setPicker.error ? (
                  <Text color="bushido.error">{setPicker.error}</Text>
                ) : setPicker.sets.length === 0 ? (
                  <VStack align="stretch" gap={3}>
                    <Text color="bushido.muted">{t("You do not have any flashcard sets yet.")}</Text>
                    <Button alignSelf="flex-start" variant="outline" onClick={() => navigate("/learning")}>{t("Create a flashcard set")}</Button>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={2}>
                    {setPicker.sets.map((set) => (
                      <Button key={set.flash_card_set_id} h="auto" minH="64px" p={4} justifyContent="space-between" bg="bushido.surface" color="bushido.ink" borderWidth="1px" borderColor="bushido.outlineVariant" borderRadius="4px" whiteSpace="normal" textAlign="left" disabled={Boolean(setPicker.submittingId)} loading={setPicker.submittingId === set.flash_card_set_id} onClick={() => addToSet(set)} _hover={{ bg: "bushido.surfaceLow", borderColor: "bushido.primary" }}>
                        <Box>
                          <Text fontWeight="700">{set.name}</Text>
                          {set.description && <Text mt={1} fontSize="13px" color="bushido.muted" lineClamp="1">{set.description}</Text>}
                        </Box>
                        <Text flexShrink={0} ml={4} fontFamily="mono" fontSize="12px" color="bushido.muted">{set.total_flash_cards ?? 0}</Text>
                      </Button>
                    ))}
                  </VStack>
                )}
              </Dialog.Body>
              <Dialog.Footer borderTopWidth="1px" borderColor="bushido.outlineVariant">
                <Button variant="ghost" disabled={Boolean(setPicker.submittingId)} onClick={() => setSetPicker((state) => ({ ...state, open: false }))}>{t("Cancel")}</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </FullScreenVSection>
  )
}
