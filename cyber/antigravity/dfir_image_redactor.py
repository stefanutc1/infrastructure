#!/usr/bin/env python3
"""
DFIR Evidence Image Redactor & Sanitizer
========================================
Automated redaction tool for digital forensics and incident response evidence.
Scans image directories for specified sensitive keywords, PII (Personally Identifiable
Information), victim credentials, or custom patterns using OCR and image processing,
applying irreversible solid black redaction blocks.

Usage:
    python3 dfir_image_redactor.py --input-dir /path/to/evidence --target "sensitive_text"
    python3 dfir_image_redactor.py --file /path/to/image.png --box 1150 1450 780 840
"""

import argparse
import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw


def redact_bounding_box(image_path: str, output_path: str, box: tuple):
    """
    Applies an opaque black rectangle over the specified bounding box (x0, y0, x1, y1).
    Ensures zero residual artifact leakage by overwriting pixel data directly.
    """
    im = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(im)
    draw.rectangle(box, fill=(0, 0, 0))
    im.save(output_path, "PNG", optimize=True)
    print(f"[+] Redacted: {image_path} -> {output_path} with box {box}")


def run_apple_vision_ocr(image_path: str) -> list:
    """
    Executes native macOS Apple Vision OCR via Swift to extract text and bounding boxes.
    Returns a list of dicts: [{'text': str, 'confidence': float, 'rect': [x, y, w, h]}]
    """
    swift_script = f'''
    import Foundation
    import Vision
    import AppKit

    guard let image = NSImage(contentsOfFile: "{image_path}"),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {{
        exit(1)
    }}

    let request = VNRecognizeTextRequest {{ request, error in
        guard let observations = request.results as? [VNRecognizedTextObservation] else {{ return }}
        for obs in observations {{
            if let candidate = obs.topCandidates(1).first {{
                let bbox = obs.boundingBox
                print("\\(candidate.string)|\\(candidate.confidence)|\\(bbox.origin.x)|\\(bbox.origin.y)|\\(bbox.size.width)|\\(bbox.size.height)")
            }}
        }}
    }}
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try? handler.perform([request])
    '''
    try:
        proc = subprocess.run(["swift", "-"], input=swift_script, capture_output=True, text=True, check=True)
        results = []
        for line in proc.stdout.strip().splitlines():
            parts = line.split("|")
            if len(parts) == 6:
                results.append({
                    "text": parts[0],
                    "confidence": float(parts[1]),
                    "x": float(parts[2]),
                    "y": float(parts[3]),
                    "w": float(parts[4]),
                    "h": float(parts[5]),
                })
        return results
    except Exception as e:
        print(f"[-] Vision OCR failed for {image_path}: {e}", file=sys.stderr)
        return []


def redact_target_text(image_path: str, target: str, output_path: str = None, padding: int = 4):
    """
    Scans an image with OCR, finds occurrences of `target`, computes coordinate bounds,
    and paints an opaque black redaction box over every instance.
    """
    if output_path is None:
        output_path = image_path

    observations = run_apple_vision_ocr(image_path)
    im = Image.open(image_path).convert("RGB")
    w, h = im.size
    draw = ImageDraw.Draw(im)
    found = 0

    for obs in observations:
        if target.lower() in obs["text"].lower():
            found += 1
            # Vision bounding box is normalized (0..1) with origin at bottom-left
            bx = int(obs["x"] * w) - padding
            by = int((1.0 - obs["y"] - obs["h"]) * h) - padding
            bw = int(obs["w"] * w) + (padding * 2)
            bh = int(obs["h"] * h) + (padding * 2)
            box = (max(0, bx), max(0, by), min(w, bx + bw), min(h, by + bh))
            draw.rectangle(box, fill=(0, 0, 0))
            print(f"[!] Target match '{target}' found in '{obs['text']}'. Redacted box: {box}")

    if found > 0:
        im.save(output_path, "PNG", optimize=True)
        print(f"[+] Successfully applied {found} redaction(s) to {output_path}")
    else:
        print(f"[*] No occurrences of '{target}' detected in {image_path}")


def main():
    parser = argparse.ArgumentParser(description="DFIR Evidence Image Redactor (Sanitization Tool)")
    parser.add_argument("--file", help="Path to single image to redact")
    parser.add_argument("--dir", help="Directory containing images to process")
    parser.add_argument("--target", help="Sensitive string or keyword to redact automatically")
    parser.add_argument("--box", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"),
                        help="Explicit pixel bounding box coordinates to black out")
    parser.add_argument("--output", help="Optional output path (defaults to in-place overwrite)")
    args = parser.parse_args()

    if args.box and args.file:
        out = args.output or args.file
        redact_bounding_box(args.file, out, tuple(args.box))
    elif args.target and args.file:
        redact_target_text(args.file, args.target, args.output)
    elif args.target and args.dir:
        for ext in ("*.png", "*.jpg", "*.jpeg"):
            for img in Path(args.dir).glob(ext):
                redact_target_text(str(img), args.target)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
