# Helium Unified Tabs

Single hotkey for tabs. Protected = pinned, manually protected, or native Chromium group tabs (if mode=groups). Normal tabs close on Ctrl+W. Protected tabs switch focus and request `chrome.tabs.discard` without changing URL, except if pinned Reset is selected.

Install by loading unpacked `extension/` in `helium://extensions`. Bind Ctrl+W in `helium://extensions/shortcuts`. Do **not** leave the old extension enabled.

Context menu: toggle manual protection, set pinned home URL, rename tab. Custom name persists across page reload within a browser session; not across full browser restart. Cannot edit internal `helium://` pages. The underlying Chromium API may not expose Helium sidebar folders as native tab groups.

The theme is a **separate module** in `../themes/catppuccin-mocha` due to Chromium manifest restrictions.
