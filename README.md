# TKEN27

A Token-themed browser terminal, built as a small Linux-like shell simulation.

## Run it

Open `index.html` in a browser, or enable GitHub Pages for the repository (deploy from the `main` branch and `/ (root)`).

## Features

- Short boot sequence with a terminal-style startup log
- Command prompt, command history, arrow-key recall and Tab completion
- Virtual filesystem with `ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `cp`, `mv`, `tree`, `find` and more
- Text tools including `grep`, `head`, `tail`, `wc`, `sort`, `uniq`, `cut`, `tr` and `rev`
- Pipes, command chaining and output redirection
- Token / Femtanyl themed commands: `token`, `femtanyl`, `neofetch`
- Saved virtual files and command history using browser local storage
- Responsive layout, classic monospace fonts and reduced-motion support

## Safety / scope

This is a simulated userspace running in the browser. It does not execute host operating-system commands, access local files, make network requests, or behave as a real Linux shell. File operations only affect the terminal's virtual filesystem stored in the current browser.
