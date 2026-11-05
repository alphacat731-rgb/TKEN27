(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const bootScreen = $("bootScreen");
  const terminalShell = $("terminalShell");
  const bootLog = $("bootLog");
  const bootProgress = $("bootProgress");
  const output = $("terminalOutput");
  const input = $("commandInput");
  const promptLabel = $("promptLabel");
  const screen = $("terminalScreen");
  const commandForm = $("commandForm");
  const clock = $("clock");

  const bootLines = [
    "[    0.000] TKEN27 kernel starting...",
    "[    0.118] mounting /dev/token",
    "[    0.264] checking memory ............... OK",
    "[    0.391] loading femtanyl audio index .. OK",
    "[    0.522] starting token.service ........ OK",
    "[    0.681] attaching /home/token .......... OK",
    "[    0.804] launching tkn-shell ............ OK",
    "[    0.901] all systems nominal. probably."
  ];
  let bootTimer = null;
  let bootIndex = 0;

  const initialFiles = {
    "/home/token/readme.txt": "Welcome to TKEN27.\n\nThis is a small Token-themed terminal simulation.\nType 'help' to see commands. Type 'token' to meet the resident.\n\nNothing here touches your real operating system.",
    "/home/token/about-token.txt": "TOKEN // CHARACTER NOTES\n\nToken is the recurring mascot associated with Femtanyl.\nThe design is usually a white, cat-like creature with large pointed ears,\ndark eyes and small fangs. Artwork varies between releases.\n\nTreat fan interpretations as interpretations, not confirmed canon.",
    "/home/token/notes.txt": "things to remember:\n- stay strange\n- keep backups\n- do not trust suspicious floppy disks",
    "/etc/hostname": "tken27",
    "/etc/os-release": "NAME=TKEN27\nPRETTY_NAME=\"TKEN27 Token Shell\"\nID=tken27\nVERSION=27.11",
    "/etc/token": "name=Token\nrole=Femtanyl mascot\nform=cat-like creature\nstatus=unreasonably online\n",
    "/var/log/boot.log": bootLines.join("\n"),
    "/usr/share/femtanyl/tracks.txt": "P3T\nKATAMARI\nGIRL HELL 1999\nCHASER\nDINNER!\nI MIGHT B3 SICK\nS33K H3LP\nACT RIGHT\nDOGMATICA\nPUSH UR T3MPRR\nAND I'M GONE\nMURDER EVERY 1 U KNOW!\nLOVESICK, CANNIBAL!\nM3 N MIN3\nPICKMEUP!\nBOTHERED!",
    "/usr/share/femtanyl/lore.txt": "TOKEN: NOTES, NOT A CANON BIBLE\n\nToken is Femtanyl's recurring mascot. The creator has described Token\nas a vessel for the music. The character's exact inner life and many\ncommonly repeated lore details are not fully established in primary sources.\n\nThe fandom wiki describes Token as immortal and genderless; treat those\ndetails as community-documented lore unless you can verify a creator source."
  };

  const dirs = new Set([
    "/", "/home", "/home/token", "/etc", "/var", "/var/log",
    "/usr", "/usr/share", "/usr/share/femtanyl", "/tmp"
  ]);
  const files = Object.assign({}, initialFiles);
  const storageKey = "tken27.virtual-fs.v1";
  const historyKey = "tken27.command-history.v1";
  let cwd = "/home/token";
  let history = [];
  let historyIndex = 0;
  let sessionStart = Date.now();
  let commandCount = 0;
  let tokenMood = "unbothered";
  let tabMatches = [];
  let tabIndex = 0;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (saved && typeof saved === "object") {
      (saved.files || []).forEach((entry) => {
        if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string" && !Object.prototype.hasOwnProperty.call(initialFiles, entry[0])) files[entry[0]] = entry[1];
      });
      (saved.dirs || []).forEach((dir) => { if (typeof dir === "string") dirs.add(dir); });
    }
    const savedHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    if (Array.isArray(savedHistory)) history = savedHistory.filter((x) => typeof x === "string").slice(-100);
  } catch (_) {}

  function persist() {
    try {
      const customFiles = Object.keys(files).filter((path) => !Object.prototype.hasOwnProperty.call(initialFiles, path)).map((path) => [path, files[path]]);
      const customDirs = Array.from(dirs).filter((path) => !["/", "/home", "/home/token", "/etc", "/var", "/var/log", "/usr", "/usr/share", "/usr/share/femtanyl", "/tmp"].includes(path));
      localStorage.setItem(storageKey, JSON.stringify({ files: customFiles, dirs: customDirs }));
      localStorage.setItem(historyKey, JSON.stringify(history.slice(-100)));
    } catch (_) {}
  }

  function normalizePath(path, base) {
    if (!path || path === "~") return "/home/token";
    let raw = path === "-" ? (window.__tkenPreviousDir || "/home/token") : path;
    if (raw.startsWith("~")) raw = "/home/token" + raw.slice(1);
    let parts = (raw.startsWith("/") ? raw : (base || cwd) + "/" + raw).split("/");
    const stack = [];
    for (const part of parts) {
      if (!part || part === ".") continue;
      if (part === "..") stack.pop();
      else stack.push(part);
    }
    return "/" + stack.join("/");
  }

  function displayPath(path) {
    if (path === "/home/token") return "~";
    if (path.startsWith("/home/token/")) return "~/" + path.slice(12);
    return path;
  }

  function parentPath(path) {
    if (path === "/") return "/";
    const bits = path.split("/");
    bits.pop();
    return bits.join("/") || "/";
  }

  function baseName(path) {
    return path.split("/").filter(Boolean).pop() || "/";
  }

  function exists(path) { return dirs.has(path) || Object.prototype.hasOwnProperty.call(files, path); }
  function isDir(path) { return dirs.has(path); }
  function isFile(path) { return Object.prototype.hasOwnProperty.call(files, path); }

  function childrenOf(path) {
    const prefix = path === "/" ? "/" : path + "/";
    const found = new Map();
    dirs.forEach((dir) => {
      if (dir !== path && dir.startsWith(prefix)) {
        const rest = dir.slice(prefix.length);
        if (rest && !rest.includes("/")) found.set(rest, "dir");
      }
    });
    Object.keys(files).forEach((file) => {
      if (file.startsWith(prefix)) {
        const rest = file.slice(prefix.length);
        if (rest && !rest.includes("/")) found.set(rest, "file");
      }
    });
    return Array.from(found.entries()).sort((a, b) => {
      if (a[1] !== b[1]) return a[1] === "dir" ? -1 : 1;
      return a[0].localeCompare(b[0]);
    });
  }

  function print(text, type) {
    const value = String(text == null ? "" : text);
    const lines = value.split("\n");
    lines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "output-line" + (type ? " " + type : "");
      row.textContent = line || " ";
      output.appendChild(row);
    });
    screen.scrollTop = screen.scrollHeight;
  }

  function clearScreen() { output.textContent = ""; }
  function setPrompt() { promptLabel.textContent = "token@tken27:" + displayPath(cwd) + "$"; }
  function commandEcho(command) {
    const row = document.createElement("div");
    row.className = "output-line command-echo";
    const p = document.createElement("span");
    p.className = "echo-prompt";
    p.textContent = promptLabel.textContent + " ";
    const c = document.createElement("span");
    c.textContent = command;
    row.append(p, c);
    output.appendChild(row);
  }
  function boot() {
    window.clearInterval(bootTimer);
    bootIndex = 0;
    bootLog.textContent = "";
    bootProgress.style.width = "0%";
    bootScreen.classList.remove("fade-out");
    terminalShell.classList.add("hidden");
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduced ? 15 : 155;
    bootTimer = window.setInterval(() => {
      if (bootIndex >= bootLines.length) {
        window.clearInterval(bootTimer);
        window.setTimeout(showTerminal, reduced ? 50 : 330);
        return;
      }
      const line = document.createElement("div");
      line.textContent = bootLines[bootIndex];
      if (line.textContent.endsWith("OK")) line.className = "ok";
      bootLog.appendChild(line);
      bootIndex += 1;
      bootProgress.style.width = Math.round((bootIndex / bootLines.length) * 100) + "%";
    }, delay);
  }
  function showTerminal() {
    bootScreen.classList.add("fade-out");
    terminalShell.classList.remove("hidden");
    window.setTimeout(() => {
      bootScreen.style.display = "none";
      input.focus();
    }, 470);
    if (!output.childNodes.length) {
      print("TKEN27 Token Shell [version 27.11]", "accent");
      print("A small place for a very loud mascot.");
      print("");
      print("  /\_/\\     type 'help' for commands");
      print(" ( o.o )    type 'token' for Token-related commands");
      print("  > ^ <");
      print("");
      print("session ready. no real system files will be touched.", "muted");
      print("");
    }
    setPrompt();
    updateClock();
  }

  function tokenize(line) {
    const tokens = [];
    let current = "";
    let quote = null;
    let escaped = false;
    const flush = () => { if (current.length) { tokens.push(current); current = ""; } };
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (escaped) { current += ch; escaped = false; continue; }
      if (ch === "\\" && quote !== "'") { escaped = true; continue; }
      if (quote) {
        if (ch === quote) quote = null;
        else current += ch;
        continue;
      }
      if (ch === "'" || ch === '"') { quote = ch; continue; }
      if (ch === " " || ch === "\t") { flush(); continue; }
      if (ch === ";" || ch === "|" || ch === ">" || ch === "&") {
        flush();
        if (ch === ">" && line[i + 1] === ">") { tokens.push(">>"); i += 1; }
        else if (ch === "&" && line[i + 1] === "&") { tokens.push("&&"); i += 1; }
        else tokens.push(ch);
        continue;
      }
      current += ch;
    }
    if (escaped) current += "\\";
    flush();
    return tokens;
  }

  function writeFile(path, content, append) {
    path = normalizePath(path);
    if (dirs.has(path)) return { ok: false, error: path + ": is a directory" };
    const parent = parentPath(path);
    if (!dirs.has(parent)) return { ok: false, error: parent + ": no such directory" };
    files[path] = append && isFile(path) ? files[path] + content : content;
    persist();
    return { ok: true };
  }

  function readFile(path) {
    const absolute = normalizePath(path);
    if (isFile(absolute)) return files[absolute];
    if (isDir(absolute)) return null;
    return undefined;
  }

  function listDir(path, showAll, longFormat) {
    const children = childrenOf(path);
    if (showAll) children.unshift([".", "dir"], ["..", "dir"]);
    if (!children.length) return "";
    return children.map(([name, kind]) => {
      if (!longFormat) return kind === "dir" ? name + "/" : name;
      const perms = kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
      const size = kind === "dir" ? "4096" : String((files[path === "/" ? "/" + name : path + "/" + name] || "").length);
      return perms + " 1 token token " + size.padStart(5, " ") + " Nov 05 16:27 " + (kind === "dir" ? name + "/" : name);
    }).join("\n");
  }

  function deletePath(path, recursive) {
    if (path === "/" || path === "/home" || path === "/home/token" || path === "/etc") return "rm: refusing to remove protected system path";
    if (isFile(path)) { delete files[path]; persist(); return ""; }
    if (isDir(path)) {
      const contents = childrenOf(path);
      if (contents.length && !recursive) return "rm: " + path + ": directory not empty (use -r)";
      contents.forEach(([name, kind]) => deletePath(path + "/" + name, true));
      dirs.delete(path);
      persist();
      return "";
    }
    return "rm: cannot remove '" + path + "': no such file or directory";
  }

  const helpText = [
    "TKEN27 COMMAND INDEX",
    "--------------------",
    "FILES / DIRECTORIES",
    "  ls [-la] [path]       list directory contents",
    "  cd [path]             change directory",
    "  pwd                   print current directory",
    "  cat FILE...           print file contents",
    "  less FILE             read a file (simple pager)",
    "  head / tail FILE      show first / last lines",
    "  touch FILE            create an empty file",
    "  mkdir [-p] DIR        create directory",
    "  rm [-r] PATH          remove virtual file or directory",
    "  cp SRC DEST           copy a file",
    "  mv SRC DEST           move / rename a file",
    "  tree [path]           print a directory tree",
    "  find [path] [name]    find matching paths",
    "  file / stat / du      inspect virtual files",
    "",
    "TEXT / SHELL",
    "  echo / printf         print text",
    "  grep [-in] PATTERN    search text or piped input",
    "  wc / sort / uniq      text utilities",
    "  cut / tr / rev        small text transformations",
    "  history               show recent commands",
    "  which / whereis       locate a command",
    "  man COMMAND           read a command manual",
    "  clear / cls           clear the screen",
    "  command1 | command2   pipe output between commands",
    "  command > FILE        redirect output to a file",
    "",
    "SYSTEM",
    "  whoami / id / hostname / uname",
    "  date / cal / uptime / ps / top",
    "  free / df / env / printenv",
    "  neofetch / fortune / cowsay",
    "  reboot                replay the boot sequence",
    "  exit                  close the simulated session",
    "",
    "TOKEN / FEMTANYL",
    "  token [info|look|lore|mood|stats|songs]",
    "  token pet | feed | bite | scream | dance | quote",
    "  femtanyl              show the track index",
    "  about                 information about this shell",
    "",
    "This is a browser simulation. Pipes and redirects operate only on its virtual files."
  ].join("\n");

  const manuals = {
    ls: "ls — list virtual directory contents\nUsage: ls [-a] [-l] [PATH]\nOptions: -a include dot entries; -l use a long listing.",
    cd: "cd — change the current virtual directory\nUsage: cd [PATH]\nWith no path, returns to /home/token. Use cd - for the previous directory.",
    cat: "cat — concatenate and print files\nUsage: cat FILE...\nAlso accepts input from a pipe.",
    grep: "grep — search for matching lines\nUsage: grep [-i] [-n] PATTERN [FILE...]\nWith no file, grep reads piped input.",
    mkdir: "mkdir — create virtual directories\nUsage: mkdir [-p] DIRECTORY...",
    rm: "rm — remove virtual files\nUsage: rm [-r] PATH...\nProtected system directories cannot be removed.",
    token: "token — inspect or interact with the resident mascot\nUsage: token [info|look|lore|mood|stats|songs|quote|pet|feed|bite|scream|dance]",
    history: "history — print commands entered during this browser session\nUsage: history",
    help: "help — show the command index\nUsage: help"
  };

  function dispatch(args, stdin) {
    if (!args.length) return { output: stdin || "", ok: true };
    const cmd = args[0].toLowerCase();
    const a = args.slice(1);
    const argText = a.join(" ");
    const fail = (message) => ({ output: message, ok: false });
    const pass = (text) => ({ output: text == null ? "" : String(text), ok: true });
    const resolveArgs = (list) => list.map((p) => normalizePath(p));

    if (cmd === "help" || cmd === "?" ) return pass(helpText);
    if (cmd === "clear" || cmd === "cls") { clearScreen(); return pass(""); }
    if (cmd === "pwd") return pass(cwd);
    if (cmd === "whoami") return pass("token");
    if (cmd === "hostname") return pass("tken27");
    if (cmd === "id") return pass("uid=1000(token) gid=1000(token) groups=1000(token),27(femtanyl)");
    if (cmd === "uname") return pass(a.includes("-a") ? "TKEN27 tken27 27.11-token #27 SMP browser x86_64 GNU/TOKEN" : "TKEN27");
    if (cmd === "date") return pass(new Date().toString());
    if (cmd === "uptime") {
      const s = Math.floor((Date.now() - sessionStart) / 1000);
      return pass("up " + Math.floor(s / 60) + " min, " + (s % 60) + " sec, 1 user, load average: 0.27, 0.27, 0.27");
    }
    if (cmd === "cal") {
      const d = new Date();
      const year = Number(a[1]) || d.getFullYear();
      const month = (Number(a[0]) || (d.getMonth() + 1)) - 1;
      if (month < 0 || month > 11) return fail("cal: month must be between 1 and 12");
      const first = new Date(year, month, 1);
      const count = new Date(year, month + 1, 0).getDate();
      let result = "     " + first.toLocaleString(undefined, { month: "long" }) + " " + year + "\nSu Mo Tu We Th Fr Sa\n";
      result += "   ".repeat(first.getDay());
      for (let day = 1; day <= count; day += 1) {
        result += String(day).padStart(2, " ") + (new Date(year, month, day).getDay() === 6 ? "\n" : " ");
      }
      return pass(result);
    }
    if (cmd === "echo") return pass(a.join(" "));
    if (cmd === "printf") return pass(a.join(" ").replace(/\\n/g, "\n").replace(/\\t/g, "\t"));
    if (cmd === "history") return pass(history.map((line, i) => String(i + 1).padStart(4, " ") + "  " + line).join("\n"));
    if (cmd === "env" || cmd === "printenv") return pass("HOME=/home/token\nUSER=token\nSHELL=/bin/tknsh\nHOSTNAME=tken27\nTERM=xterm-256color\nTOKEN_MOOD=" + tokenMood + "\nPATH=/usr/local/bin:/usr/bin:/bin");
    if (cmd === "which" || cmd === "whereis") {
      const commands = ["ls","cd","pwd","cat","echo","grep","head","tail","wc","sort","uniq","cut","tr","rev","mkdir","touch","rm","cp","mv","find","tree","token","femtanyl","help","man","clear","uname","date","whoami","neofetch","fortune","cowsay","history"];
      return pass(a.map((name) => commands.includes(name) ? name + ": /usr/bin/" + name : name + " not found").join("\n"));
    }
    if (cmd === "man") {
      if (!a[0]) return fail("What manual page do you want? Try: man token");
      return pass(manuals[a[0]] || ("No manual entry for " + a[0] + ". Try 'help'."));
    }
    if (cmd === "neofetch") {
      return pass([
        "      /\_/\\       token@tken27",
        "     ( o.o )      ----------------",
        "      > ^ <       OS: TKEN27 Token Shell",
        "                  Kernel: 27.11-token",
        "                  Host: browser",
        "                  Shell: /bin/tknsh",
        "                  Files: " + Object.keys(files).length + " virtual files",
        "                  Mood: " + tokenMood,
        "                  Uptime: " + Math.floor((Date.now() - sessionStart) / 1000) + " seconds"
      ].join("\n"));
    }
    if (cmd === "ps" || cmd === "top") return pass(" PID TTY          TIME CMD\n  1 pts/0    00:00:00 tkn-init\n 27 pts/0    00:00:00 token.service\n 42 pts/0    00:00:0" + commandCount + " tknsh\n 73 pts/0    00:00:00 " + cmd);
    if (cmd === "free") return pass("               total        used        free\nMem:           4096M        271M       3825M\nSwap:          1024M          0M       1024M\n\nvirtual values; your real memory is not queried.");
    if (cmd === "df") return pass("Filesystem      Size  Used Avail Use% Mounted on\n/dev/token       27G  2.7G   24G  11% /");
    if (cmd === "ping") return pass("PING " + (a[0] || "tken27") + ": simulated local response\n64 bytes from tken27: seq=1 ttl=64 time=0.27 ms\n64 bytes from tken27: seq=2 ttl=64 time=0.27 ms\n--- simulation complete; no network packets were sent ---");
    if (cmd === "ifconfig" || cmd === "ip") return pass("lo: flags=73<UP,LOOPBACK,RUNNING>\n    inet 127.0.0.1  netmask 255.0.0.0\n    inet6 ::1  prefixlen 128\neth0: flags=4099<UP,BROADCAST,MULTICAST>\n    state: imaginary-but-up");
    if (cmd === "fortune") {
      const sayings = ["the cat has root privileges. the cat will not explain why.","every crash is just an undocumented feature with dramatic timing.","back up your files. token will not.","the machine is haunted. the haunted machine is also low on disk space.","stay weird. check your permissions."];
      return pass(sayings[Math.floor(Math.random() * sayings.length)]);
    }
    if (cmd === "cowsay") {
      const msg = argText || stdin || "meow";
      const border = "-".repeat(Math.min(58, Math.max(4, msg.length + 2)));
      return pass(" " + border + "\n< " + msg.slice(0, 56) + " >\n " + border + "\n        \\   /\_/\\\n         \\ ( o.o )\n            > ^ <");
    }
    if (cmd === "token") {
      const sub = (a[0] || "help").toLowerCase();
      const responses = {
        help: "TOKEN COMMANDS\n  token info     basic character notes\n  token look     visual design notes\n  token lore     creator notes vs fan interpretation\n  token mood     current shell mood\n  token stats    session stats\n  token songs    Femtanyl track index\n  token quote    get a tiny terminal quote\n  token pet      attempt a head pat\n  token feed     offer a snack\n  token bite     do not stand that close\n  token scream   make some noise\n  token dance    move around a little",
        info: "TOKEN // Femtanyl's recurring mascot.\nA fictional, cat-like character used throughout the project's visual identity.\nThe design and presentation vary between artworks.",
        look: "VISUAL READOUT\n- mostly white, cat-like body\n- large pointed ears\n- dark eyes in many illustrations\n- small fangs\n- paw-like hands / claws in some artwork\n- appearance changes between covers and drawings",
        lore: "LORE STATUS: PARTLY UNDOCUMENTED\nThe creator has described Token as a vessel for the music.\nThe fandom wiki documents additional lore, including immortality and genderlessness,\nbut those details should not automatically be treated as creator-confirmed canon.",
        mood: "current mood: " + tokenMood + "\nprocess state: awake, technically",
        stats: "TOKEN SESSION STATS\ncommands processed: " + commandCount + "\nshell uptime: " + Math.floor((Date.now() - sessionStart) / 1000) + "s\ncurrent mood: " + tokenMood + "\npermanent damage: not tracked",
        songs: "FEMTANYL TRACK INDEX\n" + files["/usr/share/femtanyl/tracks.txt"],
        quote: ["\"you opened the terminal. the terminal opened you.\"","\"no thoughts. only buffer overflow.\"","\"be right back. becoming a warning message.\"","\"i have read the manual. i reject the manual.\""][Math.floor(Math.random() * 4)],
        pet: " *pat pat*\nToken tolerates this. for now.",
        feed: "snack accepted. inventory updated: 1 (imaginary)",
        bite: "BAD IDEA. Token's little fangs connect with your hand.\nHP: -1   dignity: -5",
        scream: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n[warning] sound driver has left the chat",
        dance: "  \\o/     \n   |     token.exe is dancing\n  / \\     [==..........]  27%"
      };
      if (sub === "mood") return pass("current mood: " + tokenMood);
      if (sub === "pet") tokenMood = "mildly appeased";
      if (sub === "feed") tokenMood = "snack-focused";
      if (sub === "bite") tokenMood = "feral";
      if (sub === "dance") tokenMood = "overclocked";
      if (sub === "scream") tokenMood = "loud";
      if (responses[sub]) return pass(responses[sub]);
      return fail("token: unknown subcommand '" + sub + "'. Try 'token help'.");
    }
    if (cmd === "femtanyl") return pass("FEMTANYL // TRACK INDEX\n" + files["/usr/share/femtanyl/tracks.txt"] + "\n\nuse: cat /usr/share/femtanyl/tracks.txt");
    if (cmd === "about") return pass("TKEN27 is a Token-themed browser terminal.\nIt has a small virtual filesystem, command history, text tools, pipes and redirects.\nIt does not run Linux, execute programs, or access your device files.");
    if (cmd === "version") return pass("tknsh 27.11.0 (browser build)");
    if (cmd === "reboot" || cmd === "reboot-now") {
      print("restarting simulated shell...", "muted");
      window.setTimeout(() => { sessionStart = Date.now(); bootScreen.style.display = "grid"; boot(); }, 450);
      return pass("");
    }
    if (cmd === "exit" || cmd === "logout") return pass("session still running. close the tab to leave. token says bye.");
    if (cmd === "poweroff" || cmd === "shutdown") return pass("poweroff: this is only a browser simulation. your device stays on.");
    if (cmd === "sudo" || cmd === "su") return fail("nope. Token has the only root password and is not sharing.");
    if (cmd === "apt" || cmd === "apt-get" || cmd === "dnf" || cmd === "pacman") return fail("package manager unavailable: this userspace is read-only outside its virtual home.");
    if (cmd === "curl" || cmd === "wget" || cmd === "ssh" || cmd === "scp") return fail(cmd + ": network access is disabled in this terminal simulation.");
    if (cmd === "kill") return fail("kill: permission denied. token.service is protected.");
    if (cmd === "yes") return pass((argText || "y") + "\n" + (argText || "y") + "\n" + (argText || "y") + "\n... output capped to avoid flooding the terminal.");
    if (cmd === "seq") {
      let start = 1, end = Number(a[0]), step = 1;
      if (a.length > 1) { start = Number(a[0]); end = Number(a[1]); }
      if (a.length > 2) step = Number(a[2]) || 1;
      if (!Number.isFinite(end) || end - start > 500) return fail("seq: provide a range smaller than 500");
      const values = [];
      for (let n = start; step > 0 ? n <= end : n >= end; n += step) values.push(n);
      return pass(values.join("\n"));
    }

    if (cmd === "cd") {
      const target = normalizePath(a[0] || "/home/token");
      if (!isDir(target)) return fail("cd: " + (a[0] || "~") + ": no such directory");
      window.__tkenPreviousDir = cwd;
      cwd = target;
      setPrompt();
      return pass("");
    }
    if (cmd === "ls" || cmd === "dir") {
      let showAll = false, longFormat = false, pathArg = null;
      a.forEach((item) => { if (item.startsWith("-")) { if (item.includes("a")) showAll = true; if (item.includes("l")) longFormat = true; } else pathArg = item; });
      const target = normalizePath(pathArg || cwd);
      if (!isDir(target)) return fail("ls: cannot access '" + (pathArg || target) + "': no such directory");
      return pass(listDir(target, showAll, longFormat));
    }
    if (cmd === "cat" || cmd === "less" || cmd === "more" || cmd === "type") {
      if (!a.length) return stdin ? pass(stdin) : fail(cmd + ": missing file operand");
      const result = [];
      for (const name of a) {
        const path = normalizePath(name);
        if (isFile(path)) result.push(files[path]);
        else if (isDir(path)) result.push("cat: " + name + ": is a directory");
        else result.push("cat: " + name + ": no such file");
      }
      return pass(result.join("\n"));
    }
    if (cmd === "touch") {
      if (!a.length) return fail("touch: missing file operand");
      const errors = [];
      a.forEach((name) => {
        const path = normalizePath(name);
        if (isDir(path)) return;
        const parent = parentPath(path);
        if (!isDir(parent)) errors.push("touch: " + name + ": parent directory does not exist");
        else if (!isFile(path)) files[path] = "";
      });
      persist();
      return errors.length ? fail(errors.join("\n")) : pass("");
    }
    if (cmd === "mkdir") {
      const recursive = a.includes("-p");
      const names = a.filter((item) => !item.startsWith("-"));
      if (!names.length) return fail("mkdir: missing operand");
      const errors = [];
      names.forEach((name) => {
        const path = normalizePath(name);
        if (exists(path)) { if (!recursive) errors.push("mkdir: cannot create directory '" + name + "': file exists"); return; }
        if (recursive) {
          let walk = "";
          path.split("/").filter(Boolean).forEach((part) => { walk += "/" + part; dirs.add(walk); });
        } else if (isDir(parentPath(path))) dirs.add(path);
        else errors.push("mkdir: cannot create directory '" + name + "': parent does not exist");
      });
      persist();
      return errors.length ? fail(errors.join("\n")) : pass("");
    }
    if (cmd === "rm" || cmd === "rmdir") {
      const recursive = a.includes("-r") || a.includes("-R") || a.includes("-rf") || a.includes("-fr") || cmd === "rmdir";
      const names = a.filter((item) => !item.startsWith("-"));
      if (!names.length) return fail(cmd + ": missing operand");
      const errors = names.map((name) => deletePath(normalizePath(name), recursive)).filter(Boolean);
      return errors.length ? fail(errors.join("\n")) : pass("");
    }
    if (cmd === "cp" || cmd === "mv") {
      if (a.length < 2) return fail(cmd + ": missing file operand");
      const src = normalizePath(a[0]);
      const dest = normalizePath(a[1]);
      if (!isFile(src)) return fail(cmd + ": cannot stat '" + a[0] + "': no such file");
      const finalDest = isDir(dest) ? normalizePath(dest + "/" + baseName(src)) : dest;
      if (!isDir(parentPath(finalDest))) return fail(cmd + ": destination directory does not exist");
      files[finalDest] = files[src];
      if (cmd === "mv") delete files[src];
      persist();
      return pass("");
    }
    if (cmd === "tree") {
      const root = normalizePath(a[0] || cwd);
      if (!isDir(root)) return fail("tree: " + root + ": no such directory");
      const lines = [root];
      function walk(path, prefix, depth) {
        if (depth > 8) return;
        const children = childrenOf(path);
        children.forEach(([name, kind], index) => {
          const last = index === children.length - 1;
          lines.push(prefix + (last ? "└── " : "├── ") + name + (kind === "dir" ? "/" : ""));
          if (kind === "dir") walk(path + "/" + name, prefix + (last ? "    " : "│   "), depth + 1);
        });
      }
      walk(root, "", 0);
      return pass(lines.join("\n"));
    }
    if (cmd === "find") {
      const root = normalizePath(a[0] && !a[0].startsWith("-") ? a[0] : ".");
      const pattern = a[1] || "*";
      if (!isDir(root)) return fail("find: '" + root + "': no such directory");
      const matches = [];
      function walk(path) {
        if (baseName(path).toLowerCase().includes(pattern.replace(/\*/g, "").toLowerCase()) || pattern === "*") matches.push(path);
        childrenOf(path).forEach(([name, kind]) => walk(path + "/" + name));
      }
      walk(root);
      return pass(matches.join("\n"));
    }
    if (cmd === "head" || cmd === "tail") {
      let count = 10;
      const nIndex = a.indexOf("-n");
      if (nIndex >= 0 && a[nIndex + 1]) count = Math.max(1, Math.min(500, Number(a[nIndex + 1]) || 10));
      const name = a.filter((x, i) => x !== "-n" && (nIndex < 0 || i !== nIndex + 1))[0];
      const content = name ? readFile(name) : stdin;
      if (content === undefined || content === null) return fail(cmd + ": missing file or input");
      const lines = String(content).split("\n");
      return pass((cmd === "head" ? lines.slice(0, count) : lines.slice(-count)).join("\n"));
    }
    if (cmd === "wc") {
      const content = a.length ? a.filter((x) => !x.startsWith("-")).map((name) => readFile(name) || "").join("\n") : (stdin || "");
      if (!a.length && !stdin) return fail("wc: missing file or input");
      const lines = content.length ? content.split("\n").length : 0;
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      const bytes = new TextEncoder().encode(content).length;
      const flags = a.filter((x) => x.startsWith("-")).join("");
      return pass((flags.includes("l") ? lines + " " : "") + (flags.includes("w") ? words + " " : "") + (flags.includes("c") ? bytes + " " : (!flags ? lines + " " + words + " " + bytes : "")) + (a.find((x) => !x.startsWith("-")) || ""));
    }
    if (cmd === "grep") {
      const ignoreCase = a.includes("-i") || a.includes("-in") || a.includes("-ni");
      const showNumber = a.includes("-n") || a.includes("-in") || a.includes("-ni");
      const positional = a.filter((x) => !x.startsWith("-"));
      if (!positional.length) return fail("grep: missing pattern");
      const pattern = positional[0];
      const source = positional.length > 1 ? positional.slice(1).map((name) => readFile(name) || "").join("\n") : (stdin || "");
      if (!source && positional.length === 1 && !stdin) return fail("grep: missing input (try grep PATTERN FILE)");
      const needle = ignoreCase ? pattern.toLowerCase() : pattern;
      const matches = source.split("\n").map((line, i) => ({ line, i })).filter((item) => (ignoreCase ? item.line.toLowerCase() : item.line).includes(needle));
      return pass(matches.map((item) => (showNumber ? (item.i + 1) + ":" : "") + item.line).join("\n"));
    }
    if (cmd === "sort") {
      const content = a.length ? a.filter((x) => !x.startsWith("-")).map((name) => readFile(name) || "").join("\n") : (stdin || "");
      if (!content && !a.length) return fail("sort: missing input");
      const sorted = content.split("\n").sort((x, y) => x.localeCompare(y));
      if (a.includes("-r")) sorted.reverse();
      return pass(sorted.join("\n"));
    }
    if (cmd === "uniq") {
      const content = a[0] ? readFile(a[0]) : stdin;
      if (content == null) return fail("uniq: missing input");
      return pass(content.split("\n").filter((line, i, all) => i === 0 || line !== all[i - 1]).join("\n"));
    }
    if (cmd === "rev") {
      const content = a[0] ? (readFile(a[0]) || "") : (stdin || "");
      if (!content && !a.length) return fail("rev: missing input");
      return pass(content.split("\n").map((line) => Array.from(line).reverse().join("")).join("\n"));
    }
    if (cmd === "cut") {
      const fieldFlag = a.indexOf("-f");
      const delimFlag = a.indexOf("-d");
      const field = fieldFlag >= 0 ? Math.max(1, Number(a[fieldFlag + 1]) || 1) - 1 : 0;
      const delim = delimFlag >= 0 ? a[delimFlag + 1] : "\t";
      const name = a.find((x, i) => !x.startsWith("-") && i !== fieldFlag + 1 && i !== delimFlag + 1);
      const content = name ? (readFile(name) || "") : stdin;
      if (content == null) return fail("cut: missing input");
      return pass(content.split("\n").map((line) => line.split(delim)[field] || "").join("\n"));
    }
    if (cmd === "tr") {
      const content = stdin || "";
      if (a.length < 2) return fail("tr: usage: tr FROM TO (use a pipe)");
      const from = a[0], to = a[1];
      let result = content;
      for (let i = 0; i < from.length; i += 1) result = result.split(from[i]).join(to[Math.min(i, to.length - 1)] || "");
      return pass(result);
    }
    if (cmd === "basename") return pass(baseName(normalizePath(a[0] || ".")));
    if (cmd === "dirname") return pass(parentPath(normalizePath(a[0] || ".")));
    if (cmd === "realpath") return pass(normalizePath(a[0] || "."));
    if (cmd === "file") return pass(a.map((name) => {
      const p = normalizePath(name);
      return name + ": " + (isDir(p) ? "directory" : isFile(p) ? (files[p].length ? "ASCII text" : "empty") : "cannot open (no such file)");
    }).join("\n"));
    if (cmd === "stat") return pass(a.map((name) => {
      const p = normalizePath(name);
      if (!exists(p)) return "stat: cannot stat '" + name + "': no such file";
      return "  File: " + p + "\n  Type: " + (isDir(p) ? "directory" : "regular file") + "\n  Size: " + (isFile(p) ? files[p].length : 4096) + "\n  Owner: token:token";
    }).join("\n"));
    if (cmd === "du") {
      const root = normalizePath(a[0] || cwd);
      let size = 0;
      Object.keys(files).forEach((p) => { if (p.startsWith(root === "/" ? "/" : root + "/")) size += files[p].length; });
      return pass(Math.max(4, Math.ceil(size / 1024) * 4) + "K\t" + root);
    }
    if (cmd === "chmod" || cmd === "chown") return fail(cmd + ": permissions are decorative in this simulation.");
    if (cmd === "alias") return pass("ll='ls -la'\nla='ls -a'\n..='cd ..'\ntkn='token'");
    if (cmd === "history") return pass(history.map((line, i) => String(i + 1).padStart(4, " ") + "  " + line).join("\n"));

    return fail(cmd + ": command not found. Type 'help' to see available commands.");
  }

  function executePipeline(stages) {
    let stdin = "";
    let redirect = null;
    let append = false;
    const cleanStages = stages.map((stage) => stage.slice());
    const last = cleanStages[cleanStages.length - 1];
    const redirectIndex = last.findIndex((token) => token === ">" || token === ">>");
    if (redirectIndex >= 0) {
      redirect = last[redirectIndex + 1];
      append = last[redirectIndex] === ">>";
      last.splice(redirectIndex, 2);
      if (!redirect) return { output: "syntax error: expected file after redirection", ok: false };
    }
    let result = { output: "", ok: true };
    for (const stage of cleanStages) {
      const args = stage.filter(Boolean);
      if (!args.length) continue;
      result = dispatch(args, stdin);
      stdin = result.output;
      if (!result.ok) break;
    }
    if (redirect && result.ok) {
      const write = writeFile(redirect, result.output + (append && isFile(normalizePath(redirect)) && result.output ? "\n" : ""), append);
      if (!write.ok) return { output: write.error, ok: false };
      return { output: "", ok: true };
    }
    return result;
  }

  function executeLine(line) {
    const tokens = tokenize(line);
    if (!tokens.length) return;
    const groups = [];
    let current = [];
    let separator = ";";
    tokens.forEach((token) => {
      if (token === ";" || token === "&&") {
        groups.push({ tokens: current, separator: separator });
        current = [];
        separator = token;
      } else current.push(token);
    });
    groups.push({ tokens: current, separator: separator });

    let priorOk = true;
    for (const group of groups) {
      if (group.separator === "&&" && !priorOk) continue;
      const stages = [];
      let stage = [];
      group.tokens.forEach((token) => {
        if (token === "|") { stages.push(stage); stage = []; }
        else stage.push(token);
      });
      stages.push(stage);
      const result = executePipeline(stages);
      priorOk = result.ok;
      if (result.output) print(result.output, result.ok ? "" : "error");
    }
  }

  function availableCompletions(partial) {
    const commandNames = ["help","clear","ls","cd","pwd","cat","echo","printf","touch","mkdir","rm","rmdir","cp","mv","tree","find","head","tail","grep","wc","sort","uniq","cut","tr","rev","history","man","which","whoami","id","hostname","uname","date","cal","uptime","ps","top","free","df","env","printenv","neofetch","fortune","cowsay","token","femtanyl","about","version","reboot","exit","ping","ifconfig"];
    const pathPart = partial.includes("/") || partial.startsWith("~");
    if (!pathPart) return commandNames.filter((name) => name.startsWith(partial));
    const slash = partial.lastIndexOf("/");
    const dirText = slash >= 0 ? partial.slice(0, slash + 1) : "";
    const nameText = slash >= 0 ? partial.slice(slash + 1) : partial;
    const dir = normalizePath(dirText || ".");
    if (!isDir(dir)) return [];
    return childrenOf(dir).map(([name, kind]) => dirText + name + (kind === "dir" ? "/" : "")).filter((name) => name.slice(name.lastIndexOf("/") + 1).startsWith(nameText));
  }

  commandForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    if (!line) return;
    commandEcho(line);
    history.push(line);
    history = history.slice(-100);
    historyIndex = history.length;
    commandCount += 1;
    persist();
    input.value = "";
    tabMatches = [];
    executeLine(line);
    setPrompt();
    screen.scrollTop = screen.scrollHeight;
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length) { historyIndex = Math.max(0, historyIndex - 1); input.value = history[historyIndex] || ""; }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      const raw = input.value;
      const partial = raw.split(/\s+/).pop() || "";
      if (!tabMatches.length) { tabMatches = availableCompletions(partial); tabIndex = 0; }
      if (tabMatches.length === 1) input.value = raw.slice(0, raw.length - partial.length) + tabMatches[0] + (isDir(normalizePath(tabMatches[0])) ? "" : " ");
      else if (tabMatches.length > 1) {
        const prefix = tabMatches.reduce((p, item) => {
          let i = 0; while (i < p.length && i < item.length && p[i] === item[i]) i += 1;
          return p.slice(0, i);
        });
        if (prefix.length > partial.length) input.value = raw.slice(0, raw.length - partial.length) + prefix;
        else print(tabMatches.join("    "), "muted");
      }
    } else if (event.key === "Escape") {
      input.value = "";
      tabMatches = [];
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      clearScreen();
    } else if (event.key === "c" && event.ctrlKey) {
      event.preventDefault();
      print("^C", "muted");
      input.value = "";
    } else {
      tabMatches = [];
    }
  });

  terminalShell.addEventListener("click", () => input.focus());
  $("skipBoot").addEventListener("click", () => { window.clearInterval(bootTimer); bootIndex = bootLines.length; bootProgress.style.width = "100%"; showTerminal(); });
  function updateClock() { clock.textContent = new Date().toLocaleTimeString([], { hour12: false }); }
  window.setInterval(updateClock, 1000);
  boot();
})();