import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {useState} from 'react';
import useSuggestions from '../hooks/UseSuggestions.jsx';


const searchablePaths = new Set([ '/', '/grammar', '/kanji', '/vocab', '/quiz' ]);

export default function SearchBar({ compact = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const suggestions = useSuggestions(searchQuery);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSuggestionsOpen(!!value.trim());
  };

  const handleSearch = (value = searchQuery) => {
    const query = value.trim();
    const basePath = `/${location.pathname.split('/').filter(Boolean)[0] ?? ''}`;

    if (!query || !searchablePaths.has(basePath)) return;

    if(basePath === '/') {
      navigate(`/vocab/${encodeURIComponent(query)}`);
    } else {
      navigate(`${basePath}/${encodeURIComponent(query)}`);
    }
  };

  return (
    <HStack gap={2} align="center" position="relative" width={compact ? "180px" : "100%"}>
        <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleChange}
            color = "black"
            backgroundColor = "white"
        ></Input>
        {isSuggestionsOpen && suggestions.length > 0 && (
            <VStack
              align="stretch"
              gap={0}
              position="absolute"
              top="100%"
              left={0}
              right={0}
              overflowY="auto"
              maxHeight="200px"
              backgroundColor="white"
              border="1px solid #ccc"
              zIndex={1000}
            >
              {suggestions.map((suggestion) => (
                  <Box
                      key={`${suggestion.type}-${suggestion.id}-${suggestion.text}`}
                      onClick={() => {
                          setSearchQuery(suggestion.text);
                          setIsSuggestionsOpen(false);
                          handleSearch(suggestion.text);
                      }}
                      padding="8px"
                      cursor="pointer"
                      _hover={{ backgroundColor: 'gray.100' }}
                  >
                      <Text color="black">{suggestion.text}</Text>
                      <Text color="bushido.muted" fontSize="sm">{(suggestion.meaning ?? []).join(', ')}</Text>
                  </Box>
              ))}
            </VStack>
        )}
        {!compact && <Button type="button" bg="bushido.primary" color="white" onClick={() => handleSearch()}>Search</Button>}
    </HStack>
  )
}
