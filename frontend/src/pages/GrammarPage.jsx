import FullScreenVSection from "../layouts/FullScreenVSection"
import { HStack, Heading,Text } from "@chakra-ui/react"
import useSearch from "../hooks/UseSearch"
import { useEffect, useState } from "react"
import Grammar from "../features/Grammar.jsx"
import { useParams } from "react-router-dom"
import { normalizeSearchText } from "../utils/UtilFunctions.js"
export default function GrammarPage() {

  const {searchQuery = ""} = useParams()
  const normalizedQuery = normalizeSearchText(searchQuery)
  const [page, setPage] = useState(1);
  const [response, isLoading, search, error] = useSearch({
    type : 'grammar',
    page : page,
    pageSize : 10
  })
  useEffect(() => {
    if (normalizedQuery) {
      search(normalizedQuery);
    }
  }, [normalizedQuery, search, page]);
  const results = response ? response.results : [];

  return (
<FullScreenVSection
      backgroundColor="bushido.surface"
      isDarkBackground={true}
      gap={6} align="stretch" width="100%" paddingX={6} paddingTop="80px"
    >
      {/* Display loading, error, or results based on the state */}
      {isLoading ? (
        <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          Loading...
        </Heading>
      ) : !normalizedQuery ? (
        <Heading as="h1" size="2xl" textAlign="right" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          Grammar Page
        </Heading>
      ) : error ? (
        <Heading as="h1" size="2xl" textAlign="center">
          Error occurred while searching for grammar.
        </Heading>
      ) : results.length === 0 ? 
      (
        <Heading as="h1" size="2xl" textAlign="center">
          No grammar found for “{searchQuery}”.
        </Heading>
      ) : (
        results.map((entry) => (
          <Grammar 
            key={entry.id}
            grammar={entry.grammar}
            formation={entry.formation}
            meaning={entry.meaning}
            jlpt_level={entry.jlpt_level}
            examples={entry.examples}
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
