#!/usr/bin/env python3
"""
Admiralty System Evaluator (NATO STANAG 2022)
Grades raw intelligence sources and confidence indices.
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

DEFAULT_MATRIX_PATH = Path(__file__).resolve().parent.parent / "config" / "admiralty_matrix.json"


class AdmiraltyEvaluator:
    def __init__(self, matrix_path: Optional[str] = None):
        cfg_file = Path(matrix_path) if matrix_path else DEFAULT_MATRIX_PATH
        if cfg_file.exists():
            with open(cfg_file, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        else:
            self.data = {
                "reliability_ratings": {
                    "A": {"level": "Completely Reliable", "numeric_score": 1.0},
                    "B": {"level": "Usually Reliable", "numeric_score": 0.8},
                    "C": {"level": "Fairly Reliable", "numeric_score": 0.6},
                    "D": {"level": "Not Usually Reliable", "numeric_score": 0.4},
                    "E": {"level": "Unreliable", "numeric_score": 0.2},
                    "F": {"level": "Cannot Be Judged", "numeric_score": 0.5}
                },
                "credibility_ratings": {
                    "1": {"level": "Confirmed by Other Sources", "numeric_score": 1.0},
                    "2": {"level": "Probably True", "numeric_score": 0.8},
                    "3": {"level": "Possibly True", "numeric_score": 0.6},
                    "4": {"level": "Doubtful", "numeric_score": 0.4},
                    "5": {"level": "Improbable", "numeric_score": 0.2},
                    "6": {"level": "Truth Cannot Be Judged", "numeric_score": 0.5}
                }
            }

        self.reliability = self.data.get("reliability_ratings", {})
        self.credibility = self.data.get("credibility_ratings", {})

    def evaluate(self, code: str) -> Dict[str, Any]:
        """
        Parses an Admiralty code like 'A1', 'B2', 'F6'.
        Returns detailed scoring breakdown and composite confidence.
        """
        code = code.strip().upper()
        if len(code) != 2:
            raise ValueError(f"Invalid Admiralty Code format '{code}'. Must be 2 characters (e.g. 'A1', 'B2').")

        rel_char, cred_char = code[0], code[1]

        if rel_char not in self.reliability:
            raise ValueError(f"Invalid Reliability character '{rel_char}'. Must be A through F.")
        if cred_char not in self.credibility:
            raise ValueError(f"Invalid Credibility character '{cred_char}'. Must be 1 through 6.")

        rel_info = self.reliability[rel_char]
        cred_info = self.credibility[cred_char]

        rel_score = rel_info.get("numeric_score", 0.5)
        cred_score = cred_info.get("numeric_score", 0.5)

        # Composite confidence metric: weighted harmonic mean
        composite_score = round(0.4 * rel_score + 0.6 * cred_score, 3)

        if composite_score >= 0.85:
            confidence_level = "HIGH_CONFIDENCE_ACTIONABLE"
        elif composite_score >= 0.60:
            confidence_level = "MODERATE_CONFIDENCE_CORROBORATION_REQUIRED"
        else:
            confidence_level = "LOW_CONFIDENCE_UNVERIFIED"

        return {
            "admiralty_code": f"{rel_char}{cred_char}",
            "source_reliability": {
                "rating": rel_char,
                "label": rel_info.get("level"),
                "score": rel_score
            },
            "information_credibility": {
                "rating": cred_char,
                "label": cred_info.get("level"),
                "score": cred_score
            },
            "composite_confidence_index": composite_score,
            "operational_verdict": confidence_level
        }
