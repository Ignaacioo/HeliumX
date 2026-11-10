# Helium Unified Tabs v1.4.2

Smart Ctrl+W, protected tabs, inline tab renaming. The normal tabs extension and browser themes are separate installable modules.

## Rename

Right-click a normal HTTP(S) web tab → **Переименовать вкладку**. A compact modal is injected into that webpage. A host permission for HTTP(S) lets the context menu work on **inactive** tabs (the previous build lacked it). Invalid/restricted pages show an error in the extension status and a ! badge. No window opens. Names last for this browser session.

**UI colors:** when an enabled Chromium theme is named Catppuccin Mocha, the modal uses its matching palette from `ui-theme-registry.js`. Extend this registry for future HeliumX themes. For unknown browser themes, Chromium does not expose their exact palette to regular extensions; the modal falls back to OS light/dark via `prefers-color-scheme`. `management` is used only to identify the installed active browser theme. No remote access, telemetry or downloads feature.

**Limits:** Sidebar tab name may be controlled by Helium itself rather than webpage `document.title`. Internal pages (`helium://`, Chrome Web Store, etc.) cannot be injected. A page refresh after updating the extension can clear stale injected scripts.

## Ctrl+W

Bind the extension's single Smart close command in `helium://extensions/shortcuts`. Normal tabs close, pinned/manual/native Chromium-group tabs are protected. Helium sidebar folder metadata may not be exposed as Chromium groups. `chrome.tabs.discard` can refuse to unload a tab.

## Permissions

`tabs`, `storage`, `contextMenus`, `scripting`, `activeTab`, `management` and HTTP(S) host permissions. The last two are for theme detection and injecting the rename modal into inactive tabs.
