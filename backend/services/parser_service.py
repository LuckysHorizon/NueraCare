from __future__ import annotations

import re
from typing import List

from models.schemas import ParsedValue


LINE_PATTERN = re.compile(
    r"^(?P<name>[A-Za-z0-9 /\-()]+)\s+(?P<value>[0-9]+(?:\.[0-9]+)?)\s*(?P<unit>[A-Za-z%/]+)?\s*(?P<range>\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?)?",
    re.MULTILINE,
)


def classify_value(value: float, reference_range: str | None) -> str:
    if not reference_range:
        return "Doctors usually look at this value in context."
    parts = re.split(r"[-–]", reference_range)
    if len(parts) != 2:
        return "Doctors usually look at this value in context."

    try:
        low = float(parts[0].strip())
        high = float(parts[1].strip())
    except ValueError:
        return "Doctors usually look at this value in context."

    if low <= value <= high:
        return "This looks within the usual range."
    if value < low:
        return "This is a little below the usual range."
    return "This is a little above the usual range."


def parse_report_text(text: str) -> List[ParsedValue]:
    results: List[ParsedValue] = []
    if not text:
        return results

    for match in LINE_PATTERN.finditer(text):
        name = match.group("name").strip()
        value_raw = match.group("value")
        unit = match.group("unit")
        reference_range = match.group("range")
        if not name or not value_raw:
            continue

        try:
            value_num = float(value_raw)
        except ValueError:
            continue

        classification = classify_value(value_num, reference_range)
        results.append(
            ParsedValue(
                test_name=name,
                value=value_raw,
                unit=unit,
                reference_range=reference_range,
                classification=classification,
            )
        )

    return results
