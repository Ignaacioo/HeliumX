#!/usr/bin/env python3
"""Validate and package independent HeliumX Chromium theme modules."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
THEMES = ROOT / "themes"
OUTPUT = ROOT / "dist" / "themes"

def validate(info, folder):
    for key in ("id", "name", "version", "colors"):
        if not info.get(key):
            raise ValueError(f"{folder}: missing {key}")
    if info["id"] != folder.name:
        raise ValueError(f"{folder}: theme id must match folder name")
    for name, value in info["colors"].items():
        if not isinstance(value, list) or len(value) not in (3, 4) or any(not isinstance(v, int) or isinstance(v, bool) or not 0 <= v <= 255 for v in value):
            raise ValueError(f"{folder}: invalid color {name}")

def build():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    count = 0
    for folder in sorted(THEMES.iterdir()):
        if not folder.is_dir() or folder.name.startswith("_"):
            continue
        info = json.loads((folder / "theme.json").read_text(encoding="utf-8"))
        validate(info, folder)
        manifest = {"manifest_version": 3, "name": info["name"], "version": info["version"],
                    "description": info.get("description", ""), "theme": {"colors": info["colors"]}}
        target = OUTPUT / folder.name
        target.mkdir(parents=True, exist_ok=True)
        (target / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        count += 1
        print("Built", target)
    print(f"Built {count} theme(s)")

if __name__ == "__main__":
    build()
