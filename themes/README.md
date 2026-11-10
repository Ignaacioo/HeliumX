# Theme modules

Each directory under `themes/` (other than `_template`) is an **independent installable Chromium theme extension**.

Required files:
- `theme.json`: metadata for the HeliumX theme registry: `id`, `name`, `version`, `description`, `colors`.
- `manifest.json`: valid Manifest V3 **theme-only** manifest with matching `theme.colors` values.

`scripts/build_themes.py` builds a generated theme manifest per module from `theme.json`, without mixing browser theme with the Tabs extension. To add a theme, copy `_template`, set a unique ID and palette, then run the builder. Individual themes are independently installed in `helium://extensions`.

**Important:** Extension popup styling and browser chrome themes are different surfaces. The browser API does not support switching browser theme modules from a regular extension's JS. Installing/enabling a different theme is done through browser UI.

Catppuccin Mocha colors were transcribed from the user-supplied `catppuccin-mocha-helium.zip` archive (the **Mocha Clean** variant). Its archive also had a different top-level `manifest.json` variant; we deliberately use the nested Mocha Clean one.
