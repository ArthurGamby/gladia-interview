# /// script
# requires-python = ">=3.10"
# dependencies = ["httpx>=0.27"]
# ///
"""Transcribe one audio file twice with Gladia and compare the results.

  default         no language_config: the language is detected on the first
                  utterance, then reused as the label of every utterance.
  code-switching  the language is re-detected on every utterance.

Both requests ask for the same translation, so the only difference between
them is `language_config`. The report also flags words stretched over several
seconds: that is how dropped speech shows up, since the API returns no error.

Usage:
    export GLADIA_API_KEY="your-api-key"
    uv run compare.py audio/chat-v3.wav
    uv run compare.py my-call.m4a --languages en es
"""

from __future__ import annotations

import argparse
import json
import os
import random
import sys
import time
from pathlib import Path

import httpx

API_URL = "https://api.gladia.io"
POLL_INTERVAL_S = 1.0
POLL_TIMEOUT_S = 300
MAX_RETRIES = 4
RETRYABLE_STATUS = {429, 500, 502, 503, 504}
MAX_WORD_S = 1.5  # a spoken word longer than this is suspicious
COLORS = ["\033[36m", "\033[35m", "\033[33m", "\033[32m"]
RESET = "\033[0m"


class GladiaError(RuntimeError):
    """An error response from the Gladia API, with the id support will ask for."""

    def __init__(self, response: httpx.Response) -> None:
        try:
            body = response.json()
        except ValueError:
            body = {}
        message = body.get("message") or response.text[:200] or response.reason_phrase
        details = "; ".join(body.get("validation_errors") or [])
        request = response.request
        text = f"{request.method} {request.url.path} -> {response.status_code}: {message}"
        if details:
            text += f" ({details})"
        if body.get("request_id"):
            text += f" [request_id={body['request_id']}]"
        super().__init__(text)


def send(client: httpx.Client, method: str, url: str, **kwargs) -> httpx.Response:
    """Send a request, retrying 429 and 5xx with exponential backoff and jitter.

    Only responses that prove the request was NOT accepted are retried. A
    timeout on POST /v2/pre-recorded is ambiguous: Gladia does not deduplicate
    jobs, so a blind retry could create (and bill) a second one. It is left to
    raise so the caller can decide.
    """
    for attempt in range(MAX_RETRIES + 1):
        response = client.request(method, url, **kwargs)
        if response.status_code not in RETRYABLE_STATUS or attempt == MAX_RETRIES:
            break
        retry_after = response.headers.get("retry-after", "")
        delay = float(retry_after) if retry_after.isdigit() else min(2**attempt, 20)
        time.sleep(delay + random.random())
    if response.is_error:
        raise GladiaError(response)
    return response


def upload(client: httpx.Client, path: Path) -> dict:
    """Upload a local file and return its `audio_url` and metadata."""
    # Let httpx build the multipart body. Setting Content-Type by hand drops
    # the boundary and the API answers 400.
    files = {"audio": (path.name, path.read_bytes())}
    return send(client, "POST", "/v2/upload", files=files).json()


def create_job(client: httpx.Client, audio_url: str, options: dict) -> str:
    """Start a transcription job and return its id."""
    response = send(client, "POST", "/v2/pre-recorded", json={"audio_url": audio_url, **options})
    job = response.json()
    print(f"  POST /v2/pre-recorded -> {response.status_code}  job {job['id']}")
    return job["id"]


def wait_for(client: httpx.Client, job_id: str) -> dict:
    """Poll a job until it is done. In production, prefer a callback or a webhook."""
    deadline = time.monotonic() + POLL_TIMEOUT_S
    while True:
        job = send(client, "GET", f"/v2/pre-recorded/{job_id}").json()
        if job["status"] == "done":
            return job
        if job["status"] == "error":
            raise RuntimeError(
                f"job {job_id} failed: error_code={job.get('error_code')} "
                f"request_id={job.get('request_id')}"
            )
        if time.monotonic() > deadline:
            raise TimeoutError(f"job {job_id} still {job['status']} after {POLL_TIMEOUT_S}s")
        time.sleep(POLL_INTERVAL_S)


def build_configs(
    languages: list[str], translate_to: str | None, translation_model: str = "enhanced"
) -> dict[str, dict]:
    """The two request bodies to compare (without `audio_url`).

    They are identical except for `language_config`.
    """
    shared: dict = {}
    if translate_to:
        shared = {
            "translation": True,
            "translation_config": {"target_languages": [translate_to], "model": translation_model},
        }
    return {
        "default": {**shared},
        "code-switching": {
            "language_config": {"languages": languages, "code_switching": True},
            **shared,
        },
    }


def timestamp(seconds: float) -> str:
    return f"{int(seconds // 60):02d}:{seconds % 60:04.1f}"


def print_report(name: str, job: dict, use_color: bool) -> None:
    """Print one line per utterance: start time, detected language, text."""
    result = job["result"]
    transcription = result["transcription"]
    metadata = result["metadata"]
    translations = (result.get("translation") or {}).get("results") or []
    palette: dict[str, str] = {}

    def tag(language: str) -> str:
        color = palette.setdefault(language, COLORS[len(palette) % len(COLORS)])
        return f"{color}{language}{RESET}" if use_color else language

    print(f"\n=== {name} ===")
    print(
        f"languages: {', '.join(transcription['languages'])} | "
        f"audio {metadata['audio_duration']:.1f}s | "
        f"transcribed in {metadata['transcription_time']:.1f}s | "
        f"billed {metadata['billing_time']:.1f}s"
    )
    utterances = transcription["utterances"]
    for utterance in utterances:
        print(f"{timestamp(utterance['start'])}  {tag(utterance['language'])}  {utterance['text'].strip()}")
    # Translated utterances are not shown one by one: even with
    # `match_original_utterances` (the default), their text spills across
    # utterance boundaries. The full translated transcript reads correctly.
    for translation in translations:
        print(f"\n{', '.join(translation['languages'])} version: {translation['full_transcript']}")
    for warning in find_stretched_words(utterances):
        print(f"\nwarning: {warning}")


def find_stretched_words(utterances: list[dict], max_seconds: float = MAX_WORD_S) -> list[str]:
    """Flag words that last far longer than anyone speaks a word.

    When speech in an unexpected language is dropped, the neighbouring words are
    stretched over the gap, and they keep a high confidence. The API returns no
    error, so this timing check is the cheapest way to notice missing speech.
    """
    warnings = []
    for utterance in utterances:
        for word in utterance["words"]:
            duration = word["end"] - word["start"]
            if duration > max_seconds:
                warnings.append(
                    f"{word['word'].strip()!r} lasts {duration:.1f}s at {timestamp(word['start'])} "
                    f"(confidence {word['confidence']:.2f}): speech is probably missing there"
                )
    return warnings


def subtitle_files(job: dict) -> dict[str, str]:
    """SRT subtitles found in a job, keyed by file suffix ("" or ".<lang>")."""
    result = job["result"]
    sources = [("", result["transcription"])]
    for translation in (result.get("translation") or {}).get("results") or []:
        sources.append(("." + "-".join(translation["languages"]), translation))
    return {
        suffix: subtitle["subtitles"]
        for suffix, source in sources
        for subtitle in source.get("subtitles") or []
        if subtitle["format"] == "srt"
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("audio", type=Path, help="local audio or video file")
    parser.add_argument("--languages", nargs="+", default=["en", "fr"], metavar="CODE",
                        help="languages you expect in the audio (default: en fr)")
    parser.add_argument("--translate-to", default="en", metavar="CODE",
                        help="target language of the translation (default: en)")
    parser.add_argument("--translation-model", default="enhanced", choices=["base", "enhanced"],
                        help="translation model (default: enhanced)")
    parser.add_argument("--no-translation", action="store_true", help="skip the translation add-on")
    parser.add_argument("--subtitles", action="store_true",
                        help="also save .srt subtitles (original and translated) in --out")
    parser.add_argument("--out", type=Path, default=Path("responses"),
                        help="folder for the raw API requests and responses (default: responses)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    api_key = os.environ.get("GLADIA_API_KEY")
    if not api_key:
        print("GLADIA_API_KEY is not set. Get a free key at https://app.gladia.io, then run:\n"
              '  export GLADIA_API_KEY="your-api-key"', file=sys.stderr)
        return 2
    if not args.audio.is_file():
        print(f"No such file: {args.audio}", file=sys.stderr)
        return 2

    configs = build_configs(
        args.languages, None if args.no_translation else args.translate_to, args.translation_model
    )
    if args.subtitles:
        for options in configs.values():
            options.update({"subtitles": True, "subtitles_config": {"formats": ["srt"]}})
    use_color = sys.stdout.isatty() and "NO_COLOR" not in os.environ
    args.out.mkdir(parents=True, exist_ok=True)
    timeout = httpx.Timeout(30.0, read=120.0, write=120.0)

    try:
        with httpx.Client(base_url=API_URL, headers={"x-gladia-key": api_key}, timeout=timeout) as client:
            uploaded = upload(client, args.audio)
            duration = uploaded["audio_metadata"]["audio_duration"]
            print(f"Uploaded {args.audio.name} ({duration:.1f}s)")

            # Both jobs reuse the same uploaded file and run in parallel on Gladia's side.
            job_ids = {
                name: create_job(client, uploaded["audio_url"], options)
                for name, options in configs.items()
            }
            for name, job_id in job_ids.items():
                job = wait_for(client, job_id)
                stem = f"{args.audio.stem}.{name}"
                (args.out / f"{stem}.request.json").write_text(
                    json.dumps({"audio_url": uploaded["audio_url"], **configs[name]}, indent=2) + "\n"
                )
                (args.out / f"{stem}.response.json").write_text(
                    json.dumps(job, indent=2, ensure_ascii=False) + "\n"
                )
                print_report(name, job, use_color)
                for suffix, text in subtitle_files(job).items():
                    (args.out / f"{stem}{suffix}.srt").write_text(text)
    except (GladiaError, httpx.HTTPError, RuntimeError, TimeoutError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    print(f"\nRaw requests and responses saved in {args.out}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
