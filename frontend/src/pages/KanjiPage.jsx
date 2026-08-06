import { useEffect, useState } from "react"
import FullScreenVSection from "../layouts/FullScreenVSection"
import { HStack, Heading ,Text} from "@chakra-ui/react"
import Kanji from "../features/Kanji.jsx"
import { useParams } from "react-router-dom"
import { normalizeSearchText } from "../utils/UtilFunctions.js"
import  useSearch  from "../hooks/UseSearch"
import { useLanguage } from "../contexts/LanguageContext.jsx"

export default function KanjiPage() {
  const { t } = useLanguage()
  const { searchQuery = "" } = useParams()
  const normalizedQuery = normalizeSearchText(searchQuery)
  const [page, setPage] = useState(1);
  const [response, isLoading, search, error] = useSearch({
    type : 'kanji',
    page : page,
    pageSize : 10
  })
  
  useEffect(() => {
    if (normalizedQuery) {
      search(normalizedQuery);
    }
  }, [normalizedQuery,search,page]);

  const results = response ? response.results : [];

  return (
    <FullScreenVSection
      backgroundColor="bushido.surface"
      isDarkBackground={true}
      gap={6} align="stretch" width="100%" paddingX={6} paddingTop={6}
    >
      {/* Display loading, error, or results based on the state */}
      {isLoading ? (
        <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          {t("Loading...")}
        </Heading>
      ) : !normalizedQuery ? (
        <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          {t("Kanji Page")}
        </Heading>
      ) : error ? (
        <Heading as="h1" size="2xl" textAlign="center">
          {t("Error occurred while searching for kanji.")}
        </Heading>
      ) : results.length === 0 ? 
      (
        <Heading as="h1" size="2xl" textAlign="center">
          {t("No kanji found for")} “{searchQuery}”.
        </Heading>
      ) : (
        results.map((entry) => (
          <Kanji 
            key={entry.id}
            kanji={entry.kanji}
            onyomi={entry.onyomi}
            kunyomi={entry.kunyomi}
            strokeCount={entry.strokeCount}
            jlptLevel={entry.jlptLevel}
            meaning={entry.meaning}
            backgroundColor="white"
            borderRadius="md"
            padding={6}
          />
        ))
      )}
      {/* Pagination controls */}
      { normalizedQuery && results.length > 0 && !isLoading&&
        <HStack 
          align="center"
          justify="center"
          spacing={4}
          marginTop={4}
          marginBottom={4}
        >
          <button 
            onClick={() => {
              if(response.previous)
                setPage(response.previous);
            }}
          >
            {t("Previous")}
          </button>
          <Text style={{ margin: '0 10px', alignSelf: 'center' }}>{page}/{response ? response.total_pages : 1}</Text>
          <button 
            onClick={() => {
              if(response.next)
                setPage(response.next);
            }}
          >
            {t("Next")}
          </button> 
        </HStack>
      }
    </FullScreenVSection>
  )
}
