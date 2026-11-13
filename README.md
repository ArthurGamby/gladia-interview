# When your users switch languages mid-call

A runnable before/after of Gladia's `code_switching` option, on a real 23-second
clip: English, a French aside to a colleague, then English again.

![The same audio through both configs. Without code_switching, the French line is labelled en and stays in French. With it, the line is labelled fr and translated.](assets/code-switching.gif)

▶ [Watch the real example on YouTube (50 s)](https://youtu.be/ms9HPNIL2pA)

By default, Gladia's pre-recorded API detects **one** language and puts it on
every utterance of the file. The French is still transcribed, but it is labelled
`en`, so the translation to English skips it. You get French in your English
transcript, with `status: "done"` and no error.

**The fix is one field:**

```json
"language_config": { "languages": ["en", "fr"], "code_switching": true }
```

Listing the languages is not enough. Without `code_switching: true`, Gladia still
picks one of them for the whole file.

## Before / after

Same clip, same request (with an English translation), with and without
`code_switching`:

| | Without `code_switching` | With `code_switching` |
| --- | --- | --- |
| Languages found in the file | `en` | `en`, `fr` |
| Label of "Merci Paul pour les croissants" | `en` | `fr` |
| The same line in the English translation | *merci Paul pour les croissants.* | *Thank you Paul for the croissants,* |
| Processing time for 23.3 s of audio | 3.5 s | 2.7 s |

Raw responses: [without](responses/chat-v3.default.response.json),
[with](responses/chat-v3.code-switching.response.json).

## Run it (2 minutes)

You need [uv](https://docs.astral.sh/uv/) and a Gladia API key from
[app.gladia.io](https://app.gladia.io). The free plan is enough: this test costs
less than one cent.

```bash
git clone <this repo> && cd code-switching-demo
cp .env.example .env        # paste your key
uv run --env-file .env compare.py audio/chat-v3.wav --translation-model enhanced
```

`uv` installs the only dependency (`httpx`) from the script header. The script
uploads the file once, starts both jobs, prints each utterance with its language,
then the English version. Trimmed output:

```text
=== default ===
languages: en | audio 23.3s | transcribed in 3.5s | billed 23.3s
00:05.7  en  is asking me something really important that I need to answer.
00:09.7  en  merci Paul pour les croissants.
00:10.9  en  Par contre,
...
en version: ... Ah, merci Paul pour les croissants. Par contre, pour le rapport,
là je suis en meeting, on voit ça juste après, ok? Merci. I am switching back...

=== code-switching ===
languages: en, fr | audio 23.3s | transcribed in 2.7s | billed 23.3s
00:04.7  en  From France Paul is asking me something really important that I need to answer.
00:09.7  fr  Merci Paul pour les croissants,
00:10.9  fr  par contre...
...
en version: ... Thank you Paul for the croissants, on the other hand... Regarding
the report, there, I am in a meeting. We will look at that shortly, OK? Thank you.
```

On your own file: `uv run --env-file .env compare.py my-call.m4a --languages en es`.
Other flags: `--translate-to`, `--no-translation`, `--subtitles` (saves `.srt`
files), `--out`.

## The three API calls

`compare.py` makes them with `httpx`. Here they are with `curl`.

<details>
<summary><b>1. Upload the file once</b>: <code>POST /v2/upload</code></summary>

```bash
curl -X POST https://api.gladia.io/v2/upload \
  -H "x-gladia-key: $GLADIA_API_KEY" \
  -F "audio=@audio/chat-v3.wav"
```

```json
{
  "audio_url": "https://api.gladia.io/file/ab89dd88-a15b-43fa-a370-2b6f2484cb6e",
  "audio_metadata": { "audio_duration": 23.328, "...": "..." }
}
```

Do not set `Content-Type: multipart/form-data` yourself. curl and httpx add the
boundary only when they write that header; without it the API answers `400`.
Both jobs reuse the same `audio_url`.

</details>

<details>
<summary><b>2. Start a job</b>: <code>POST /v2/pre-recorded</code>, answers <code>201</code></summary>

```bash
curl -X POST https://api.gladia.io/v2/pre-recorded \
  -H "x-gladia-key: $GLADIA_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://api.gladia.io/file/ab89dd88-a15b-43fa-a370-2b6f2484cb6e",
    "language_config": { "languages": ["en", "fr"], "code_switching": true },
    "translation": true,
    "translation_config": { "target_languages": ["en"], "model": "enhanced" }
  }'
```

```json
{
  "id": "838caaac-0b96-4980-9bf2-3b505ee77c6b",
  "result_url": "https://api.gladia.io/v2/pre-recorded/838caaac-0b96-4980-9bf2-3b505ee77c6b"
}
```

The "without" job sends the same body minus `language_config`. Both request
bodies are saved in [`responses/`](responses/).

</details>

<details>
<summary><b>3. Poll until <code>status</code> is <code>done</code></b>: <code>GET /v2/pre-recorded/:id</code></summary>

```bash
curl https://api.gladia.io/v2/pre-recorded/838caaac-0b96-4980-9bf2-3b505ee77c6b \
  -H "x-gladia-key: $GLADIA_API_KEY"
```

`status` goes `queued`, `processing`, then `done` (or `error`). The part that
matters, without `code_switching`: the French line is labelled `en`, and its
"translation" is the French text, unchanged.

```json
"transcription": {
  "languages": ["en"],
  "utterances": [{ "text": "merci Paul pour les croissants.", "language": "en",
                   "start": 9.73, "end": 10.87, "confidence": 0.92, "words": ["..."] }]
},
"translation": {
  "results": [{ "languages": ["en"],
                "utterances": [{ "text": "merci Paul pour les croissants.", "language": "en" }] }]
}
```

With `code_switching`:

```json
"transcription": {
  "languages": ["en", "fr"],
  "utterances": [{ "text": "Merci Paul pour les croissants,", "language": "fr",
                   "start": 9.72, "end": 10.85, "confidence": 0.73, "words": ["..."] }]
},
"translation": {
  "results": [{ "languages": ["en"],
                "utterances": [{ "text": "Thank you Paul for the croissants,", "language": "en" }] }]
}
```

</details>

## Before you ship it

- **Use the `enhanced` translation model.** With `base`, translated text spills
  from one utterance to the next and a sentence can appear twice. For natural
  wording, add `"informal": true` and a short `context` (the video does).
- **Expect `201`, not `200`,** when a job is created.
- **Never retry a job creation blindly.** Gladia does not deduplicate jobs: every
  accepted POST is a new, billed job. `send()` retries only `429` and `5xx`
  (backoff, jitter, `Retry-After`) and lets a timeout raise.
- **Log the `request_id`.** It is the first thing support asks for; `GladiaError`
  puts it in the message.
- **Check for silent speech loss.** On another recording, the default config
  dropped 11 seconds of English with `status: "done"`: the words around the gap
  were stretched to cover it. `find_stretched_words()` flags any word longer than
  1.5 s ([details](FEEDBACK.md#without-code-switching-speech-can-disappear)).
- **Scale:** 3 concurrent jobs on the free plan, 25 plus a queue of 300 on paid
  plans, then `429`
  ([limits](https://docs.gladia.io/chapters/limits-and-specifications/concurrency)).
  Use a `callback` URL instead of polling, and upload once to reuse `audio_url`.
- **Cost:** Solaria-1 is €0.27 per hour and translation €0.05 per hour
  ([pricing](https://www.gladia.io/pricing)). Both jobs of this demo together cost
  under one cent.

## Files

| Path | What it is |
| --- | --- |
| [`compare.py`](compare.py) | The test: upload, two jobs, polling, report |
| [`audio/chat-v3.wav`](audio/chat-v3.wav) | The clip from the video (23 s) |
| [`responses/`](responses/) | Raw requests and responses of both jobs |
| [`WALKTHROUGH.md`](WALKTHROUGH.md) | The demo, written as a video script |
| [`FEEDBACK.md`](FEEDBACK.md) | For the Gladia team: what code-switching still gets wrong, doc gaps, API ideas |
