# Walkthrough: "Your transcript just deleted 10 seconds of my call"

A written demo, as it would run in a 3-minute YouTube video. Every output shown
on screen is real and comes from [`responses/`](responses/).

**Audience:** backend and AI engineers adding transcription to a product.
**Promise:** in three minutes, you will know the one field that keeps multilingual
audio intact, and how to detect when it is missing.

---

### 0:00 – 0:15 · Cold open

**On screen:** webcam. I'm on a call, I turn to my left, I speak French, I turn
back, I speak English. The Gladia transcript appears as subtitles underneath.
Then it freezes on a gap: ten seconds of me talking, no subtitles.

**Voice-over:**
> "Ten seconds of this call just disappeared from the transcript. No error, no
> warning, the job says *done*. Let me show you why, and the one line that fixes
> it."

---

### 0:15 – 0:35 · The setup

**On screen:** [`audio/call-script.md`](audio/call-script.md), then the four-row
table from the README.

**Voice-over:**
> "Here's a situation every international team knows. I'm on a call with John,
> a client who speaks English. My colleague Paul sits next to me and speaks
> French. So I switch: French to Paul, English to John, back and forth. One
> voice, one mic, forty seconds. Real voice, not text-to-speech: my accent is part
> of the test."

---

### 0:35 – 1:05 · The API in three calls

**On screen:** terminal, then `compare.py` scrolling past `upload()`,
`create_job()`, `wait_for()`.

```bash
uv run --env-file .env compare.py audio/call-take2.aifc
```

```text
Uploaded call-take2.aifc (38.8s)
  POST /v2/pre-recorded -> 201  job 8985dcf9-a813-4843-9bf7-efb959c1a394
  POST /v2/pre-recorded -> 201  job eff588af-42af-4759-a98b-7a76d42b65c0
```

**Voice-over:**
> "Gladia's async API is three calls. Upload the file once. Start a job. Poll
> until it's done. I start *two* jobs on the same upload. Both ask for an English
> translation. The only difference: the second one sends `language_config` with
> English and French, and `code_switching: true`. Forty seconds of audio, back in
> under four seconds."

**Callout on screen:** `201`, not `200`. "The retry guide says 200. Test for 201,
or you'll resubmit, and every resubmission is billed."

---

### 1:05 – 1:45 · The reveal

**On screen:** the two transcripts side by side. Highlight the gap on the left,
between `00:03.7` and `00:14.9`.

```text
=== default ===                       === code-switching ===
00:03.7  fr  je reviens vers toi.     00:02.9  fr  je lui fais le point et je reviens vers toi.
                                      00:05.7  en  Hello John,
                                      00:06.4  en  thank you for joining the call.
                                      00:07.9  en  Good news about the logging bug,
                                      00:09.5  en  we solved it
00:14.9  fr  Dis-moi Paul,            ...
```

**Voice-over:**
> "Left: no language config. Gladia settles on one language for the whole file,
> French here, and everything I said to John is gone.
> And the end of the call? 'He's on it' came back as '*il est sur le point*'.
> It got translated into French instead of transcribed.
> Right: same audio, one extra field. Every utterance is re-detected, tagged `fr`
> or `en`, and John's part is back."

---

### 1:45 – 2:15 · How to catch it in production

**On screen:** the JSON of the default job, word timings highlighted. Then the
warnings printed by the script.

```json
{ "word": " reviens", "start": 3.774, "end": 9.738, "confidence": 0.99 }
```

```text
warning: 'reviens' lasts 6.0s at 00:03.8 (confidence 0.99): speech is probably missing there
```

**Voice-over:**
> "Here's the scary part. The French word *reviens* (two syllables) lasts six
> seconds, with 99% confidence. That's how the missing speech hides: the
> neighbouring words stretch over the gap. Nobody says a word for six seconds, so
> flag anything over a second and a half. A dozen lines of code, and it's in the
> repo."

---

### 2:15 – 2:40 · What's still not perfect

**On screen:** the "What code-switching still gets wrong" list from the README.

**Voice-over:**
> "Code-switching isn't magic, and I'd rather you hear it from me. A word right at
> a language switch can drop: I lost 'Paul, he'. One English sentence came back in
> French, but with a confidence of 0.35, so you can catch it. And short accented
> phrases at the very start of a file are fragile: my first take opened in
> English and got misread. So test with *your* audio, *your* speakers. That's
> exactly what this script is for."

---

### 2:40 – 3:00 · Wrap-up

**On screen:** the three takeaways, then the repo link.

**Voice-over:**
> "Three things. One: if your audio can switch languages, send `language_config`
> with the languages you expect and `code_switching: true`. Two: check word
> durations and utterance confidence, because failures here are silent. Three:
> retry only what was refused, since Gladia bills every accepted job. The script,
> the audio and the raw responses are in the repo. Run it on your own calls
> before your users do."

---

## Production notes for the video

- **Footage:** webcam take of the same script, head turned left for Paul, facing
  the camera for John. The audio of this take is what goes through the API, so
  the subtitles on screen are the real output.
- **Subtitles:** add `"subtitles": true, "subtitles_config": {"formats": ["srt"]}`
  to both jobs, then burn each `.srt` into a copy of the video with
  `ffmpeg -i call.mov -vf subtitles=default.srt default.mp4`. A split screen of
  the two files makes the gap visible without any narration.
- **Length:** 3 minutes for YouTube, and a 30-second vertical cut (cold open, the
  reveal, the one-line fix) for Shorts, LinkedIn and X.
