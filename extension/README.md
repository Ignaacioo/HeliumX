# Helium Unified Tabs v1.4.1

Smart Ctrl+W, protected tabs and inline tab renaming. The normal tabs extension and the Catppuccin browser theme are independent installable modules.

## Rename a tab

Right-click a regular web tab and choose **Переименовать вкладку**. A compact modal opens **inside that webpage**, not in a separate browser window. Type a name and Save; Reset removes the custom title. The rename script is injected on demand, so existing pages need no manual reload after updating the extension. The script checks that the webpage accepted the title and reports failures instead of false success.

Limitations: `helium://` and other privileged pages cannot be renamed. Changes use `document.title`; on some sites and Helium versions, the sidebar may show a separate internal title and not mirror it. The rename applies to the current tab and lasts for the current browser session, including reloads; it does not persist across complete browser restart.

## Ctrl+W

Assign a single shortcut in `helium://extensions/shortcuts`. Normal tabs close; pinned/manual/native Chromium-group tabs are protected by default. Helium's proprietary sidebar folders may not expose Chromium `groupId`. `chrome.tabs.discard` may decline to unload pages.

Permissions: `tabs`, `storage`, `contextMenus`, `scripting`, `activeTab`; script matches normal HTTP(S) pages only. No network calls, downloads panel, or telemetry.
