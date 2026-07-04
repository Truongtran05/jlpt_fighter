import { readFile, writeFile } from "node:fs/promises"
import process from "node:process"
import { fileURLToPath } from "node:url"

const inputPath = fileURLToPath(
  new URL("../src/stores/kanjidic2-en-3.6.2.json", import.meta.url),
)
const outputPath = fileURLToPath(
  new URL("../src/stores/dataKanji.json", import.meta.url),
)

const unique = (values) => [...new Set(values)]

async function extractKanjiData() {
  const source = JSON.parse(await readFile(inputPath, "utf8"))

  if (!Array.isArray(source.characters)) {
    throw new TypeError('Expected the source JSON to contain a "characters" array')
  }

  const dataKanji = source.characters.map((character) => {
    const groups = character.readingMeaning?.groups ?? []
    const readings = groups.flatMap((group) => group.readings ?? [])

    return {
      kanji: character.literal,
      onyomi: unique(
        readings
          .filter((reading) => reading.type === "ja_on")
          .map((reading) => reading.value),
      ),
      kunyomi: unique(
        readings
          .filter((reading) => reading.type === "ja_kun")
          .map((reading) => reading.value),
      ),
      strokeCount: character.misc?.strokeCounts?.[0] ?? null,
      jlptLevel: character.misc?.jlptLevel ?? null,
      meaning: unique(
        groups.flatMap((group) =>
          (group.meanings ?? [])
            .filter((meaning) => meaning.lang === "en")
            .map((meaning) => meaning.value),
        ),
      ),
    }
  })

  await writeFile(outputPath, `${JSON.stringify(dataKanji, null, 2)}\n`, "utf8")
  console.log(`Wrote ${dataKanji.length} kanji records to ${outputPath}`)
}

extractKanjiData().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
