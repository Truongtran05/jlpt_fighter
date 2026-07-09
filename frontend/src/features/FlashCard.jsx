import { Box, Heading, Text, VStack , HStack , Button, Input} from "@chakra-ui/react";
import { useState } from "react";
import AuthApiClient from "../api/AuthApiClient.js";
import { FaEdit } from "react-icons/fa";
import useSuggestions from "../hooks/UseSuggestions.jsx";

const typeLabels = {
  kanji: "Kanji",
  vocab: "Vocabulary",
  grammar: "Grammar",
};

function asList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function getCardContent(flashCard) {

  if (flashCard.type === "kanji") {
    return {
      front: flashCard.kanji ?? "Kanji",
      backTitle: asList(flashCard.meaning ?? flashCard.meanings).join(", ") || "No meaning",
      lines: [
        ["Onyomi", asList(flashCard.onyomi).join(", ")],
        ["Kunyomi", asList(flashCard.kunyomi).join(", ")],
        ["Stroke count", flashCard.strokeCount ?? flashCard.stroke_count],
        ["JLPT", flashCard.jlptLevel ? `N${flashCard.jlptLevel}` : flashCard.jlpt_level ? `N${flashCard.jlpt_level}` : null],
      ],
    };
  }

  if (flashCard.type === "vocab") {
    const kanji = asList(flashCard.kanji ?? flashCard.writings?.kanji);
    const kana = asList(flashCard.kana ?? flashCard.writings?.kana);

    return {
      front: kanji[0] ?? kana[0] ?? "Vocabulary",
      backTitle: asList(flashCard.meaning ?? flashCard.meanings).join("; ") || "No meaning",
      lines: [
        ["Kanji", kanji.join(", ")],
        ["Kana", kana.join(", ")],
      ],
    };
  }

  if (flashCard.type === "grammar") {
    return {
      front: flashCard.grammar ?? "Grammar",
      backTitle: flashCard.meaning ?? "No meaning",
      lines: [
        ["Formation", flashCard.formation],
        ["JLPT", flashCard.jlpt_level ? `N${flashCard.jlpt_level}` : null],
      ],
    };
  }

  return {
    front: "Flashcard",
    backTitle: "Unsupported flashcard type",
    lines: [["Type", flashCard.type]],
  };
}

export default function FlashCard({ flashCard, onUpdated }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!flashCard) {
    return null;
  }

  const cardType = typeLabels[flashCard.type] ?? "Flashcard";
  const content = getCardContent(flashCard);

  function handleEdit(){
    setIsEditing(true);
  }

  async function onEditSubmit(e, selectedSuggestion){
    e.preventDefault();
    if (!selectedSuggestion) {
      return;
    }

    try{
      await AuthApiClient.patch(`/flashcards/${flashCard.flash_card_id}/`, {
        type: selectedSuggestion.type,
        entry_id: selectedSuggestion.id,
      });
      onUpdated?.({
        ...flashCard,
        type: selectedSuggestion.type,
        kanji: selectedSuggestion.type === "kanji" ? selectedSuggestion.text : [selectedSuggestion.text],
        grammar: selectedSuggestion.type === "grammar" ? selectedSuggestion.text : flashCard.grammar,
        meaning: selectedSuggestion.type === "grammar"
          ? (Array.isArray(selectedSuggestion.meaning) ? selectedSuggestion.meaning.join(", ") : selectedSuggestion.meaning)
          : selectedSuggestion.meaning,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  }

  function onEditCancel(e){
    e.preventDefault();
    setIsEditing(false);
  }

  return (
    <Box
      as="button"
      type="button"
      width="100%"
      maxW="420px"
      minH="260px"
      textAlign="left"
      perspective="1000px"
      onClick={() => setIsFlipped((value) => !value)}
      aria-label={isFlipped ? "Show flashcard front" : "Show flashcard answer"}
    >
      {isEditing ? (
        <CardEditForm onSubmit={onEditSubmit} onCancel={onEditCancel} flashCardId={flashCard.flash_card_id} />
      ) : (
        <Box
          position="relative"
          minH="260px"
          minW="100%"
          transition="transform 0.35s ease"
          transform={isFlipped ? "rotateX(180deg)" : "rotateX(0deg)"}
          transformStyle="preserve-3d"
        >
          <CardFace>
            <HStack justify="space-between" width="100%">
              <Text fontSize="sm" color="gray.500">
                {cardType}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <FaEdit />
              </Button>
            </HStack>
            <Heading size="3xl" textAlign="center" color="gray.800" noOfLines={2}>
              {content.front}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Click to flip
            </Text>
          </CardFace>

          <CardFace transform="rotateX(180deg)">
            <Text fontSize="sm" color="gray.500">
              {cardType}
            </Text>
            <Heading size="lg" color="gray.800">
              {content.backTitle}
            </Heading>
            <VStack align="stretch" gap={2} width="100%">
              {content.lines
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <Text key={label} fontSize="md" color="gray.600">
                    <Text as="span" fontWeight="semibold">
                      {label}:
                    </Text> {" "}
                    {value}
                  </Text>
                ))}
            </VStack>
          </CardFace>
        </Box>
      )}
    </Box>
  );
}

function CardEditForm({onSubmit, onCancel}) {
  const [query, setQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const  suggestions = useSuggestions(query);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsSuggestionsOpen(true);
  };

  return(
    <Box
      position = "relative"
      minH="260px"
    >
      <VStack
        position="absolute"
        inset={0}
        justify="space-between"
        align="stretch"
        gap={4}
        p={6}
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        boxShadow="md"
        backfaceVisibility="hidden"
        as="form"
        onSubmit={(e) => {
          onSubmit(e, selectedSuggestion);
        }}
      >
        <Heading size="md">Edit Flashcard</Heading>
        <Input 
          placeholder="Type your kanji/vocab/grammar term here..."
          backgroundColor="white"
          color="gray.800"
          autoFocus
          value={query}
          onChange={handleChange}
        />
        {selectedSuggestion && (<Text color="gray.600" fontSize="sm">Selected: {selectedSuggestion.text}</Text>)}
        {isSuggestionsOpen && suggestions.length > 0 && (
            <VStack
                align="stretch"
                gap={0}
                position="absolute"
                top="42px"
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
                            setSelectedSuggestion(suggestion);
                            setQuery(suggestion.text);
                            setIsSuggestionsOpen(false);
                        }}
                        padding="8px"
                        cursor="pointer"
                        _hover={{ backgroundColor: 'gray.100' }}
                    >
                        <Text color="black">{suggestion.text}</Text>
                        <Text color="gray.600" fontSize="sm">{(suggestion.meaning ?? []).join(", ")}</Text>
                    </Box>
                ))}
            </VStack>
        )}
        <HStack justify="flex-end" gap={2}>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="green">
            Save
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}

function CardFace({ children, transform = "rotateX(0deg)" }) {
  return (
    <VStack
      position="absolute"
      inset={0}
      justify="space-between"
      align="stretch"
      gap={4}
      p={6}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      boxShadow="md"
      backfaceVisibility="hidden"
      transform={transform}
    >
      {children}
    </VStack>
  );
}
