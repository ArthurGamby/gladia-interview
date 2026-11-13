# Feedback for the Gladia team

What I ran into while building the [code-switching demo](README.md): pre-recorded
API, Solaria-1, three recordings of my own voice. Docs checked on 2026-11-12.

## In short

1. **Document what happens without `code_switching`.** Speech in the other
   language gets the file's language, so it is not translated. In one recording
   it was dropped entirely. Every time, the job ends with `status: "done"`.
2. **Flag dropped speech.** Today the only trace is a word that lasts several
   seconds.
3. **Expose a language confidence per utterance**, so a client can send doubtful
   utterances to review instead of guessing.

## What I observed

### Without code-switching, speech can disappear

Recording: [`audio/call-take2.aifc`](audio/call-take2.aifc), 38.8 s. I talk in
French to a colleague, in English to a client, then French and English again.
With no `language_config`, the file is detected as French, and everything I said
in English to the client, from 5.7 s to 17.3 s, is missing from the transcript.
The French words around the gap are stretched to cover it, and they keep a high
confidence:

```json
{
  "text": "je reviens vers toi.", "language": "fr", "start": 3.674, "end": 14.878, "confidence": 0.83,
  "words": [
    { "word": " je",      "start": 3.674, "end": 3.754,  "confidence": 0.94 },
    { "word": " reviens", "start": 3.774, "end": 9.738,  "confidence": 0.99 },
    { "word": " vers",    "start": 9.9,   "end": 14.5,   "confidence": 0.72 },
    { "word": " toi.",    "start": 14.5,  "end": 14.878, "confidence": 0.95 }
  ]
}
```

The last English sentences came back in French ("He's on it" became "il est sur
le point"), and the English translation built from them reads fluently: nobody
who has not heard the audio would doubt it. With `code_switching: true`, the
English is back. Both responses are in [`responses/`](responses/).

### What code-switching still gets wrong

- **Words at a language switch can disappear.** "let me ask *Paul, he* just
  arrived" lost "Paul, he". The
  [code-switching page](https://docs.gladia.io/chapters/language/code-switching)
  says "No spoken content is lost".
- **A sentence can get the wrong language.** In the same recording, "and I'll
  send you the report right after this call" came back in French ("Je vous
  envoyerai le rapport…", `fr`). In the video clip, "to the translation if you
  don't enable code switching." is labelled `fr`, with its English text intact.
- **Utterance `confidence` is not a language confidence.** Those two wrong labels
  scored 0.35 and 0.68, so it is only a weak hint.
- **Short accented phrases at the start of a file are fragile.** In my first take
  ([`audio/call-take1.wav`](audio/call-take1.wav)), the four opening English
  sentences were detected as French and rendered in bad French ("we shipped the
  fix" became "Nous avons acheté ce…"). The opening sent alone was detected
  correctly, and so was the full file with 2.5 s of silence added at the start.
- **The `base` translation drifts.** Translated text spills from one utterance to
  the next, and one sentence appeared twice in the English version. `enhanced`
  keeps the utterances aligned 1 to 1.

## Documentation gaps

1. **What you lose without code-switching is not documented.** The
   [language detection](https://docs.gladia.io/chapters/language/language-detection)
   page explains how to choose a config, not what happens to the other language
   with the wrong one: mislabelled, left untranslated, sometimes dropped.
2. **"No spoken content is lost"** on the code-switching page is contradicted by
   the boundary losses above.
3. **200 vs 201.** The
   [retry guide](https://docs.gladia.io/chapters/pre-recorded-stt/transcription-process)
   says `POST /v2/pre-recorded` returns 200; the API and the OpenAPI reference
   return 201. A client that tests for 200 resubmits billed jobs.
4. **Timeouts are called safe to retry.** The same guide treats a POST timeout as
   "not accepted". Without deduplication, a timeout after the server accepted the
   job creates a second billed job.
5. **No language per word in the pre-recorded response.** The code-switching page
   says the language is returned per utterance and per word; words only carry
   `word`, `start`, `end`, `confidence`.
6. **Live-only fields on shared pages.** The code-switching and language
   detection pages show `encoding`, `sample_rate`, `bit_depth`, which only exist
   in the live API.
7. **The upload curl example sets the multipart `Content-Type` by hand.** Copied
   into most HTTP clients, that drops the boundary and the API answers 400.
8. **`429` is missing from the API reference** of the POST endpoints, with no
   documented body or `Retry-After` header.
9. **Small inconsistencies.** `.aifc` (what QuickTime saves at maximum quality)
   works but is not in the supported formats; the `model` enum lists an
   undocumented `solaria-fusion`; the translation model enum is `base`,
   `enhanced` in the guide and `base`, `batch`, `enhanced` in the schema.

## API suggestions

Ordered by how much they would have helped here:

1. **Flag dropped speech**: a per-utterance or per-file signal when voiced audio
   produced no words, or a speech coverage ratio in `metadata`.
2. **Expose `language_confidence`** (and the runner-up language) per utterance.
3. **Accept an `Idempotency-Key` header on `POST /v2/pre-recorded`.** It is the
   standard answer to "was my job created?", and it would make the retry guide
   simple.
4. **Mark utterances that were not really translated**, for example with a
   `source_language` per translated utterance, so a client can see that an
   utterance labelled `en` was passed through as is.
5. **Add a minimum duration before switching language** to `language_config`, so a
   two-word accented phrase cannot flip a whole passage.
