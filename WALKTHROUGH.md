# Walkthrough: "Gladia thinks I only speak English"

The demo written as a 2-minute YouTube video for backend and AI engineers.
The [50-second cut](https://youtu.be/ms9HPNIL2pA) is the cold open and the reveal.
Every output shown comes from [`responses/`](responses/).

**Promise:** in two minutes, you know the one field that keeps a bilingual call
fully translated, and how to test it on your own audio.

---

### 0:00 – 0:25 · Cold open

**On screen:** me, facing the camera, in a meeting. I turn to my colleague Paul
and speak French, then turn back and speak English. That is the 23-second clip,
[`audio/chat-v3.wav`](audio/chat-v3.wav).

> "So I'm speaking in English, I am in a meeting and suddenly one of my
> colleagues from France, Paul, is asking me something really important…
> *Ah, merci Paul pour les croissants. Par contre, pour le rapport, là je suis en
> meeting, on voit ça juste après, ok ? Merci.* I am switching back to English,
> but what happens to the transcript, to the translation, if you don't enable
> code switching? Let's take a look."

---

### 0:25 – 0:50 · The API in three calls

**On screen:** terminal.

```bash
uv run --env-file .env compare.py audio/chat-v3.wav --translation-model enhanced
```

**Voice-over:**
> "Gladia's pre-recorded API is three calls: upload the file, start a job, poll
> until it's done. I start two jobs on the same upload. Both ask for an English
> translation. The only difference: the second sends `language_config` with
> English and French, and `code_switching: true`."

**Callout:** the job creation answers `201`, not `200`.

---

### 0:50 – 1:20 · The reveal

**On screen:** the two outputs side by side, the French passage highlighted
(this is the animation at the top of the README).

```text
=== default ===                                  === code-switching ===
languages: en                                    languages: en, fr
00:09.7  en  merci Paul pour les croissants.     00:09.7  fr  Merci Paul pour les croissants,

en version: ... merci Paul pour les croissants.  en version: ... Thank you Paul for the croissants,
```

**Voice-over:**
> "Without code switching, Gladia picks one language for the whole file:
> English. My French is still written down, but labelled `en`, so the
> translation to English leaves it as it is. No error, `status: done`.
> With code switching on, it catches both languages, and everything comes back
> in English."

---

### 1:20 – 1:45 · What to check before you ship

**On screen:** the "Before you ship it" list from the README.

**Voice-over:**
> "Three things. Listing the languages is not enough: you need
> `code_switching: true`. Use the `enhanced` translation model. And test with
> your own speakers: one English sentence in this clip still came back labelled
> French, so check the labels before you trust them."

---

### 1:45 – 2:00 · Wrap-up

**On screen:** the repo.

> "The script, the audio and the raw responses are in the repo. Run it on one of
> your own calls: it takes two minutes and costs less than a cent."
