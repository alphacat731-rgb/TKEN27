# TKEN27

A Token-themed browser terminal, built as a small Linux-like shell simulation.

## Run it

Open `index.html` in a browser, or enable GitHub Pages for the repository (deploy from the `main` branch and `/(root)`).

## Base terminal

- Terminal boot sequence, clock, command history, arrow-key recall, Ctrl+R reverse search, path-aware cycling Tab completion and a 1,600-line output cap
- Virtual filesystem with `ls`, `cd`, `cat`, `mkdir`, `touch`, `write`, `append`, `rm`, `cp`, `mv`, `tree`, `find` and more
- Text tools: `grep`, `head`, `tail`, `tac`, `nl`, `fold`, `wc`, `sort`, `uniq`, `paste`, `cut`, `tr`, `rev`, `diff`, `base64`, `hash`, `json`, `rot13`, `replace`, `calc`, `random` and `uuid`
- Shell conveniences: aliases, variables, pipes, redirects and command chaining
- Stopwatch with laps via `timer`, and a browser download command for virtual files
- Token text interactions, Femtanyl track index, hidden diary easter egg and simulated system commands
- Persisted virtual filesystem changes and command history using browser local storage
- Classic monospace look, reduced-motion support and no spoken audio
- Temporary phone-friendly layout via `mobile` / `mobile on`, restored with `desktop` or `mobile off`; it resets on refresh

## Optional expansion pack

Run `pack install` in the terminal to open the package installer. The installation duration is randomized for each attempt between **30 and 120 seconds**. The installer shows progress and package logs.

Once installed, the pack is saved in this browser's local storage and remains active after refreshes or closing and reopening the page on the same browser profile and site origin. Run `pack status` to check it, or `pack uninstall` to remove it.

The pack adds:

- `visualizer [wave|noise|diagnostics]` — animated signal display or simulated system diagnostics
- `decrypt`, `decrypt hint`, `decrypt solve ...`, `decrypt archive` — a small ROT13 puzzle that unlocks a hidden Token note; unlock state persists
- `chmod MODE FILE`, `chown OWNER:GROUP FILE`, and `perm [FILE]` — persistent simulated permission and ownership metadata
- `patch FILE OLD_TEXT => NEW_TEXT` — replace text in a virtual file
- `locate TEXT` and `which COMMAND` — search the virtual filesystem or find simulated shell commands
- `watch [SECONDS] [system|date|uptime]`, `jobs`, and `kill JOB_ID` — simulated background status jobs
- `help expansion` and manual pages such as `man visualizer`

Example:

```sh
pack status
pack install
visualizer wave
visualizer noise
visualizer diagnostics
decrypt
decrypt hint
decrypt solve "token keeps a second diary"
decrypt archive
chmod 755 notes.txt
chown token:token notes.txt
perm notes.txt
patch notes.txt "stay strange" => "stay strange and keep snacks"
locate diary
which grep
watch 2 system
jobs
kill 1
pack uninstall
```

The expansion pack is a local browser feature, not a network download. Browser storage can be removed by clearing the site's data, using a different browser/profile/device, or running `pack uninstall`. Simulated permissions do not change real operating-system files.

## Safety / scope

This is a simulated userspace running in the browser. It does not execute host operating-system commands, access local files, make network requests, or behave as a real Linux shell. File operations only affect the terminal's virtual filesystem stored in the current browser.
