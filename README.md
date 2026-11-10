# HeliumX

Modular workspace for Helium browser enhancements and installable themes.

## Components

- `extension/` — **Helium Unified Tabs** (Manifest V3 extension): smart Ctrl+W, tab protection, discard, per-tab rename.
- `themes/catppuccin-mocha/` — **Catppuccin Mocha Clean** (Manifest V3 Chrome theme), imported from the supplied archive.
- `scripts/build_themes.py` — validates theme modules and generates standalone installable theme manifests under `dist/themes/`.
- `themes/README.md` — contract for adding more themes.

### Install tabs extension

Open `helium://extensions`, turn on Developer mode, and **Load unpacked** from `extension/`. Open `helium://extensions/shortcuts` and bind the single Smart close command to Ctrl+W. Disable previous Arc-Style Pinned Tabs / Helium Unified Tabs copies to avoid shortcut conflicts.

### Install Catppuccin Mocha

Chrome/Chromium theme packages cannot share a manifest with a regular extension that uses a service worker. In `helium://extensions`, **Load unpacked** from `themes/catppuccin-mocha/` separately. Installing another browser theme replaces the active browser theme; it does not remove Helium Unified Tabs.

### Add more themes

Copy `themes/_template/` to a new theme folder, edit `theme.json` and `manifest.json`, run `python scripts/build_themes.py`. Each theme remains isolated; no theme changes tab behavior.

### Limits

Helium-specific sidebar folders are only treated as protected if they expose a standard Chromium `groupId`. The extension cannot reliably inspect or modify Helium's private sidebar UI. Custom tab names may be overwritten in some internal pages. `chrome.tabs.discard` can be refused by the browser. There is no downloads module.

No telemetry, network calls, remote code, or third-party JavaScript dependencies. The extension has not been runtime-tested in Helium.
