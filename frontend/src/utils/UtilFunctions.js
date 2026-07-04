// Normalize the search text for consistent matching
export const normalizeSearchText = (value) =>
  value.normalize("NFKC").trim().toLocaleLowerCase()