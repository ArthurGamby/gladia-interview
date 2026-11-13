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
| Processing time for 18.8 s of audio (one run) | 4.0 s | 3.8 s |

<details>
<summary><b>Response without <code>code_switching</code></b></summary>

Per-word timings removed, times rounded. Full file:
[`responses/chat-v3.default.response.json`](responses/chat-v3.default.response.json).

```json
{
  "id": "879cb678-4d59-449d-b58e-f636a34b4fc2",
  "status": "done",
  "result": {
    "metadata": {
      "audio_duration": 18.752,
      "transcription_time": 4,
      "billing_time": 18.752
    },
    "transcription": {
      "languages": ["en"],
      "utterances": [
        {
          "text": "So I'm speaking in English,",
          "language": "en",
          "start": 0.02,
          "end": 1.06,
          "confidence": 0.77
        },
        {
          "text": "I am in a meeting and suddenly one of my friends,",
          "language": "en",
          "start": 1.18,
          "end": 3.54,
          "confidence": 0.64
        },
        {
          "text": "one of my colleagues from France,",
          "language": "en",
          "start": 3.66,
          "end": 5.26,
          "confidence": 0.86
        },
        {
          "text": "Paul,",
          "language": "en",
          "start": 5.34,
          "end": 5.56,
          "confidence": 0.96
        },
        {
          "text": "is asking me something really important that I need to answer.",
          "language": "en",
          "start": 5.74,
          "end": 8.24,
          "confidence": 0.61
        },
        {
          "text": "Ah,",
          "language": "en",
          "start": 9.42,
          "end": 9.54,
          "confidence": 0.77
        },
        {
          "text": "merci Paul pour les croissants.",
          "language": "en",
          "start": 9.72,
          "end": 10.87,
          "confidence": 0.94
        },
        {
          "text": "Par contre,",
          "language": "en",
          "start": 10.91,
          "end": 11.27,
          "confidence": 0.82
        },
        {
          "text": "pour le rapport,",
          "language": "en",
          "start": 11.31,
          "end": 12.07,
          "confidence": 0.93
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
          "confidence": 0.92
        },
        {
          "text": "ok?",
          "language": "en",
          "start": 14.29,
          "end": 14.41,
          "confidence": 0.71
        },
        {
          "text": "Merci.",
          "language": "en",
          "start": 14.93,
          "end": 15.15,
          "confidence": 0.59
        },
        {
          "text": "I am switching back to English,",
          "language": "en",
          "start": 15.51,
          "end": 16.69,
          "confidence": 0.67
        },
        {
          "text": "but what happened to the transcript?",
          "language": "en",
          "start": 16.75,
          "end": 18.13,
          "confidence": 0.59
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
              "end": 5.26
            },
            {
              "text": "Paul,",
              "language": "en",
              "start": 5.34,
              "end": 5.56
            },
            {
              "text": "is asking me something really important that I need to answer.",
              "language": "en",
              "start": 5.74,
              "end": 8.24
            },
            {
              "text": "Ah,",
              "language": "en",
              "start": 9.42,
              "end": 9.54
            },
            {
              "text": "merci Paul pour les croissants.",
              "language": "en",
              "start": 9.72,
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
              "text": "I am switching back to English,",
              "language": "en",
              "start": 15.51,
              "end": 16.69
            },
            {
              "text": "but what happened to the transcript?",
              "language": "en",
              "start": 16.75,
              "end": 18.13
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
  "id": "c77d6ddb-c931-4232-a8bc-4fbda59e3eb3",
  "status": "done",
  "result": {
    "metadata": {
      "audio_duration": 18.752,
      "transcription_time": 3.799,
      "billing_time": 18.752
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
          "text": "I am in a meeting and suddenly",
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
          "confidence": 0.59
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
              "text": "I am in a meeting and suddenly",
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
              "text": "now,",
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
              "text": "We will look at that right after,",
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
            }
          ]
        }
      ]
    }
  }
}
```

</details>

## Try it on your own audio

You need a Gladia API key. Sign up at [app.gladia.io](https://app.gladia.io): new
accounts get €50 of free credits, about 185 hours of transcription. Then set the
key in your terminal:

```bash
export GLADIA_API_KEY="your-api-key"
```

### From your terminal, with the Gladia CLI

Install the [CLI](https://docs.gladia.io/chapters/how-to-use-gladia/cli)
(macOS and Linux; the Windows command is in the docs):

```bash
curl -fsSL https://github.com/gladiaio/gladia-cli/releases/latest/download/install.sh | sh
```

Then transcribe your file with code switching on:

```bash
gladia transcribe my-call.wav --code-switching --language en,fr -o json
```

Each utterance comes back with its own language. Two of them, from the clip
above:

```json
[
  {
    "time_begin": "4.696000",
    "time_end": "8.235000",
    "language": "en",
    "speaker": "0",
    "transcription": "from France Paul is asking me something really important that I need to answer"
  },
  {
    "time_begin": "9.724000",
    "time_end": "10.853000",
    "language": "fr",
    "speaker": "0",
    "transcription": "Merci Paul pour les croissants,"
  }
]
```

### In your code, with the SDK

Use the official [SDK](https://docs.gladia.io/chapters/how-to-use-gladia/sdk).
It takes the same settings, plus the English translation:

```bash
pip install gladiaio-sdk
```

```python
from gladiaio_sdk import GladiaClient

gladia = GladiaClient().prerecorded()
job = gladia.transcribe(
    "my-call.wav",
    {
        "language_config": {
            "languages": ["en", "fr"],
            "code_switching": True,
        },
        "translation": True,
        "translation_config": {
            "target_languages": ["en"],
            "model": "enhanced",
        },
    },
)

for utterance in job.result.transcription.utterances:
    print(utterance.language, utterance.text)

print(job.result.translation.results[0].full_transcript)
```

The client reads your key from `GLADIA_API_KEY`, uploads the file, starts the
job and waits for the result. On the clip above, it prints:

```text
en So I'm speaking in English,
en I am in a meeting and suddenly...
[...]
fr Merci Paul pour les croissants,
fr par contre...
[...]
So I'm speaking in English, [...] Thank you Paul for the croissants, on the other hand... [...]
```

<details>
<summary><b>The same in JavaScript</b></summary>

```bash
npm install @gladiaio/sdk
```

```javascript
import { GladiaClient } from "@gladiaio/sdk";

const gladia = new GladiaClient().preRecorded();
const job = await gladia.transcribe("my-call.wav", {
  language_config: {
    languages: ["en", "fr"],
    code_switching: true,
  },
  translation: true,
  translation_config: {
    target_languages: ["en"],
    model: "enhanced",
  },
});

for (const utterance of job.result.transcription.utterances) {
  console.log(utterance.language, utterance.text);
}

console.log(job.result.translation.results[0].full_transcript);
```

Save it as `transcribe.mjs`, then run `node transcribe.mjs`.

</details>

> [!TIP]
> **Or let your coding agent build it.** Gladia publishes official [skills](https://github.com/gladiaio/skills) that teach coding agents its SDK. Add them, then paste this prompt into your agent. With Claude Code, it built a side-by-side page of both results in about two minutes.
>
> ```bash
> npx skills add gladiaio/skills
> ```
>
> ```text
> My Gladia API key is in GLADIA_API_KEY. Transcribe my-call.wav twice:
> once with default settings, once with code switching for English and
> French. Ask for an English translation both times. Then build
> compare.html: both results side by side, one line per utterance with
> its time and language, one color per language, and the English
> translation underneath. Run it and open the page.
> ```

## The three API calls

The SDK makes these calls for you. Here they are with `curl`, if you call the
API directly.

<details>
<summary><b>1. Upload the file once</b>: <code>POST /v2/upload</code></summary>

```bash
curl -X POST https://api.gladia.io/v2/upload \
  -H "x-gladia-key: $GLADIA_API_KEY" \
  -F "audio=@audio/chat-v3.wav"
```

```json
{
  "audio_url": "https://api.gladia.io/file/ed2ec1a5-090c-4104-a4c2-95f207438c65",
  "audio_metadata": {
    "audio_duration": 18.752
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
    "audio_url": "https://api.gladia.io/file/ed2ec1a5-090c-4104-a4c2-95f207438c65",
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
  "id": "c77d6ddb-c931-4232-a8bc-4fbda59e3eb3",
  "result_url": "https://api.gladia.io/v2/pre-recorded/c77d6ddb-c931-4232-a8bc-4fbda59e3eb3"
}
```

The "without" job sends the same body minus `language_config`. Both request
bodies are saved in [`responses/`](responses/).

</details>

<details>
<summary><b>3. Poll until <code>status</code> is <code>done</code></b>: <code>GET /v2/pre-recorded/:id</code></summary>

```bash
curl https://api.gladia.io/v2/pre-recorded/c77d6ddb-c931-4232-a8bc-4fbda59e3eb3 \
  -H "x-gladia-key: $GLADIA_API_KEY"
```

`status` goes `queued`, `processing`, then `done` (or `error`). The transcript is
in `result.transcription` and the English version in `result.translation`: both
responses are under [Before / after](#before--after).

</details>

## Before you ship it

- **Keep the default model for mixed-language audio.** Code switching works with
  Solaria-1, the default. Solaria-3 does not support it
  ([models](https://docs.gladia.io/chapters/introduction/models)).
- **Pick the `enhanced` translation model.** It keeps each translated sentence
  with its own utterance. For natural wording, add `"informal": true` and a
  short `context`
  ([options](https://docs.gladia.io/chapters/audio-intelligence/translation)).
- **Calling the API yourself?** A new job answers `201 Created`, so check for
  any `2xx`, not only `200`. Retry only `429` and `5xx`, with backoff: each
  accepted `POST` starts its own job. The SDK does both for you.
- **Log the `request_id`.** Jobs and errors both carry one: quote it when you
  contact support.
- **Check for silent speech loss.** On another recording, the default config
  dropped 11 seconds of English with `status: "done"`: the words around the gap
  were stretched to cover it. A single word that lasts more than 1.5 s is the
  clue to look for
  ([details](FEEDBACK.md#without-code-switching-speech-can-disappear)).
- **Scale:** 3 concurrent jobs on the free plan, 25 plus a queue of 300 on paid
  plans, then `429`
  ([limits](https://docs.gladia.io/chapters/limits-and-specifications/concurrency)).
  Use a `callback` URL instead of polling, and upload once to reuse `audio_url`.
- **Cost:** your first tests fit in the free credits of a new account.
  Production prices are on the [pricing page](https://www.gladia.io/pricing).

## Files

| Path | What it is |
| --- | --- |
| [`compare.py`](compare.py) | The script behind the before / after comparison |
| [`audio/chat-v3.wav`](audio/chat-v3.wav) | The clip from the video (19 s) |
| [`responses/`](responses/) | Raw requests and responses of both jobs |
| [`assets/code-switching.mp4`](assets/code-switching.mp4) | The animation at the top, as a silent 1080p MP4 for X or LinkedIn |
| [`WALKTHROUGH.md`](WALKTHROUGH.md) | The 50-second video, shot by shot |
| [`FEEDBACK.md`](FEEDBACK.md) | For the Gladia team: what I observed, doc gaps, two API ideas |
| [`devrel-plan/PLAN.md`](devrel-plan/PLAN.md) | Part 2 of the case study: my first 90 days as Gladia's first DevRel |
