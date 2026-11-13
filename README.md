# When your users switch languages mid-call

![The same audio through both configs. Without code_switching, the French line is labelled en and stays in French. With it, the line is labelled fr and translated.](assets/code-switching.gif)

<a href="https://youtu.be/ms9HPNIL2pA"><img src="assets/youtube.svg" height="16" align="absmiddle" alt=""> Watch the real example on YouTube (50 s)</a>

By default, Gladia's pre-recorded API detects **one** language and puts it on
every utterance of the file. In this English call with a French aside, the
French is still transcribed, but it is labelled `en`, so the translation to
English skips it. You get French in your English transcript, with
`status: "done"` and no error.

**The fix is one field:**

```json
{
  "language_config": {
    "languages": ["en", "fr"],
    "code_switching": true
  }
}
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
| Processing time for 23.3 s of audio (one run) | 3.5 s | 2.7 s |

<details>
<summary><b>Response without <code>code_switching</code></b></summary>

Per-word timings removed, times rounded. Full file:
[`responses/chat-v3.default.response.json`](responses/chat-v3.default.response.json).

```json
{
  "id": "24117033-619d-4830-a99b-aec3ce763196",
  "status": "done",
  "result": {
    "metadata": {
      "audio_duration": 23.328,
      "transcription_time": 3.476,
      "billing_time": 23.328
    },
    "transcription": {
      "languages": ["en"],
      "utterances": [
        {
          "text": "So I'm speaking in English,",
          "language": "en",
          "start": 0.02,
          "end": 1.06,
          "confidence": 0.75
        },
        {
          "text": "I am in a meeting and suddenly one of my friends,",
          "language": "en",
          "start": 1.18,
          "end": 3.54,
          "confidence": 0.62
        },
        {
          "text": "one of my colleagues from France,",
          "language": "en",
          "start": 3.66,
          "end": 5.27,
          "confidence": 0.86
        },
        {
          "text": "Paul,",
          "language": "en",
          "start": 5.35,
          "end": 5.57,
          "confidence": 0.98
        },
        {
          "text": "is asking me something really important that I need to answer.",
          "language": "en",
          "start": 5.75,
          "end": 8.25,
          "confidence": 0.64
        },
        {
          "text": "Ah,",
          "language": "en",
          "start": 9.43,
          "end": 9.55,
          "confidence": 0.8
        },
        {
          "text": "merci Paul pour les croissants.",
          "language": "en",
          "start": 9.73,
          "end": 10.87,
          "confidence": 0.92
        },
        {
          "text": "Par contre,",
          "language": "en",
          "start": 10.91,
          "end": 11.27,
          "confidence": 0.81
        },
        {
          "text": "pour le rapport,",
          "language": "en",
          "start": 11.31,
          "end": 12.07,
          "confidence": 0.94
        },
        {
          "text": "là je suis en meeting,",
          "language": "en",
          "start": 12.19,
          "end": 13.13,
          "confidence": 0.55
        },
        {
          "text": "on voit ça juste après,",
          "language": "en",
          "start": 13.29,
          "end": 14.17,
          "confidence": 0.9
        },
        {
          "text": "ok?",
          "language": "en",
          "start": 14.29,
          "end": 14.41,
          "confidence": 0.89
        },
        {
          "text": "Merci.",
          "language": "en",
          "start": 14.93,
          "end": 15.15,
          "confidence": 0.69
        },
        {
          "text": "I am switching back to English but what happens to the transcript,",
          "language": "en",
          "start": 15.51,
          "end": 18.14,
          "confidence": 0.7
        },
        {
          "text": "to the translation if you don't enable code switching?",
          "language": "en",
          "start": 18.26,
          "end": 20.96,
          "confidence": 0.74
        },
        {
          "text": "Let's take a look.",
          "language": "en",
          "start": 22.05,
          "end": 22.66,
          "confidence": 0.49
        }
      ]
    },
    "translation": {
      "results": [
        {
          "languages": ["en"],
          "utterances": [
            {
              "text": "So I'm speaking in English,",
              "language": "en",
              "start": 0.02,
              "end": 1.06
            },
            {
              "text": "I am in a meeting and suddenly one of my friends,",
              "language": "en",
              "start": 1.18,
              "end": 3.54
            },
            {
              "text": "one of my colleagues from France,",
              "language": "en",
              "start": 3.66,
              "end": 5.27
            },
            {
              "text": "Paul,",
              "language": "en",
              "start": 5.35,
              "end": 5.57
            },
            {
              "text": "is asking me something really important that I need to answer.",
              "language": "en",
              "start": 5.75,
              "end": 8.25
            },
            {
              "text": "Ah,",
              "language": "en",
              "start": 9.43,
              "end": 9.55
            },
            {
              "text": "merci Paul pour les croissants.",
              "language": "en",
              "start": 9.73,
              "end": 10.87
            },
            {
              "text": "Par contre,",
              "language": "en",
              "start": 10.91,
              "end": 11.27
            },
            {
              "text": "pour le rapport,",
              "language": "en",
              "start": 11.31,
              "end": 12.07
            },
            {
              "text": "là je suis en meeting,",
              "language": "en",
              "start": 12.19,
              "end": 13.13
            },
            {
              "text": "on voit ça juste après,",
              "language": "en",
              "start": 13.29,
              "end": 14.17
            },
            {
              "text": "ok?",
              "language": "en",
              "start": 14.29,
              "end": 14.41
            },
            {
              "text": "Merci.",
              "language": "en",
              "start": 14.93,
              "end": 15.15
            },
            {
              "text": "I am switching back to English but what happens to the transcript,",
              "language": "en",
              "start": 15.51,
              "end": 18.14
            },
            {
              "text": "to the translation if you don't enable code switching?",
              "language": "en",
              "start": 18.26,
              "end": 20.96
            },
            {
              "text": "Let's take a look.",
              "language": "en",
              "start": 22.05,
              "end": 22.66
            }
          ]
        }
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Response with <code>code_switching</code></b></summary>

Per-word timings removed, times rounded. Full file:
[`responses/chat-v3.code-switching.response.json`](responses/chat-v3.code-switching.response.json).

```json
{
  "id": "838caaac-0b96-4980-9bf2-3b505ee77c6b",
  "status": "done",
  "result": {
    "metadata": {
      "audio_duration": 23.328,
      "transcription_time": 2.671,
      "billing_time": 23.328
    },
    "transcription": {
      "languages": ["en", "fr"],
      "utterances": [
        {
          "text": "So I'm speaking in English,",
          "language": "en",
          "start": 0.02,
          "end": 1.07,
          "confidence": 0.6
        },
        {
          "text": "I am in a meeting and suddenly...",
          "language": "en",
          "start": 1.19,
          "end": 2.62,
          "confidence": 0.45
        },
        {
          "text": "One of my friends,",
          "language": "en",
          "start": 2.84,
          "end": 3.55,
          "confidence": 0.93
        },
        {
          "text": "one of my colleague,",
          "language": "en",
          "start": 3.67,
          "end": 4.46,
          "confidence": 0.93
        },
        {
          "text": "From France Paul is asking me something really important that I need to answer.",
          "language": "en",
          "start": 4.7,
          "end": 8.23,
          "confidence": 0.86
        },
        {
          "text": "Merci Paul pour les croissants,",
          "language": "fr",
          "start": 9.72,
          "end": 10.85,
          "confidence": 0.73
        },
        {
          "text": "par contre...",
          "language": "fr",
          "start": 10.89,
          "end": 11.26,
          "confidence": 0.26
        },
        {
          "text": "Pour le rapport,",
          "language": "fr",
          "start": 11.32,
          "end": 12.08,
          "confidence": 0.95
        },
        {
          "text": "là,",
          "language": "fr",
          "start": 12.2,
          "end": 12.32,
          "confidence": 0.99
        },
        {
          "text": "je suis en meeting.",
          "language": "fr",
          "start": 12.34,
          "end": 13.12,
          "confidence": 0.52
        },
        {
          "text": "On voit ça juste après,",
          "language": "fr",
          "start": 13.3,
          "end": 14.19,
          "confidence": 0.93
        },
        {
          "text": "OK ?",
          "language": "fr",
          "start": 14.29,
          "end": 14.41,
          "confidence": 0.5
        },
        {
          "text": "Merci.",
          "language": "fr",
          "start": 14.92,
          "end": 15.17,
          "confidence": 0.82
        },
        {
          "text": "I am switching back to English but what happened to the transcript?",
          "language": "en",
          "start": 15.49,
          "end": 18.15,
          "confidence": 0.58
        },
        {
          "text": "to the translation if you don't enable code switching.",
          "language": "fr",
          "start": 18.27,
          "end": 20.95,
          "confidence": 0.68
        },
        {
          "text": "Let's take a look.",
          "language": "en",
          "start": 22.03,
          "end": 22.64,
          "confidence": 0.35
        }
      ]
    },
    "translation": {
      "results": [
        {
          "languages": ["en"],
          "utterances": [
            {
              "text": "So I'm speaking in English,",
              "language": "en",
              "start": 0.02,
              "end": 1.07
            },
            {
              "text": "I am in a meeting and suddenly...",
              "language": "en",
              "start": 1.19,
              "end": 2.62
            },
            {
              "text": "One of my friends,",
              "language": "en",
              "start": 2.84,
              "end": 3.55
            },
            {
              "text": "one of my colleague,",
              "language": "en",
              "start": 3.67,
              "end": 4.46
            },
            {
              "text": "From France Paul is asking me something really important that I need to answer.",
              "language": "en",
              "start": 4.7,
              "end": 8.23
            },
            {
              "text": "Thank you Paul for the croissants,",
              "language": "en",
              "start": 9.72,
              "end": 10.85
            },
            {
              "text": "on the other hand...",
              "language": "en",
              "start": 10.89,
              "end": 11.26
            },
            {
              "text": "Regarding the report,",
              "language": "en",
              "start": 11.32,
              "end": 12.08
            },
            {
              "text": "there,",
              "language": "en",
              "start": 12.2,
              "end": 12.32
            },
            {
              "text": "I am in a meeting.",
              "language": "en",
              "start": 12.34,
              "end": 13.12
            },
            {
              "text": "We will look at that shortly,",
              "language": "en",
              "start": 13.3,
              "end": 14.19
            },
            {
              "text": "OK?",
              "language": "en",
              "start": 14.29,
              "end": 14.41
            },
            {
              "text": "Thank you.",
              "language": "en",
              "start": 14.92,
              "end": 15.17
            },
            {
              "text": "I am switching back to English but what happened to the transcript?",
              "language": "en",
              "start": 15.49,
              "end": 18.15
            },
            {
              "text": "to the translation if you do not enable code switching.",
              "language": "en",
              "start": 18.27,
              "end": 20.95
            },
            {
              "text": "Let's take a look.",
              "language": "en",
              "start": 22.03,
              "end": 22.64
            }
          ]
        }
      ]
    }
  }
}
```

</details>

## Run it (2 minutes)

You need two things, both free:

- **A Gladia API key.** Sign up at [app.gladia.io](https://app.gladia.io): new
  accounts get €50 of free credits, about 185 hours of transcription. This test
  uses less than a minute.
- **[uv](https://docs.astral.sh/uv/getting-started/installation/)**, a fast tool
  that runs Python scripts. `uv run` installs what the script needs (here,
  `httpx`) in a separate environment, so there is nothing else to set up.

1. Clone the repo:

   ```bash
   git clone https://github.com/ArthurGamby/gladia-interview.git
   cd gladia-interview
   ```

2. Add your key:

   ```bash
   export GLADIA_API_KEY="your-api-key"
   ```

3. Run the test:

   ```bash
   uv run compare.py audio/chat-v3.wav
   ```

The script uploads the file once, starts both jobs, then prints each utterance
with its language, and the English version. Here is the part that changes.

**Without `code_switching`**, the French line is labelled `en` and stays in French:

```text
languages: en | audio 23.3s | transcribed in 3.5s | billed 23.3s
00:09.7  en  merci Paul pour les croissants.
00:10.9  en  Par contre,
...
en version: ... Ah, merci Paul pour les croissants. Par contre, pour le rapport,
là je suis en meeting, on voit ça juste après, ok? Merci. I am switching back...
```

**With `code_switching`**, it is labelled `fr` and translated:

```text
languages: en, fr | audio 23.3s | transcribed in 2.7s | billed 23.3s
00:09.7  fr  Merci Paul pour les croissants,
00:10.9  fr  par contre...
...
en version: ... Thank you Paul for the croissants, on the other hand... Regarding
the report, there, I am in a meeting. We will look at that shortly, OK? Thank you.
```

### On your own file

```bash
uv run compare.py my-call.m4a --languages en es
```

| Option | What it does |
| --- | --- |
| `--languages en es` | Languages spoken in the file (default: `en fr`) |
| `--translate-to fr` | Language of the translation (default: `en`) |
| `--translation-model base` | Translation model (default: `enhanced`) |
| `--no-translation` | Transcription only |
| `--subtitles` | Also save `.srt` subtitles |
| `--out my-folder` | Where the requests and responses are saved (default: `responses/`) |

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
  "audio_metadata": {
    "audio_duration": 23.328
  }
}
```

Let curl (`-F`) or your HTTP library write the `Content-Type` header: it adds
the multipart boundary the API needs. Both jobs reuse the same `audio_url`.

</details>

<details>
<summary><b>2. Start a job</b>: <code>POST /v2/pre-recorded</code>, answers <code>201</code></summary>

```bash
curl -X POST https://api.gladia.io/v2/pre-recorded \
  -H "x-gladia-key: $GLADIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://api.gladia.io/file/ab89dd88-a15b-43fa-a370-2b6f2484cb6e",
    "language_config": {
      "languages": ["en", "fr"],
      "code_switching": true
    },
    "translation": true,
    "translation_config": {
      "target_languages": ["en"],
      "model": "enhanced"
    }
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

`status` goes `queued`, `processing`, then `done` (or `error`). The transcript is
in `result.transcription` and the English version in `result.translation`: both
responses are under [Before / after](#before--after).

</details>

## Before you ship it

- **Pick the `enhanced` translation model** (the script's default). It keeps
  each translated sentence with its own utterance. For natural wording, add
  `"informal": true` and a short `context` (the video does).
- **A new job answers `201 Created`.** Check for any `2xx`, not only `200`.
- **Retry only what failed.** Each accepted `POST` starts its own job, so
  `send()` retries only `429` and `5xx`, with backoff, jitter and `Retry-After`.
- **Log the `request_id`.** It is the first thing support asks for, and
  `GladiaError` puts it in the message.
- **Check for silent speech loss.** On another recording, the default config
  dropped 11 seconds of English with `status: "done"`: the words around the gap
  were stretched to cover it. `find_stretched_words()` flags any word longer than
  1.5 s ([details](FEEDBACK.md#without-code-switching-speech-can-disappear)).
- **Scale:** 3 concurrent jobs on the free plan, 25 plus a queue of 300 on paid
  plans, then `429`
  ([limits](https://docs.gladia.io/chapters/limits-and-specifications/concurrency)).
  Use a `callback` URL instead of polling, and upload once to reuse `audio_url`.
- **Cost:** this demo is covered by the free credits of a new account. Production
  prices are on the [pricing page](https://www.gladia.io/pricing).

## Files

| Path | What it is |
| --- | --- |
| [`compare.py`](compare.py) | The test: upload, two jobs, polling, report |
| [`audio/chat-v3.wav`](audio/chat-v3.wav) | The clip from the video (23 s) |
| [`responses/`](responses/) | Raw requests and responses of both jobs |
| [`WALKTHROUGH.md`](WALKTHROUGH.md) | The demo, written as a video script |
| [`FEEDBACK.md`](FEEDBACK.md) | For the Gladia team: what I observed, doc gaps, two API ideas |
| [`devrel-plan/PLAN.md`](devrel-plan/PLAN.md) | Part 2 of the case study: my first 90 days as Gladia's first DevRel |
