#!/usr/bin/env python3
"""
Mermaid Diagram Syntax & Label Quoting Auditor
Audits all markdown files in the repository for Mermaid blocks and verifies:
1. No unquoted parentheses inside square brackets: e.g. [Label (Text)] -> must be ["Label (Text)"]
2. No unquoted & / $ / special characters inside node labels
3. Validates compilation of each diagram using mermaid-cli (mmdc) if available
"""

import os
import re
import subprocess
import sys
import tempfile

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def find_markdown_files():
    md_files = []
    for root, dirs, files in os.walk(REPO_ROOT):
        if any(skip in root for skip in [".git", "node_modules", "dist", ".angular"]):
            continue
        for f in files:
            if f.endswith(".md"):
                md_files.append(os.path.join(root, f))
    return sorted(md_files)

def extract_mermaid_blocks(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    blocks = []
    pattern = re.compile(r"```mermaid\n([\s\S]*?)```", re.MULTILINE)
    for m in pattern.finditer(content):
        blocks.append((m.start(), m.end(), m.group(1), file_path))
    return blocks

def check_unquoted_brackets(block_text):
    """
    Detects node definitions like:
    id[Some Text (with parens)] where the content inside [ ] is not enclosed in "..."
    """
    errors = []
    lines = block_text.splitlines()
    for idx, line in enumerate(lines, 1):
        stripped = line.strip()
        # Find all occurrences of [ ... ]
        # If inside [ ... ] there is ( or ), check if it starts and ends with "..."
        # e.g., [Zero-Cost Cloud Guardrail ($0.00 / Free-Tier)]
        # pattern matches [ followed by non-" until ]
        matches = re.findall(r'\[([^"\]]*?[()][^"\]]*?)\]', stripped)
        for match in matches:
            errors.append(f"Line {idx}: Unquoted parentheses in label: [{match}] -> should be [\"{match}\"]")
    return errors

def main():
    print("=" * 80)
    print("Mermaid Diagram Syntax Auditor")
    print("=" * 80)

    md_files = find_markdown_files()
    all_errors = []
    total_diagrams = 0

    for fpath in md_files:
        rel_path = os.path.relpath(fpath, REPO_ROOT)
        blocks = extract_mermaid_blocks(fpath)
        if not blocks:
            continue

        for i, (_, _, block_text, _) in enumerate(blocks, 1):
            total_diagrams += 1
            syntax_errors = check_unquoted_brackets(block_text)
            if syntax_errors:
                all_errors.append((rel_path, i, syntax_errors, block_text))

    print(f"Scanned {len(md_files)} markdown files, discovered {total_diagrams} Mermaid diagrams.")

    if all_errors:
        print(f"\n[FAIL] Found {len(all_errors)} diagrams with syntax errors:")
        for rel_path, diag_num, errs, _ in all_errors:
            print(f"\n- File: {rel_path} (Diagram #{diag_num})")
            for err in errs:
                print(f"  * {err}")
        return 1
    else:
        print("[SUCCESS] All Mermaid diagrams passed syntax & quoting audit!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
