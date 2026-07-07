import { Box, Text } from "@chakra-ui/react";

export default function FlashCardSet({ flashCardSet, onClick }) {
  return (
    <Box
      as="button"
      type="button"
      onClick={() => onClick(flashCardSet)}
      cursor="pointer"
      textAlign="left"
      width="100%"
      padding={6}
      borderWidth="1px"
      borderRadius="md"
      backgroundColor="white"
      color="gray.800"
    >
      <Text fontSize="lg" fontWeight="bold">
        Flash Card Set {flashCardSet.name}
      </Text>
      <Text fontSize="md">{flashCardSet.description}</Text>
      <Text color="gray.500">Click to start learning</Text>
    </Box>
  );
}
