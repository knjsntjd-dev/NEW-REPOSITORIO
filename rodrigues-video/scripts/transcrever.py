"""Transcreve um WAV 16 kHz mono em PT-BR com Whisper (sherpa-onnx) e gera
legendas palavra a palavra no formato Caption do Remotion.

uso: python transcribe.py <models_dir> <audio.wav> <saida.json>
"""
import json
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

models, wav_path, out_path = sys.argv[1:4]
turbo = f"{models}/sherpa-onnx-whisper-turbo"

audio, sr = sf.read(wav_path, dtype="float32")
assert sr == 16000

vad_cfg = sherpa_onnx.VadModelConfig()
vad_cfg.silero_vad.model = f"{models}/silero_vad.onnx"
vad_cfg.silero_vad.min_silence_duration = 0.12
vad_cfg.silero_vad.min_speech_duration = 0.2
vad_cfg.silero_vad.max_speech_duration = 4
vad_cfg.sample_rate = sr
vad = sherpa_onnx.VoiceActivityDetector(vad_cfg, buffer_size_in_seconds=300)

rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{turbo}/turbo-encoder.int8.onnx",
    decoder=f"{turbo}/turbo-decoder.int8.onnx",
    tokens=f"{turbo}/turbo-tokens.txt",
    language="pt",
    num_threads=4,
    enable_token_timestamps=True,
)

window = vad_cfg.silero_vad.window_size
segments = []
for i in range(0, len(audio), window):
    vad.accept_waveform(audio[i : i + window])
    while not vad.empty():
        segments.append((vad.front.start / sr, np.array(vad.front.samples)))
        vad.pop()
vad.flush()
while not vad.empty():
    segments.append((vad.front.start / sr, np.array(vad.front.samples)))
    vad.pop()

captions = []
seg_out = []
for start, samples in segments:
    s = rec.create_stream()
    s.accept_waveform(sr, samples)
    rec.decode_stream(s)
    r = s.result
    dur = len(samples) / sr
    text = r.text.strip()
    seg_out.append({"start": round(start, 2), "end": round(start + dur, 2), "text": text})
    print(f"[{start:6.2f}-{start + dur:6.2f}] {text}", flush=True)

    toks = list(r.tokens)
    ts = list(r.timestamps)
    # Agrupa tokens em palavras: token que começa com espaço inicia palavra nova.
    words = []
    for tok, t in zip(toks, ts) if len(ts) == len(toks) else []:
        if tok.startswith(" ") or not words:
            words.append([tok, start + t])
        else:
            words[-1][0] += tok
    if not words:
        # Sem timestamps: distribui proporcionalmente ao tamanho das palavras.
        ws = text.split()
        total = sum(len(w) for w in ws) or 1
        t = start
        for w in ws:
            words.append([" " + w, t])
            t += dur * len(w) / total
    seg_end = start + dur
    for idx, (w, t) in enumerate(words):
        nxt = words[idx + 1][1] if idx + 1 < len(words) else seg_end
        captions.append(
            {
                "text": w if w.startswith(" ") else " " + w,
                "startMs": int(t * 1000),
                "endMs": int(max(nxt, t + 0.05) * 1000),
                "timestampMs": int(t * 1000),
                "confidence": None,
            }
        )

with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"segments": seg_out, "captions": captions}, f, ensure_ascii=False, indent=1)
