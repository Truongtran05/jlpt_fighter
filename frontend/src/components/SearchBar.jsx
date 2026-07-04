import { Button, HStack, Input } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {useState} from 'react';


const searchablePaths = new Set([ '/', '/grammar', '/kanji', '/vocab', '/quiz' ]);

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    const basePath = `/${location.pathname.split('/').filter(Boolean)[0] ?? ''}`;

    if (!query || !searchablePaths.has(basePath)) return;

    if(basePath === '/') {
      navigate(`/vocab/${encodeURIComponent(query)}`);
    } else {
      navigate(`${basePath}/${encodeURIComponent(query)}`);
    }
    console.log(`searching for: ${query} in ${basePath}`);
  };

  return (
    <HStack direction="row" spacing={2} align="center">
        <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleChange}
            color = "black"
            backgroundColor = "white"
        ></Input>
    <Button type="button" onClick={handleSearch}>Search</Button>
    </HStack>
  )
}
