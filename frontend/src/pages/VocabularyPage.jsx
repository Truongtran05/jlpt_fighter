import FullScreenVSection from "../layouts/FullScreenVSection"
import { Heading, Text, HStack } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Vocabulary from "../features/Vocabulary"
import { normalizeSearchText } from "../utils/UtilFunctions"
import UseSearch from "../hooks/UseSearch"

export default function VocabularyPage() {
  const { searchQuery = "" } = useParams()
  const normalizedQuery = normalizeSearchText(searchQuery)
  const [page, setPage] = useState(1);

  const [response, isLoading, search, error] = UseSearch({
    type : "vocab",
    page : page,
    pageSize : 10
  })

  useEffect(() => {
    if (normalizedQuery) {
      search(normalizedQuery);
    }
  }, [normalizedQuery, search]);

  const results = response ? response.results : [];

  return (
    <FullScreenVSection
      backgroundColor="#14532d"
      isDarkBackground={true}
      gap={6} 
      align="stretch" 
      width="100%" 
      paddingX={6} 
      paddingTop="80px"
    >
        {
        isLoading ? (
          <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            Loading...
          </Heading>
        ) : !normalizedQuery ? (
          <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            Vocabulary Page
          </Heading>
        ) : error ? (
          <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            Error occurred while searching for vocabulary.
          </Heading>
        ) : results.length === 0 ? 
        (
          <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            No words found for “{searchQuery}”.
          </Heading>   
        ) : (
          results.map((entry) => (
            <Vocabulary
              key={entry.id}
              kanji={entry.kanji}
              kana={entry.kana}
              meaning={entry.meaning}
              backgroundColor="whiteAlpha.200"
              borderRadius="md"
              padding={6}
            />
          ))
        )
        }
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
              Previous
            </button>
            <Text style={{ margin: '0 10px', alignSelf: 'center' }}>{page}/{response ? response.total_pages : 1}</Text>
            <button 
              onClick={() => {
                if(response.next)
                  setPage(response.next);
              }}
            >
              Next
            </button> 
          </HStack>
        }
    </FullScreenVSection>
  )
}