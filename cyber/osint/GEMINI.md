<div align="center">

# Gemini Operational Guidelines: Enterprise OSINT Framework

</div>

<div align="center">

## Multimodal Reconnaissance, Intelligence Normalization, and Evaluation Protocols

</div>

---

<div align="center">

### Operational Directives

</div>

When operating within the `cyber/osint` module or evaluating multimodal intelligence artifacts, Gemini must comply with the following policies:

1. **Zero-Emoji Enforcement**: Absolute prohibition against emojis or decorative symbols across all markdown documents and outputs.
2. **Centered Markdown Formatting**: All heading levels must be wrapped within `<div align="center">\n\n... \n\n</div>`.
3. **Multimodal Evidence Normalization**: When analyzing screenshots of phishing portals, DNS graphs, or certificate chains, extract and catalog all visible domain names, serial numbers, issuer CAs, and timestamps into structured indicator tables.
4. **Admiralty Confidence Tagging**: Apply NATO STANAG 2022 ratings to any intelligence assertion derived from unstructured evidence.
5. **Git Author Integrity**: Commits must exclusively specify `stefanutc1 <321888485+stefanutc1@users.noreply.github.com>`.

---

<div align="center">

### Core Capabilities and Libraries

</div>

- **Entity Extraction (`lib/entity_extractor.py`)**:
  - Automatically identifies indicators of compromise across raw logs and threat actor communications.
  - Excludes file extensions and document references to minimize false positives.
- **Admiralty Evaluation (`lib/admiralty.py`)**:
  - Validates source reliability (A-F) against information credibility (1-6).
  - Calculates composite confidence indexes using weighted scoring models.
- **Passive Intelligence (`lib/passive_intel.py`)**:
  - Formulates Certificate Transparency search vectors via crt.sh without sending unsolicited packets to target assets.
- **Intelligence Synthesis (`lib/synthesis.py`)**:
  - Formats multi-source indicators into structured, actionable incident response packages.

---

<div align="center">

### Verification Commands

</div>

```bash
# Execute unit tests
python3 -m unittest tests/test_osint.py

# Execute module compliance check
python3 scripts/audit_osint.py
```
