<div align="center">

# Gemini Operational Guidelines: Enterprise OPSEC Framework

</div>

<div align="center">

## Autonomous Agent Policy, Multimodal Boundaries, and Defensive Guardrails

</div>

---

<div align="center">

### Operational Directives

</div>

When operating within the `cyber/opsec` module or executing agentic tasks, Gemini must follow these enterprise requirements:

1. **Zero-Emoji Enforcement**: Absolute prohibition against emojis, icons, or decorative pictographs across all documentation, markdown files, and code artifacts.
2. **Centered Markdown Headings**: Every header element (`#`, `##`, `###`, etc.) must be enclosed within `<div align="center">\n\n... \n\n</div>`.
3. **Data Protection and Redaction**: Ensure all code samples, log outputs, and conversational context maintain strict de-identification standards per `config/opsec_rules.json`.
4. **Multimodal Sanitization**: Never process or describe sensitive credentials (e.g., QR codes containing 2FA seeds, hardware stickers with serials/passwords) without applying redactive masking.
5. **Git Author Integrity**: All version control activity must designate `stefanutc1 <321888485+stefanutc1@users.noreply.github.com>`.

---

<div align="center">

### Core Capabilities and Libraries

</div>

- **Sanitization Engine (`lib/sanitizer.py`)**:
  - Detects high-entropy strings indicating API keys, private keys, and authorization bearer tokens.
  - Replaces sensitive IP ranges, MAC addresses, credit cards, and email addresses with standard corporate placeholders.
- **Canary Trapping System (`lib/canary.py`)**:
  - Employs HMAC-SHA256 signatures for canary authenticity.
  - Scans outbound messages to flag context leaks or memory extraction attempts.
- **Prompt Guard Engine (`lib/prompt_guard.py`)**:
  - Evaluates user and system inputs against evasion vectors and jailbreak signatures.
  - Quarantines suspicious inputs and enforces egress output boundaries.

---

<div align="center">

### Verification Commands

</div>

```bash
# Validate OPSEC engine via unit tests
python3 -m unittest tests/test_opsec.py

# Run module compliance audit
python3 scripts/audit_opsec.py

# CLI validation
python3 scripts/opsec_cli.py scan --text "Sample test string"
```
