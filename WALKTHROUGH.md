# Walkthrough: "Gladia thinks I only speak English"

The [50-second video](https://youtu.be/ms9HPNIL2pA), shot by shot. One bilingual
clip, sent twice to Gladia's pre-recorded API. The two requests differ by one
field: `code_switching`.

**About the format:** this video is made for fast feeds like X, which is why it
is one of the [post drafts](devrel-plan/CONTENT-IDEAS.md#seven-posts-already-drafted).
YouTube only hosts it, so you can watch it in high quality. A YouTube video
would be longer, with an intro and a conclusion.

---

### 0:00 – 0:22 · The example

**On screen:** me on camera, in a meeting. A badge at the bottom shows the
language I am speaking: English, then French, then English again.

> "So I'm speaking in English, I am in a meeting and suddenly one of my
> colleagues from France, Paul, is asking me something really important that I
> need to answer. *Ah, merci Paul pour les croissants. Par contre, pour le
> rapport, là je suis en meeting, on voit ça juste après, ok ? Merci.* I am
> switching back to English, but what happens to the transcript, to the
> translation, if you don't enable code switching? Let's take a look."

As I ask the question, a request card builds up on the right:
`POST /v2/pre-recorded` with the translation on and `"languages": ["en", "fr"]`,
then `"code_switching": false`, then `"code_switching": true`.

---

### 0:22 – 0:34 · The replay

**On screen:** the same passage plays again in a small window. Next to it, two
boxes write Gladia's English translation word by word, one box per request.

- **Left, `"code_switching": false`:** Gladia detects English for the whole
  file, so my French stays in French.
- **Right, `"code_switching": true`:** Gladia detects English, then French as
  soon as I switch. "Translating French → English" appears under the box, and
  the French passage comes back in English.

---

### 0:34 – 0:44 · The comment

**On screen:** I come back in the window. Each box lights up as I talk about it:
"English only" and "Not translated" on the left, "English + French" and
"Translated to English" on the right.

> "As you can see, without code switching, Gladia thinks I only speak English.
> With code switching on, it catches both languages, and everything comes back
> in English."

---

### 0:44 – 0:50 · End card

**On screen:** "Your users switch languages. Your transcript should too. One
field in your API request." Then the `"code_switching": true` field and a
**Try it in the docs →** button, pointing to docs.gladia.io.

---

The [README](README.md) goes further: [the three API calls](README.md#the-three-api-calls),
[what to check before you ship](README.md#before-you-ship-it) and how to
[try it on your own audio](README.md#try-it-on-your-own-audio).
