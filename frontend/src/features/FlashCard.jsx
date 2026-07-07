import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

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

function getEntry(flashCard) {
  if (flashCard.type === "kanji") {
    return flashCard.kanji_entry ?? flashCard.kanji_flash_card?.kanji_entry ?? flashCard;
  }

  if (flashCard.type === "vocab") {
    return flashCard.vocab_entry ?? flashCard.vocab_flash_card?.vocab_entry ?? flashCard;
  }

  if (flashCard.type === "grammar") {
    return flashCard.grammar_entry ?? flashCard.grammar_flash_card?.grammar_entry ?? flashCard;
  }

  return flashCard;
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

export default function FlashCard({ flashCard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashCard) {
    return null;
  }

  const cardType = typeLabels[flashCard.type] ?? "Flashcard";
  const content = getCardContent(flashCard);

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
      <Box
        position="relative"
        minH="260px"
        transition="transform 0.35s ease"
        transform={isFlipped ? "rotateX(180deg)" : "rotateX(0deg)"}
        transformStyle="preserve-3d"
      >
        <CardFace>
          <Text fontSize="sm" color="gray.500">
            {cardType}
          </Text>
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
    </Box>
  );
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
