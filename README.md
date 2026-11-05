# TKEN27

A Token-themed browser terminal, built as a small Linux-like shell simulation.

## Run it

Open `index.html` in a browser, or enable GitHub Pages for the repository (deploy from the `main` branch and `/(root)`).

## Features

- Terminal boot sequence, command prompt, clock, command history, arrow-key recall and Tab completion
- Virtual filesystem with `ls`, `cd`, `cat`, `mkdir`, `touch`, `write`, `append`, `rm`, `cp`, `mv`, `tree`, `find` and more
- Text tools: `grep` (including inverted matches), `head`, `tail`, `tac`, `nl`, `fold`, `wc`, `sort`, `uniq`, `paste`, `cut`, `tr`, `rev`, `diff`, `base64`, `hash`, `json`, `rot13`, `replace`, `calc`, `random` and `uuid`
- Shell conveniences: functional aliases, quoted and braced variables, dynamic `PWD`/`OLDPWD`, reverse history search with Ctrl+R, cycling Tab completion, pipes, redirects and command chaining
- Stopwatch with laps via `timer`, and a browser download command for virtual files
- Token text interactions: `token hello`, `token ask`, `token say`, `token diary`, `token pet`, `token hug`, `token boop`, `token roll`, `token flip` and more
- Femtanyl track index, hidden diary easter egg and simulated system commands
- Saved virtual files and command history using browser local storage
- Classic monospace look, reduced-motion support and no spoken audio

## Try these

```sh
token hello
token ask
token say "i own this terminal now"
token diary
calc 12 * (3 + 4)
echo '{"ready":true,"count":3}' | json
echo abc | rot13
timer start
timer lap
timer stop
random 1 20
uuid
download todo.txt
alias gs=grep
export WHO=visitor
echo hello $WHO
write todo.txt remember the snacks
append todo.txt and the backup
cat todo.txt
cat /usr/share/femtanyl/tracks.txt | grep -i help
```

## Safety / scope

This is a simulated userspace running in the browser. It does not execute host operating-system commands, access local files, make network requests, or behave as a real Linux shell. File operations only affect the terminal's virtual filesystem stored in the current browser.
