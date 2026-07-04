import { readFile, writeFile } from "node:fs/promises"
import process from "node:process"
import { fileURLToPath } from "node:url"

const inputPath = fileURLToPath(
  new URL("../src/stores/jmdict-eng-3.6.2.json", import.meta.url),
)
const outputPath = fileURLToPath(
  new URL("../src/stores/DataVocab.json", import.meta.url),
)

const unique = (values) => [...new Set(values)]

async function extractVocabData() {
  const source = JSON.parse(await readFile(inputPath, "utf8"))

  if (!Array.isArray(source.words)) {
    throw new TypeError('Expected the source JSON to contain a "words" array')
  }

  const dataVocab = source.words.map((word) => ({
    kanji: (word.kanji ?? []).map(({ common, text }) => ({ common, text })),
    kana: (word.kana ?? []).map(({ common, text }) => ({ common, text })),
    meaning: unique(
      (word.sense ?? []).flatMap((sense) =>
        (sense.gloss ?? [])
          .filter((gloss) => gloss.lang === "eng")
          .map((gloss) => gloss.text),
      ),
    ),
  }))

  await writeFile(outputPath, `${JSON.stringify(dataVocab, null, 2)}\n`, "utf8")
  console.log(`Wrote ${dataVocab.length} vocabulary records to ${outputPath}`)
}

extractVocabData().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
