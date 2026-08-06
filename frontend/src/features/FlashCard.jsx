import { Box, Heading, Text, VStack , HStack , Button, Input} from "@chakra-ui/react";
import { useState } from "react";
import AuthApiClient from "../api/clients/AuthApiClient.js";
import { FaEdit} from "react-icons/fa";
import { BsFillBookmarkCheckFill,  BsBookmarkDashFill } from "react-icons/bs";
import useSuggestions from "../hooks/UseSuggestions.jsx";
import { MdDelete } from "react-icons/md";
import { useLanguage } from "../contexts/LanguageContext.jsx";


const typeLabels = {
  kanji: "Kanji",
  vocab: "Vocabulary",
  grammar: "Grammar",
};
const primaryButtonStyles = {
  bg: "bushido.primary",
  color: "white",
  borderRadius: "8px",
  borderWidth: "1px",
  borderColor: "bushido.primary",
  _hover: { bg: "bushido.primaryHover", borderWidth: "2px" },
};
const secondaryButtonStyles = {
  bg: "white",
  color: "bushido.primary",
  borderColor: "bushido.outline",
  _hover: { bg: "bushido.surfaceLow" },
  size: "sm"
};
function asList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function getCardContent(flashCard, t) {

  if (flashCard.type === "kanji") {
    return {
      front: flashCard.kanji ?? "Kanji",
      backTitle: asList(flashCard.meaning ?? flashCard.meanings).join(", ") || t("No meaning"),
      lines: [
        ["Onyomi", asList(flashCard.onyomi).join(", ")],
        ["Kunyomi", asList(flashCard.kunyomi).join(", ")],
        [t("Stroke count"), flashCard.strokeCount ?? flashCard.stroke_count],
        ["JLPT", flashCard.jlptLevel ? `N${flashCard.jlptLevel}` : flashCard.jlpt_level ? `N${flashCard.jlpt_level}` : null],
      ],
    };
  }

  if (flashCard.type === "vocab") {
    const kanji = asList(flashCard.kanji ?? flashCard.writings?.kanji);
    const kana = asList(flashCard.kana ?? flashCard.writings?.kana);
    const senses = asList(flashCard.senses);

    return {
      front: kanji[0] ?? kana[0] ?? t("Vocabulary"),
      backTitle: senses.flatMap((sense) => asList(sense.meanings)).join("; ") || t("No meaning"),
      lines: [
        ["Kanji", kanji.join(", ")],
        ["Kana", kana.join(", ")],
        [t("Part of speech"), senses.map((sense) => sense.part_of_speech).filter(Boolean).join(", ")],
      ],
    };
  }

  if (flashCard.type === "grammar") {
    const examples = asList(flashCard.examples);
    return {
      front: flashCard.grammar ?? t("Grammar"),
      backTitle: asList(flashCard.meaning).join("; ") || t("No meaning"),
      lines: [
        [t("Formation"), flashCard.formation],
        ["JLPT", flashCard.jlpt_level ? `N${flashCard.jlpt_level}` : null],
        [t("Examples"), examples.map((example) => [
          example.example_japanese,
          example.example_romaji,
          example.example_gloss,
        ].filter(Boolean).join(" — ")).join(" | ")],
      ],
    };
  }

  return {
    front: t("Flashcard"),
    backTitle: t("Unsupported flashcard type"),
    lines: [[t("Type"), flashCard.type]],
  };
}

export default function FlashCard({ flashCard, onUpdated , onDelete, isEditable }) {
  const { language, t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!flashCard) {
    return null;
  }

  const cardType = t(typeLabels[flashCard.type] ?? "Flashcard");
  const content = getCardContent(flashCard, t);

  function handleEdit(){
    setIsEditing(true);
  }

  async function onEditSubmit(e, selectedSuggestion){
    e.preventDefault();
    if (!selectedSuggestion) {
      return;
    }

    try{
      const response = await AuthApiClient.patch(`/flashcards/${flashCard.flash_card_id}/`, {
        type: selectedSuggestion.type,
        entry_id: selectedSuggestion.id,
      }, { params: { lang: language } });
      onUpdated?.(response.data);
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
      aria-label={t(isFlipped ? "Show flashcard front" : "Show flashcard answer")}
    >
      {isEditing ? (
        <CardEditForm onSubmit={onEditSubmit} onCancel={onEditCancel} />
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
              <Text fontFamily="mono" fontSize="12px" letterSpacing="0.05em" color="bushido.muted">
                {cardType}
              </Text>
              <Text fontSize="sm" color="bushido.muted">
                {t("Click to flip")}
              </Text>
              {isEditable && (
                <Button
                  {...secondaryButtonStyles}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <FaEdit />
                </Button>
              )}
            </HStack>
            <Heading size="3xl" fontFamily="body" textAlign="center" color="bushido.ink" noOfLines={2}>
              {content.front}
            </Heading>
            <HStack justify="space-between" width="100%">
              {isEditable && (
                <Button {...secondaryButtonStyles} onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}>
                  <MdDelete />
                </Button>
              )}
              {flashCard.status === "remembered" ? (<Text color="bushido.primary"><BsFillBookmarkCheckFill/></Text>) : (<Text  color="bushido.tertiary"><BsBookmarkDashFill /></Text>)}
            </HStack>
          </CardFace>

          <CardFace transform="rotateX(180deg)">
            <Text fontSize="sm" color="bushido.muted">
              {cardType}
            </Text>
            <Heading size="lg" textAlign="center" color="bushido.ink">
              {content.backTitle}
            </Heading>
            <VStack align="stretch" gap={2} width="100%">
              {content.lines
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <Text key={label} fontSize="md" color="bushido.muted">
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

function CardEditForm({onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestions = useSuggestions(query);

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
        borderRadius="4px"
        bg="white"
        backfaceVisibility="hidden"
        as="form"
        onSubmit={(e) => {
          onSubmit(e, selectedSuggestion);
        }}
      >
        <Heading size="md">{t("Edit Flashcard")}</Heading>
        <Input 
          placeholder={t("Type your kanji/vocab/grammar term here...")}
          backgroundColor="white"
          color="bushido.ink"
          autoFocus
          value={query}
          onChange={handleChange}
        />
        {selectedSuggestion && (<Text color="bushido.muted" fontSize="sm">{t("Selected")}: {selectedSuggestion.text}</Text>)}
        {isSuggestionsOpen && suggestions.length > 0 && (
            <VStack
                align="stretch"
                gap={0}
                position="relative"
                top="0px"
                left={0}
                right={0}
                overflowY="auto"
                maxHeight="200px"
                backgroundColor="white"
                borderWidth="1px"
                borderColor="bushido.outline"
                zIndex={1000}
            >
                {suggestions.map((suggestion) => (
                    <Box
                        key={`${suggestion.type}-${suggestion.id}-${suggestion.text}`}
                        onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setQuery(asList(suggestion.text)[0] ?? "");
                            setIsSuggestionsOpen(false);
                        }}
                        padding="8px"
                        cursor="pointer"
                        _hover={{ backgroundColor: 'bushido.surfaceLow' }}
                    >
                        <Text color="black">{asList(suggestion.text).join(", ")}</Text>
                        <Text color="bushido.muted" fontSize="sm">{(suggestion.meaning ?? []).join(", ")}</Text>
                    </Box>
                ))}
            </VStack>
        )}
        <HStack justify="flex-end" gap={2}>
          <Button {...secondaryButtonStyles} type="button" onClick={onCancel}>
            {t("Cancel")}
          </Button>
          <Button {...primaryButtonStyles} type="submit">
            {t("Save")}
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
      borderRadius="4px"
      bg={transform === "rotateX(0deg)" ? "white" : "bushido.surfaceLow"}
      backfaceVisibility="hidden"
      transform={transform}
    >
      {children}
    </VStack>
  );
}
