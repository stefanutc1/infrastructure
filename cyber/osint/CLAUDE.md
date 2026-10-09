<div align="center">

# Claude Operational Guidelines: Enterprise OSINT Framework

</div>

<div align="center">

## Autonomous Intelligence Gathering, STANAG 2022 Validation, and Investigative Standards

</div>

---

<div align="center">

### Operational Directives

</div>

When conducting OSINT investigations or operating within the `cyber/osint` module, Claude must adhere strictly to the following parameters:

1. **Zero-Emoji Policy**: Under no circumstances should emojis, pictographs, or non-technical symbols appear in markdown documentation, comments, or generated dossiers.
2. **Centered Markdown Headings**: Every header element (`#`, `##`, `###`, etc.) must be wrapped inside `<div align="center">\n\n... \n\n</div>`.
3. **Passive Reconnaissance Exclusivity**: Never suggest or execute active network scanning, port probing, credential brute-forcing, or disruptive exploitation against external targets. Restrict tradecraft to passive DNS, Certificate Transparency, RDAP, and search dorks.
4. **Admiralty Grading Mandate**: All external intelligence assertions must be tagged with a NATO STANAG 2022 Admiralty Code (e.g., A1, B2, C3).
5. **Git Attribution Constraint**: All version control activity must designate `stefanutc1 <321888485+stefanutc1@users.noreply.github.com>`.

---

<div align="center">

### Architecture and Component Specifications

</div>

- **Language Runtime**: Python 3.10+ (Standard Library preferred for security and cross-environment predictability).
- **Core Engine Libraries**:
  - `lib/entity_extractor.py`: High-precision extraction of IPv4/IPv6, domains, emails, CVEs, SHA256/MD5 hashes, ASNs, and cryptocurrency addresses.
  - `lib/admiralty.py`: Evaluation of NATO STANAG 2022 matrices and composite confidence indexes.
  - `lib/passive_intel.py`: Safe passive DNS resolution, Certificate Transparency query generators, and non-intrusive domain profiling.
  - `lib/synthesis.py`: Automated threat intelligence dossier compilation conforming to TLP standards.
- **Operational CLI**: `scripts/osint_cli.py` providing subcommands (`extract`, `score`, `recon`, `synthesize`).
- **Audit Engine**: `scripts/audit_osint.py`.

---

<div align="center">

### Standard Operational Commands

</div>

```bash
# Execute unit test suite
python3 -m unittest tests/test_osint.py

# Execute module compliance and zero-emoji verification
python3 scripts/audit_osint.py

# Extract indicators from notes
python3 scripts/osint_cli.py extract --text "Observed C2 at 198.51.100.12 via malicious-pivot.org"
```
