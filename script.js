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
  const crashScreen = $("crashScreen");
  const restartSystem = $("restartSystem");

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
    "/home/token/.token-diary.txt": "ok so\n\ni found this terminal and decided it was mine now.\nit has snacks (not real ones), music, and a suspicious amount of storage.\n\nif anyone asks, i was never here.\n\n- t",
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
  let tabIndex = -1;
  let historySearchQuery = "";
  let historySearchIndex = -1;
  let historySearchActive = false;
  const aliases = Object.assign(Object.create(null), {
    ll: "ls -la",
    la: "ls -a",
    "..": "cd ..",
    tkn: "token"
  });
  const shellVars = {
    HOME: "/home/token",
    USER: "token",
    SHELL: "/bin/tknsh",
    HOSTNAME: "tken27",
    TERM: "xterm-256color",
    PATH: "/usr/local/bin:/usr/bin:/bin",
    PWD: "/home/token",
    OLDPWD: "/home/token"
  };
  let stopwatchStartedAt = null;
  let stopwatchElapsed = 0;
  const stopwatchLaps = [];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (saved && typeof saved === "object") {
      (saved.files || []).forEach((entry) => {
        if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string" && !Object.prototype.hasOwnProperty.call(initialFiles, entry[0])) files[entry[0]] = entry[1];
      });
      (saved.dirs || []).forEach((dir) => { if (typeof dir === "string") dirs.add(dir); });
      (saved.overrides || []).forEach((entry) => {
        if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string" && Object.prototype.hasOwnProperty.call(initialFiles, entry[0])) files[entry[0]] = entry[1];
      });
      (saved.deletedFiles || []).forEach((path) => {
        if (typeof path === "string" && Object.prototype.hasOwnProperty.call(initialFiles, path)) delete files[path];
      });
      (saved.deletedDirs || []).forEach((path) => {
        if (typeof path === "string") dirs.delete(path);
      });
    }
    const savedHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    if (Array.isArray(savedHistory)) history = savedHistory.filter((x) => typeof x === "string").slice(-100);
  } catch (_) {}

  function persist() {
    try {
      const baseDirs = ["/", "/home", "/home/token", "/etc", "/var", "/var/log", "/usr", "/usr/share", "/usr/share/femtanyl", "/tmp"];
      const customFiles = Object.keys(files).filter((path) => !Object.prototype.hasOwnProperty.call(initialFiles, path)).map((path) => [path, files[path]]);
      const overrides = Object.keys(initialFiles).filter((path) => Object.prototype.hasOwnProperty.call(files, path) && files[path] !== initialFiles[path]).map((path) => [path, files[path]]);
      const deletedFiles = Object.keys(initialFiles).filter((path) => !Object.prototype.hasOwnProperty.call(files, path));
      const customDirs = Array.from(dirs).filter((path) => !baseDirs.includes(path));
      const deletedDirs = baseDirs.filter((path) => !dirs.has(path));
      localStorage.setItem(storageKey, JSON.stringify({ files: customFiles, dirs: customDirs, overrides: overrides, deletedFiles: deletedFiles, deletedDirs: deletedDirs }));
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

  const maxOutputLines = 1600;
  function trimOutput() {
    while (output.childNodes.length > maxOutputLines) output.removeChild(output.firstChild);
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
    trimOutput();
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
    trimOutput();
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
        window.setTimeout(showTerminal, reduced ? 50 : 180);
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
    }, 190);
    if (!output.childNodes.length) {
      print("TKEN27 Token Shell [version 27.11]", "accent");
      print("Terminal's up. Try not to break anything I might be using.");
      print("");
      print("Type 'help' for commands. Type 'token' if you want to talk to me.");
      print("");
      print("I'm online. Don't make it weird.", "muted");
      print("");
    }
    setPrompt();
    updateClock();
  }

  function showCrashScreen() {
    if (!crashScreen || !restartSystem) return;
    terminalShell.classList.add("hidden");
    crashScreen.hidden = false;
    restartSystem.focus();
  }

  restartSystem.addEventListener("click", () => {
    crashScreen.hidden = true;
    bootScreen.style.display = "";
    boot();
  });

  function tokenize(line) {
    const tokens = [];
    let current = "";
    let quote = null;
    let escaped = false;
    const flush = () => { if (current.length) { tokens.push(current); current = ""; } };
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (escaped) { current += ch === "$" ? "\uE000" : ch; escaped = false; continue; }
      if (ch === "\\" && quote !== "'") { escaped = true; continue; }
      if (quote) {
        if (ch === quote) quote = null;
        else current += quote === "'" && ch === "$" ? "\uE000" : ch;
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
    const children = childrenOf(path).filter(([name]) => showAll || !name.startsWith("."));
    if (showAll) children.unshift([".", "dir"], ["..", "dir"]);
    if (!children.length) return "";
    const now = new Date();
    const stamp = now.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    return children.map(([name, kind]) => {
      if (!longFormat) return kind === "dir" ? name + "/" : name;
      const size = kind === "dir" ? "4096" : String((files[path === "/" ? "/" + name : path + "/" + name] || "").length);
      const perms = kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
      return perms + " 1 token token " + size.padStart(5, " ") + " " + stamp + " " + (kind === "dir" ? name + "/" : name);
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
    "TKEN27 // COMMAND INDEX",
    "======================",
    "FILES / DIRECTORIES",
    "  ls [-la] [PATH]       list files and folders",
    "  cd [PATH]             change directory",
    "  pwd                   print current directory",
    "  cat FILE...           print file contents",
    "  less / more FILE      read a file",
    "  touch FILE            create an empty file",
    "  write FILE TEXT       create or replace a file",
    "  append FILE TEXT      append text to a file",
    "  mkdir [-p] DIR        create directories",
    "  rm [-r] PATH          remove a file or directory",
    "  cp SRC DEST           copy a file",
    "  mv SRC DEST           move or rename a file",
    "  tree / find           explore the virtual filesystem",
    "  file / stat / du      inspect files and disk usage",
    "",
    "TEXT TOOLS",
    "  head / tail / tac     read selected or reversed lines",
    "  nl / fold             number or wrap lines",
    "  grep / cut / tr       search and transform text",
    "  sort / uniq / paste   sort, deduplicate and join text",
    "  wc / rev / diff       count, reverse and compare",
    "  base64 [-d]           encode or decode text",
    "  hash FILE             calculate a simple FNV-1a checksum",
    "  calc EXPRESSION       evaluate basic arithmetic",
    "  random [MIN] [MAX]    generate a random integer",
    "  uuid                  generate a pseudo-random UUID",
    "  json [-c] [FILE]       validate and format JSON",
    "  rot13 [FILE]          rotate letters by 13 places",
    "  replace FILE OLD NEW  replace literal text in a file",
    "  timer start/stop/lap  run a simple stopwatch",
    "  download FILE         download a virtual file",
    "  mobile [on|off|status] switch to a temporary phone-friendly layout",
    "  desktop               restore the normal terminal layout",
    "  crash-test             show the simulated system crash screen",
    "",
    "SHELL",
    "  history [-c] [-n N]   show, clear or limit command history",
    "  Ctrl+R                search backward through command history",
    "  alias / unalias       create or remove command shortcuts",
    "  export / unset        manage session variables",
    "  echo / printf         print text",
    "  command1 | command2   pipe output between commands",
    "  command > FILE        redirect output to a virtual file",
    "  command1 ; command2   run commands in sequence",
    "  command1 && command2  run second command only on success",
    "",
    "SYSTEM",
    "  whoami / id / uname   identity and system info",
    "  date / cal / uptime   clock and session info",
    "  ps / top / free / df  simulated system status",
    "  env / printenv        show session variables",
    "  neofetch / fortune    extra terminal flavor",
    "  reboot / exit         restart or leave the session",
    "",
    "TOKEN // try talking to me",
    "  token                 say hello",
    "  token help            list my commands",
    "  token info / look     about me",
    "  token lore / diary    lore and a hidden note",
    "  token mood / stats    current mood and session stats",
    "  token songs / quote   music and random thoughts",
    "  token pet / feed      attempt diplomacy",
    "  token hug / boop      try your luck",
    "  token bite / poke     consequences",
    "  token highfive        slap hands",
    "  token choose A B      let me pick one",
    "  token roll / flip     random results",
    "  token ask / joke      ask me something",
    "  token say TEXT        make me type something",
    "  token dance / scream  chaos",
    "  femtanyl              show the track index",
    "",
    "This is a browser simulation. Commands only touch the virtual filesystem."
  ].join("\n");

  const manuals = {
    ls: "ls — list virtual directory contents\nUsage: ls [-a] [-l] [PATH]\nOptions: -a include dot entries; -l use a long listing.",
    cd: "cd — change the current virtual directory\nUsage: cd [PATH]\nWith no path, returns to /home/token. Use cd - for the previous directory.",
    cat: "cat — concatenate and print files\nUsage: cat FILE...\nAlso accepts input from a pipe.",
    grep: "grep — search for matching lines\nUsage: grep [-i] [-n] [-v] PATTERN [FILE...]\nWith no file, grep reads piped input.",
    mkdir: "mkdir — create virtual directories\nUsage: mkdir [-p] DIRECTORY...",
    rm: "rm — remove virtual files\nUsage: rm [-r] PATH...\nProtected system directories cannot be removed.",
    token: "token — text interactions with the terminal's resident mascot\nUsage: token [hello|help|info|look|lore|diary|mood|stats|songs|quote|ask|joke|say|pet|feed|hug|boop|highfive|bite|poke|choose|roll|flip|dance|scream|ping]",
    history: "history — print commands entered during this browser session\nUsage: history [-c] [-n COUNT]\nUse -c to clear history or -n to limit the number of entries. Press Ctrl+R for reverse search.",
    alias: "alias — create or list command shortcuts\nUsage: alias NAME=COMMAND\nExample: alias gs='grep -in' then use gs token FILE.",
    export: "export — set a session variable\nUsage: export NAME=value\nUse $NAME in later commands. Variables reset when the page reloads.",
    write: "write — create or replace a virtual text file\nUsage: write FILE TEXT...\nYou can also use output redirection: echo hello > FILE.",
    append: "append — add text to the end of a virtual file\nUsage: append FILE TEXT...",
    diff: "diff — compare two virtual text files\nUsage: diff FILE1 FILE2",
    base64: "base64 — encode or decode text\nUsage: base64 FILE or base64 -d FILE\nAlso accepts input from a pipe.",
    calc: "calc — evaluate basic arithmetic\nUsage: calc 2 + 3 * (4 - 1)\nSupports +, -, *, /, %, ^ and parentheses.",
    random: "random — generate a random integer\nUsage: random [MIN] [MAX]\nDefaults to a number between 1 and 100.",
    uuid: "uuid — generate a pseudo-random UUID\nUsage: uuid\nNot intended for security or cryptographic use.",
    json: "json — validate and format JSON\nUsage: json [FILE] or command | json; use -c for compact output.",
    rot13: "rot13 — rotate ASCII letters by 13 places\nUsage: rot13 [FILE] or command | rot13.",
    replace: "replace — replace literal text in a virtual file\nUsage: replace FILE OLD_TEXT NEW_TEXT.",
    timer: "timer — operate a session stopwatch\nUsage: timer start|stop|status|reset|lap|laps.",
    download: "download — save one virtual file to your device\nUsage: download FILE.",
    mobile: "mobile — temporarily switch the terminal to a phone-friendly layout\nUsage: mobile [on|off|status]. The setting lasts only until this page is refreshed.",
    desktop: "desktop — restore the normal terminal layout\nUsage: desktop. This only changes the current page session.",
    "crash-test": "crash-test — trigger a harmless simulated system crash screen\nUsage: crash-test. Press restart system to replay the boot sequence.",
    help: "help — show the command index\nUsage: help [COMMAND]"
  };

  function dispatch(args, stdin) {
    if (!args.length) return { output: stdin || "", ok: true };
    const cmd = args[0].toLowerCase();
    const a = args.slice(1);
    const argText = a.join(" ");
    const fail = (message) => ({ output: message, ok: false });
    const pass = (text) => ({ output: text == null ? "" : String(text), ok: true });
    const resolveArgs = (list) => list.map((p) => normalizePath(p));

    if (cmd === "crash-test") {
      showCrashScreen();
      return pass("");
    }
    if (cmd === "mobile") {
      const action = (a[0] || "on").toLowerCase();
      if (action === "status") return pass(document.body.classList.contains("mobile-mode") ? "phone-friendly layout is active (temporary)." : "phone-friendly layout is inactive.");
      if (action === "on" || action === "enable") {
        document.body.classList.add("mobile-mode");
        return pass("phone-friendly layout enabled. run 'desktop' or 'mobile off' to restore the normal layout.");
      }
      if (action === "off" || action === "disable") {
        document.body.classList.remove("mobile-mode");
        return pass("phone-friendly layout disabled. normal layout restored.");
      }
      return fail("mobile: use mobile [on|off|status]");
    }
    if (cmd === "desktop") {
      document.body.classList.remove("mobile-mode");
      return pass("normal terminal layout restored.");
    }
    if (cmd === "help" || cmd === "?") {
      if (a[0] === "token") return pass(manuals.token);
      if (a[0] && manuals[a[0]]) return pass(manuals[a[0]]);
      return pass(helpText);
    }
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
    if (cmd === "history") {
      if (a.includes("-c")) {
        history = [];
        historyIndex = 0;
        persist();
        return pass("history cleared. fresh start.");
      }
      const nIndex = a.indexOf("-n");
      const limit = nIndex >= 0 ? Math.max(1, Math.min(100, Number(a[nIndex + 1]) || 10)) : 100;
      return pass(history.slice(-limit).map((line, i, all) => String(history.length - all.length + i + 1).padStart(4, " ") + "  " + line).join("\n"));
    }
    if (cmd === "export") {
      if (!a.length) return pass(Object.keys(shellVars).sort().map((key) => key + "=" + shellVars[key]).join("\n"));
      const assignment = a.join(" ");
      const match = assignment.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) { shellVars[match[1]] = match[2]; return pass(""); }
      return pass(shellVars[a[0]] == null ? "" : a[0] + "=" + shellVars[a[0]]);
    }
    if (cmd === "unset") {
      a.forEach((key) => { delete shellVars[key]; });
      return pass("");
    }
    if (cmd === "env" || cmd === "printenv") {
      const vars = Object.assign({}, shellVars, { TOKEN_MOOD: tokenMood, PWD: cwd });
      if (a.length) return pass(a.map((key) => vars[key] == null ? "" : vars[key]).join("\n"));
      return pass(Object.keys(vars).sort().map((key) => key + "=" + vars[key]).join("\n"));
    }
    if (cmd === "which" || cmd === "whereis" || cmd === "type") {
      const commands = ["ls","cd","pwd","cat","echo","printf","grep","head","tail","tac","nl","fold","wc","sort","uniq","paste","cut","tr","rev","diff","base64","hash","calc","random","uuid","json","rot13","replace","timer","download","mkdir","touch","write","append","rm","cp","mv","find","tree","token","femtanyl","help","man","clear","uname","date","whoami","neofetch","fortune","cowsay","history","alias","unalias","export","unset","seq","reboot"];
      return pass(a.map((name) => commands.includes(name) ? name + ": shell builtin (/usr/bin/" + name + ")" : name + " not found").join("\n"));
    }
    if (cmd === "man") {
      if (!a[0]) return fail("What manual page do you want? Try: man token");
      return pass(manuals[a[0]] || ("No manual entry for " + a[0] + ". Try 'help'."));
    }
    if (cmd === "neofetch") {
      return pass([
        "token@tken27",
        "----------------",
        "OS: TKEN27 Token Shell",
        "Kernel: 27.11-token",
        "Host: browser",
        "Shell: /bin/tknsh",
        "Files: " + Object.keys(files).length + " virtual files",
        "Mood: " + tokenMood,
        "Uptime: " + Math.floor((Date.now() - sessionStart) / 1000) + " seconds"
      ].join("\n"));
    }
    if (cmd === "ps" || cmd === "top") return pass(" PID TTY          TIME CMD\n  1 pts/0    00:00:00 tkn-init\n 27 pts/0    00:00:00 token.service\n 42 pts/0    00:00:0" + commandCount + " tknsh\n 73 pts/0    00:00:00 " + cmd);
    if (cmd === "free") return pass("               total        used        free\nMem:           4096M        271M       3825M\nSwap:          1024M          0M       1024M\n\nvirtual values; your real memory is not queried.");
    if (cmd === "df") return pass("Filesystem      Size  Used Avail Use% Mounted on\n/dev/token       27G  2.7G   24G  11% /");
    if (cmd === "ping") return pass("PING " + (a[0] || "tken27") + ": simulated local response\n64 bytes from tken27: seq=1 ttl=64 time=0.27 ms\n64 bytes from tken27: seq=2 ttl=64 time=0.27 ms\n--- simulation complete; no network packets were sent ---");
    if (cmd === "ifconfig" || cmd === "ip") return pass("lo: flags=73<UP,LOOPBACK,RUNNING>\n    inet 127.0.0.1  netmask 255.0.0.0\n    inet6 ::1  prefixlen 128\neth0: flags=4099<UP,BROADCAST,MULTICAST>\n    state: imaginary-but-up");
    if (cmd === "fortune") {
      const sayings = [
        "i'm not saying i caused the last crash. i'm saying it was interesting.",
        "back up your files. i'm not doing it for u.",
        "the machine is haunted. i like it that way.",
        "stay weird. check your permissions. in that order.",
        "i read the manual. it was boring, so i improved it."
      ];
      return pass(sayings[Math.floor(Math.random() * sayings.length)]);
    }
    if (cmd === "cowsay") {
      const msg = argText || stdin || "say something interesting";
      return pass("“" + msg.slice(0, 56) + "”");
    }
    if (cmd === "token") {
      const sub = (a[0] || "hello").toLowerCase();
      const extra = a.slice(1).join(" ");
      const random = (items) => items[Math.floor(Math.random() * items.length)];
      const replies = {
        hello: ["oh. hi.", "hiii. u called?", "hey. what's up?", "yo. i'm here. unfortunately for everyone."],
        ask: ["idk. have u tried turning it off and on again?", "that's a lot of words. i'm choosing to ignore half of them.", "probably. don't quote me on that.", "ask me something easier. like where the snacks are."],
        joke: ["what's my favorite command? kill -9. just kidding. maybe.", "i tried to write a book about the filesystem. it had too many directories.", "why did the process leave? it couldn't handle my signals."],
        quote: ["\"no thoughts. only terminal.\"", "\"i'm not a bug. i'm an undocumented feature.\"", "\"u opened the terminal. bold move.\"", "\"brb. becoming a warning message.\"", "\"i read the manual. didn't like the attitude.\""]
      };
      if (sub === "help") return pass("oh, u want my commands? okay.\n  token hello       say hi\n  token info        who i am\n  token look        what i look like\n  token lore        lore (some of it is unconfirmed)\n  token diary       read my hidden note\n  token mood        how i'm doing\n  token stats       session stats\n  token songs       the femtanyl track list\n  token quote       one of my thoughts\n  token ask         ask me something (sort of)\n  token joke        i'll try to be funny\n  token say TEXT    make me type something\n  token pet/feed    attempt diplomacy\n  token hug/boop    be nice to me\n  token bite/poke   consequences\n  token highfive    slap hands\n  token choose A B  let me pick one\n  token roll        roll a die\n  token flip        flip a coin\n  token dance       movement. allegedly\n  token scream      noise.");
      if (sub === "hello" || sub === "hi" || sub === "hey") return pass(random(replies.hello));
      if (sub === "info") return pass("i'm token. u've probably seen me around femtanyl's artwork.\ni'm the recurring little menace. my design shifts around between artworks.\nno, i don't have a neat little user manual. this is the manual.");
      if (sub === "look") return pass("yeah, that's me. mostly white, cat-like, big pointed ears, dark eyes in a lot of illustrations.\nlittle fangs too. useful for reasons i will not explain.\nartists change up my look. i contain multitudes or whatever.");
      if (sub === "lore") return pass("u want my lore? it's not all neatly documented.\nthe creator has described me as a vessel for the music.\nthe fandom wiki mentions extra details like immortality and genderlessness,\nbut don't treat every fan-documented detail as creator-confirmed canon. even i have gaps in my wiki.");
      if (sub === "diary" || sub === "secret") return pass("...fine. u found it. don't make a big deal out of it.\n\n" + (readFile("~/.token-diary.txt") || "i seem to have misplaced my diary. rude."));
      if (sub === "mood") return pass("i'm feeling " + tokenMood + ". could be worse. probably.");
      if (sub === "stats") return pass("MY SESSION STATS\ncommands i've processed: " + commandCount + "\nseconds i've been stuck here: " + Math.floor((Date.now() - sessionStart) / 1000) + "\ncurrent mood: " + tokenMood + "\npermanent damage: not telling u.");
      if (sub === "songs") return pass("oh, u want the music? here. don't lose the list.\n\n" + files["/usr/share/femtanyl/tracks.txt"]);
      if (sub === "quote") return pass(random(replies.quote));
      if (sub === "ask") return pass(random(replies.ask));
      if (sub === "joke") return pass(random(replies.joke));
      if (sub === "say") return pass(extra ? extra : "u have to give me something to say, genius.");
      if (sub === "pet") { tokenMood = "mildly appeased"; return pass("...okay. that was kinda nice. don't get used to it."); }
      if (sub === "feed") { tokenMood = "snack-focused"; return pass("oh? snacks? u DO know how to treat me.\n*snack acquired* inventory: 1 (imaginary, obviously)."); }
      if (sub === "hug") { tokenMood = "soft"; return pass("...oh.\nokay. hug accepted. don't tell anyone i liked that."); }
      if (sub === "boop") { tokenMood = "confused"; return pass("boop?\n...did u just boop me. unbelievable."); }
      if (sub === "highfive") { tokenMood = "energized"; return pass("YEAH. NICE ONE.\nhand status: mildly damaged. worth it."); }
      if (sub === "bite") { tokenMood = "feral"; return pass("I WARNED U.\n*chomp*\nHP: -1. dignity: -5. skill issue."); }
      if (sub === "poke") { tokenMood = "annoyed"; return pass("stop poking me.\ni am literally right here. use ur words."); }
      if (sub === "dance") { tokenMood = "overclocked"; return pass("LOOK AT ME GO.\ncoordination: questionable. style: 100%."); }
      if (sub === "scream") { tokenMood = "loud"; return pass("AAAAAAAAAAAAAAAAAAAAAA\nthere. happy now?"); }
      if (sub === "roll") return pass("u rolled a " + (1 + Math.floor(Math.random() * 6)) + ".");
      if (sub === "flip") return pass(Math.random() < 0.5 ? "heads. obviously." : "tails. skill issue.");
      if (sub === "choose") {
        const choices = extra.split(/[\s,]+/).filter(Boolean);
        return choices.length ? pass("i choose: " + random(choices) + ". don't argue with me.") : pass("give me at least two choices first.");
      }
      if (sub === "ping") return pass("pong. i'm faster than u. probably.");
      if (sub === "creator") return pass("i'm associated with femtanyl. for creator details, check the official links and don't trust random terminal mascots for citations.");
      return fail("uhh. i don't know what '" + sub + "' means. try 'token help'.");
    }
    if (cmd === "femtanyl") return pass("oh, u want the track list? got u.\n\n" + files["/usr/share/femtanyl/tracks.txt"] + "\n\nthere. enjoy the noise.");
    if (cmd === "about") return pass("TKEN27 is a Token-themed browser terminal.\nIt has a small virtual filesystem, command history, text tools, pipes and redirects.\nIt does not run Linux, execute programs, or access your device files.");
    if (cmd === "version") return pass("tknsh 27.11.0 (browser build)");
    if (cmd === "reboot" || cmd === "reboot-now") {
      print("restarting simulated shell...", "muted");
      window.setTimeout(() => { sessionStart = Date.now(); bootScreen.style.display = "grid"; boot(); }, 450);
      return pass("");
    }
    if (cmd === "exit" || cmd === "logout") return pass("session still running. close the tab whenever. i'll be here. probably.");
    if (cmd === "poweroff" || cmd === "shutdown") return pass("poweroff: this is only a browser simulation. your device stays on.");
    if (cmd === "sudo" || cmd === "su") return fail("nice try. admin privileges are not part of this simulation.");
    if (cmd === "apt" || cmd === "apt-get" || cmd === "dnf" || cmd === "pacman") return fail("package manager unavailable: this userspace is read-only outside its virtual home.");
    if (cmd === "curl" || cmd === "wget" || cmd === "ssh" || cmd === "scp") return fail(cmd + ": network access is disabled in this terminal simulation.");
    if (cmd === "kill") return fail("kill: permission denied. token.service is protected.");
    if (cmd === "yes") return pass((argText || "y") + "\n" + (argText || "y") + "\n" + (argText || "y") + "\n... output capped to avoid flooding the terminal.");
    if (cmd === "seq") {
      let start = 1, end = Number(a[0]), step = 1;
      if (a.length > 1) { start = Number(a[0]); end = Number(a[1]); }
      if (a.length > 2) step = Number(a[2]);
      if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step === 0 || Math.abs(end - start) > 500) return fail("seq: provide a valid range smaller than 500");
      const values = [];
      for (let n = start, guard = 0; (step > 0 ? n <= end : n >= end) && guard < 501; n += step, guard += 1) values.push(n);
      return pass(values.join("\n"));
    }
    if (cmd === "calc") {
      const expression = a.join("").replace(/\s+/g, "");
      if (!expression) return fail("calc: usage: calc 2 + 3 * 4");
      const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/%^]/g) || [];
      if (tokens.join("") !== expression) return fail("calc: only numbers, parentheses and + - * / % ^ are supported");
      const output = [], operators = [];
      const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3, "u+": 2.5, "u-": 2.5 };
      let expectsValue = true;
      for (const token of tokens) {
        if (/^\d/.test(token)) { output.push(Number(token)); expectsValue = false; continue; }
        if (token === "(") { operators.push(token); expectsValue = true; continue; }
        if (token === ")") {
          while (operators.length && operators[operators.length - 1] !== "(") output.push(operators.pop());
          if (!operators.length) return fail("calc: mismatched parentheses");
          operators.pop(); expectsValue = false; continue;
        }
        const op = expectsValue && (token === "+" || token === "-") ? "u" + token : token;
        if (expectsValue && op === token && token !== "+" && token !== "-") return fail("calc: unexpected operator " + token);
        while (operators.length && operators[operators.length - 1] !== "(") {
          const top = operators[operators.length - 1];
          const rightAssociative = op === "^" || op === "u+" || op === "u-";
          const deferExponentForUnary = (op === "u+" || op === "u-") && top === "^";
          if (!deferExponentForUnary && (precedence[top] > precedence[op] || (!rightAssociative && precedence[top] === precedence[op]))) output.push(operators.pop());
          else break;
        }
        operators.push(op); expectsValue = true;
      }
      if (expectsValue) return fail("calc: expression ends with an operator");
      while (operators.length) {
        const op = operators.pop();
        if (op === "(") return fail("calc: mismatched parentheses");
        output.push(op);
      }
      const stack = [];
      for (const token of output) {
        if (typeof token === "number") { stack.push(token); continue; }
        if (token === "u+" || token === "u-") {
          if (!stack.length) return fail("calc: invalid expression");
          const n = stack.pop(); stack.push(token === "u-" ? -n : n); continue;
        }
        if (stack.length < 2) return fail("calc: invalid expression");
        const right = stack.pop(), left = stack.pop();
        let value;
        if (token === "+") value = left + right;
        else if (token === "-") value = left - right;
        else if (token === "*") value = left * right;
        else if (token === "/") value = left / right;
        else if (token === "%") value = left % right;
        else value = Math.pow(left, right);
        if (!Number.isFinite(value)) return fail("calc: result is not a finite number");
        stack.push(value);
      }
      return stack.length === 1 ? pass(String(stack[0])) : fail("calc: invalid expression");
    }
    if (cmd === "random") {
      const min = a.length > 0 ? Number(a[0]) : 1;
      const max = a.length > 1 ? Number(a[1]) : 100;
      if (!Number.isFinite(min) || !Number.isFinite(max) || max < min || max - min > 1000000) return fail("random: usage: random [MIN] [MAX]");
      return pass(String(Math.floor(Math.random() * (max - min + 1)) + min));
    }
    if (cmd === "uuid") {
      const value = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
        const r = Math.floor(Math.random() * 16);
        return (ch === "x" ? r : (r & 3) | 8).toString(16);
      });
      return pass(value);
    }

    if (cmd === "cd") {
      const target = normalizePath(a[0] || "/home/token");
      if (!isDir(target)) return fail("cd: " + (a[0] || "~") + ": no such directory");
      window.__tkenPreviousDir = cwd;
      shellVars.OLDPWD = cwd;
      cwd = target;
      shellVars.PWD = cwd;
      setPrompt();
      return pass(a[0] === "-" ? cwd : "");
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
        if (isFile(path)) { errors.push("mkdir: cannot create '" + name + "': a file already exists"); return; }
        if (isDir(path)) {
          if (!recursive) errors.push("mkdir: cannot create directory '" + name + "': file exists");
          return;
        }
        if (recursive) {
          let walk = "";
          let blocked = false;
          path.split("/").filter(Boolean).forEach((part) => {
            if (blocked) return;
            walk += "/" + part;
            if (isFile(walk)) {
              errors.push("mkdir: cannot create '" + name + "': '" + walk + "' is a file");
              blocked = true;
            } else dirs.add(walk);
          });
        } else if (isDir(parentPath(path))) dirs.add(path);
        else errors.push("mkdir: cannot create directory '" + name + "': parent does not exist");
      });
      persist();
      return errors.length ? fail(errors.join("\n")) : pass("");
    }
    if (cmd === "rmdir") {
      const names = a.filter((item) => !item.startsWith("-"));
      if (!names.length) return fail("rmdir: missing operand");
      const errors = [];
      names.forEach((name) => {
        const path = normalizePath(name);
        if (!isDir(path)) errors.push("rmdir: '" + name + "': not a directory");
        else if (["/","/home","/home/token","/etc"].includes(path)) errors.push("rmdir: refusing to remove protected system path");
        else if (childrenOf(path).length) errors.push("rmdir: '" + name + "': directory not empty");
        else dirs.delete(path);
      });
      persist();
      return errors.length ? fail(errors.join("\n")) : pass("");
    }
    if (cmd === "rm") {
      const recursive = a.some((item) => ["-r","-R","-rf","-fr","-rF","-Rf","-fR","-Fr"].includes(item));
      const force = a.some((item) => item === "-f" || item === "-rf" || item === "-fr");
      const names = a.filter((item) => !item.startsWith("-"));
      if (!names.length) return fail("rm: missing operand");
      const errors = names.map((name) => deletePath(normalizePath(name), recursive)).filter(Boolean);
      const visibleErrors = force ? errors.filter((error) => !error.includes("no such file or directory")) : errors;
      return visibleErrors.length ? fail(visibleErrors.join("\n")) : pass("");
    }
    if (cmd === "cp" || cmd === "mv") {
      if (a.length < 2) return fail(cmd + ": missing file operand");
      const src = normalizePath(a[0]);
      const dest = normalizePath(a[1]);
      if (!isFile(src)) return fail(cmd + ": cannot stat '" + a[0] + "': no such file");
      const finalDest = isDir(dest) ? normalizePath(dest + "/" + baseName(src)) : dest;
      if (finalDest === src) return pass("");
      if (isDir(finalDest)) return fail(cmd + ": destination is a directory");
      if (!isDir(parentPath(finalDest))) return fail(cmd + ": destination directory does not exist");
      files[finalDest] = files[src];
      if (cmd === "mv") delete files[src];
      persist();
      return pass("");
    }
    if (cmd === "tree") {
      const showAll = a.includes("-a");
      const root = normalizePath(a.find((item) => !item.startsWith("-")) || cwd);
      if (!isDir(root)) return fail("tree: " + root + ": no such directory");
      const lines = [root];
      function walk(path, prefix, depth) {
        if (depth > 8) return;
        const children = childrenOf(path).filter(([name]) => showAll || !name.startsWith("."));
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
      if (nIndex >= 0) {
        const requested = Number(a[nIndex + 1]);
        if (!Number.isInteger(requested) || requested < 0) return fail(cmd + ": -n expects a non-negative integer");
        count = Math.min(500, requested);
      }
      const name = a.filter((x, i) => x !== "-n" && (nIndex < 0 || i !== nIndex + 1))[0];
      const content = name ? readFile(name) : stdin;
      if (content === undefined || content === null) return fail(cmd + ": missing file or input");
      const lines = String(content).split("\n");
      return pass(count === 0 ? "" : (cmd === "head" ? lines.slice(0, count) : lines.slice(-count)).join("\n"));
    }
    if (cmd === "wc") {
      const names = a.filter((x) => !x.startsWith("-"));
      if (names.some((name) => readFile(name) == null)) return fail("wc: one or more files could not be read");
      const content = names.length ? names.map((name) => readFile(name)).join("\n") : stdin;
      if (content == null) return fail("wc: missing file or input");
      const lines = (String(content).match(/\n/g) || []).length;
      const words = String(content).trim() ? String(content).trim().split(/\s+/).length : 0;
      const bytes = new TextEncoder().encode(String(content)).length;
      const flags = a.filter((x) => x.startsWith("-")).join("");
      return pass(((flags.includes("l") ? lines + " " : "") + (flags.includes("w") ? words + " " : "") + (flags.includes("c") ? bytes + " " : (!flags ? lines + " " + words + " " + bytes : "")) + (names[0] || "")).trim());
    }
    if (cmd === "grep") {
      const flags = a.filter((x) => x.startsWith("-")).join("");
      const ignoreCase = flags.includes("i");
      const showNumber = flags.includes("n");
      const invert = flags.includes("v");
      const positional = a.filter((x) => !x.startsWith("-"));
      if (!positional.length) return fail("grep: missing pattern");
      const pattern = positional[0];
      const namedFiles = positional.slice(1);
      const contents = namedFiles.map((name) => readFile(name));
      if (contents.some((content) => content == null)) return fail("grep: one or more files could not be read");
      const source = namedFiles.length ? contents.join("\n") : stdin;
      if (source == null) return fail("grep: missing input (try grep PATTERN FILE)");
      const needle = ignoreCase ? pattern.toLowerCase() : pattern;
      const matches = String(source).split("\n").map((line, i) => ({ line, i }))
        .filter((item) => (ignoreCase ? item.line.toLowerCase() : item.line).includes(needle) !== invert);
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
    if (cmd === "write" || cmd === "append") {
      if (!a[0]) return fail(cmd + ": usage: " + cmd + " FILE TEXT...");
      const path = a[0];
      const content = a.length > 1 ? a.slice(1).join(" ") : (stdin || "");
      if (content === "" && !stdin) return fail(cmd + ": give me some text to write");
      const existing = readFile(path);
      const payload = cmd === "append" && existing != null && existing.length && !existing.endsWith("\n") ? "\n" + content : content;
      const result = writeFile(path, payload, cmd === "append");
      return result.ok ? pass("") : fail(result.error);
    }
    if (cmd === "tac") {
      const content = a[0] ? readFile(a[0]) : stdin;
      if (content == null) return fail("tac: missing file or input");
      return pass(String(content).split("\n").reverse().join("\n"));
    }
    if (cmd === "nl") {
      const name = a.find((x) => !x.startsWith("-"));
      const content = name ? readFile(name) : stdin;
      if (content == null) return fail("nl: missing file or input");
      const width = Math.max(1, Number(a[a.indexOf("-w") + 1]) || 4);
      return pass(String(content).split("\n").map((line, i) => String(i + 1).padStart(width, " ") + "  " + line).join("\n"));
    }
    if (cmd === "fold") {
      const w = a.indexOf("-w");
      const width = Math.max(1, Math.min(240, Number(w >= 0 ? a[w + 1] : 80) || 80));
      const name = a.find((x, i) => !x.startsWith("-") && i !== w + 1);
      const content = name ? readFile(name) : stdin;
      if (content == null) return fail("fold: missing file or input");
      return pass(String(content).split("\n").map((line) => line.match(new RegExp(".{1," + width + "}", "g")) || [""]).join("\n"));
    }
    if (cmd === "paste") {
      const delimIndex = a.indexOf("-d");
      const delim = delimIndex >= 0 ? (a[delimIndex + 1] || "\t") : "\t";
      const names = a.filter((x, i) => !x.startsWith("-") && i !== delimIndex + 1);
      const sources = names.length ? names.map((name) => readFile(name)) : (stdin == null ? [] : [stdin]);
      if (!sources.length || sources.some((source) => source == null)) return fail("paste: missing input or file not found");
      const columns = sources.map((source) => String(source).split("\n"));
      const max = Math.max(...columns.map((col) => col.length));
      const rows = [];
      for (let i = 0; i < max; i += 1) rows.push(columns.map((col) => col[i] || "").join(delim));
      return pass(rows.join("\n"));
    }
    if (cmd === "diff") {
      if (a.length < 2) return fail("diff: usage: diff FILE1 FILE2");
      const left = readFile(a[0]), right = readFile(a[1]);
      if (left == null || right == null) return fail("diff: could not read both files");
      const l = String(left).split("\n"), r = String(right).split("\n");
      const changes = [];
      for (let i = 0; i < Math.max(l.length, r.length); i += 1) {
        if (l[i] !== r[i]) {
          changes.push("@@ line " + (i + 1) + " @@");
          if (l[i] !== undefined) changes.push("- " + l[i]);
          if (r[i] !== undefined) changes.push("+ " + r[i]);
        }
      }
      return pass(changes.length ? changes.join("\n") : "files are identical");
    }
    if (cmd === "base64") {
      const decode = a.includes("-d") || a.includes("--decode");
      const name = a.find((x) => !x.startsWith("-"));
      const content = name ? readFile(name) : stdin;
      if (content == null || (content === "" && !name)) return fail("base64: missing input");
      try {
        if (!decode) {
          const bytes = new TextEncoder().encode(String(content));
          let binary = "";
          for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          return pass(btoa(binary));
        }
        const binary = atob(String(content).trim());
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return pass(new TextDecoder().decode(bytes));
      } catch (_) {
        return fail("base64: invalid input");
      }
    }
    if (cmd === "hash") {
      const name = a[0];
      const content = name ? readFile(name) : stdin;
      if (content == null) return fail("hash: usage: hash FILE (or pipe text)");
      let value = 0x811c9dc5;
      for (const byte of new TextEncoder().encode(String(content))) {
        value ^= byte;
        value = Math.imul(value, 0x01000193) >>> 0;
      }
      return pass(value.toString(16).padStart(8, "0") + "  " + (name || "(stdin)") + "  [FNV-1a 32-bit]");
    }
    if (cmd === "json") {
      const compact = a.includes("-c");
      const name = a.find((item) => !item.startsWith("-"));
      const content = name ? readFile(name) : stdin;
      if (content == null || content === "") return fail("json: provide a JSON file or pipe JSON text");
      try {
        const parsed = JSON.parse(String(content));
        return pass(JSON.stringify(parsed, null, compact ? 0 : 2));
      } catch (error) {
        return fail("json: invalid JSON (" + error.message + ")");
      }
    }
    if (cmd === "rot13") {
      const name = a[0];
      const content = name ? readFile(name) : stdin;
      if (content == null) return fail("rot13: provide a file or piped text");
      return pass(String(content).replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
      }));
    }
    if (cmd === "replace") {
      if (a.length < 3) return fail("replace: usage: replace FILE OLD_TEXT NEW_TEXT");
      const path = normalizePath(a[0]);
      if (!isFile(path)) return fail("replace: cannot read '" + a[0] + "'");
      const oldText = a[1], newText = a.slice(2).join(" ");
      if (!oldText) return fail("replace: OLD_TEXT cannot be empty");
      const parts = files[path].split(oldText);
      const count = parts.length - 1;
      if (!count) return pass("no matches. file left untouched.");
      files[path] = parts.join(newText);
      persist();
      return pass("replaced " + count + " occurrence" + (count === 1 ? "" : "s") + " in " + path);
    }
    if (cmd === "timer") {
      const action = (a[0] || "status").toLowerCase();
      const elapsed = stopwatchElapsed + (stopwatchStartedAt == null ? 0 : Date.now() - stopwatchStartedAt);
      const formatTime = (ms) => {
        const total = Math.max(0, Math.floor(ms / 1000));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        const millis = Math.floor(ms % 1000);
        return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":") + "." + String(millis).padStart(3, "0");
      };
      if (action === "start") {
        if (stopwatchStartedAt != null) return fail("timer: already running");
        stopwatchStartedAt = Date.now();
        return pass("stopwatch started.");
      }
      if (action === "stop") {
        if (stopwatchStartedAt == null) return fail("timer: not running");
        stopwatchElapsed = elapsed;
        stopwatchStartedAt = null;
        return pass("stopped at " + formatTime(stopwatchElapsed));
      }
      if (action === "reset") {
        stopwatchStartedAt = null; stopwatchElapsed = 0; stopwatchLaps.length = 0;
        return pass("stopwatch reset.");
      }
      if (action === "lap") {
        if (stopwatchStartedAt == null) return fail("timer: start it first");
        stopwatchLaps.push(elapsed);
        return pass("lap " + stopwatchLaps.length + ": " + formatTime(elapsed));
      }
      if (action === "laps") return pass(stopwatchLaps.length ? stopwatchLaps.map((lap, i) => "lap " + (i + 1) + "  " + formatTime(lap)).join("\n") : "no laps yet.");
      if (action === "status") return pass((stopwatchStartedAt == null ? "stopped at " : "running: ") + formatTime(elapsed));
      return fail("timer: use start, stop, reset, status, lap or laps");
    }
    if (cmd === "download") {
      const path = normalizePath(a[0] || "");
      if (!isFile(path)) return fail("download: file not found");
      if (typeof Blob === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) return fail("download: this browser does not support file downloads");
      const blobUrl = URL.createObjectURL(new Blob([files[path]], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = baseName(path);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return pass("download started: " + baseName(path));
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
      if (!exists(root)) return fail("du: cannot access '" + (a[0] || root) + "': no such file or directory");
      let size = 0;
      if (isFile(root)) size = files[root].length;
      else Object.keys(files).forEach((path) => { if (path.startsWith(root === "/" ? "/" : root + "/")) size += files[path].length; });
      return pass(Math.ceil(size / 1024) + "K\t" + root);
    }
    if (cmd === "chmod" || cmd === "chown") return fail(cmd + ": permissions are decorative in this simulation.");
    if (cmd === "alias") {
      if (!a.length) return pass(Object.keys(aliases).sort().map((name) => name + "='" + aliases[name] + "'").join("\n"));
      const definition = a.join(" ");
      const match = definition.match(/^([A-Za-z_][A-Za-z0-9_-]*)=(.*)$/);
      if (!match) return fail("alias: usage: alias NAME=COMMAND");
      aliases[match[1]] = match[2];
      return pass("");
    }
    if (cmd === "unalias") {
      a.forEach((name) => { if (Object.prototype.hasOwnProperty.call(aliases, name)) delete aliases[name]; });
      return pass("");
    }

    return fail(cmd + ": command not found. Type 'help' to see available commands.");
  }

  function expandVariables(parts) {
    return parts.map((part) => part
      .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, braced, plain) => {
        const name = braced || plain;
        return shellVars[name] == null ? "" : shellVars[name];
      })
      .replace(/\uE000/g, "$"));
  }

  function expandShellTokens(tokens) {
    let expanded = tokens.slice();
    let depth = 0;
    while (expanded.length && Object.prototype.hasOwnProperty.call(aliases, expanded[0]) && depth < 8) {
      const replacement = tokenize(aliases[expanded[0]]);
      expanded = replacement.concat(expanded.slice(1));
      depth += 1;
    }
    return expandVariables(expanded);
  }

  function executePipeline(stages) {
    let stdin = "";
    let redirect = null;
    let append = false;
    const cleanStages = stages.map((stage) => stage.slice());
    const last = cleanStages[cleanStages.length - 1];
    const redirectIndex = last.findIndex((token) => token === ">" || token === ">>");
    if (redirectIndex >= 0) {
      redirect = expandVariables([last[redirectIndex + 1] || ""])[0];
      append = last[redirectIndex] === ">>";
      last.splice(redirectIndex, 2);
      if (!redirect) return { output: "syntax error: expected file after redirection", ok: false };
    }
    let result = { output: "", ok: true };
    for (const stage of cleanStages) {
      const args = expandShellTokens(stage.filter(Boolean));
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

  function availableCompletions(partial, raw) {
    const text = raw || "";
    const words = text.trim().split(/\s+/);
    const command = words[0] || "";
    const trailingSpace = /\s$/.test(text);

    if (command === "token" && (words.length === 2 || trailingSpace)) {
      return ["hello","hi","help","info","look","lore","diary","secret","mood","stats","songs","quote","ask","joke","say","pet","feed","hug","boop","highfive","bite","poke","dance","scream","roll","flip","choose","ping","creator"].filter((name) => name.startsWith(partial));
    }
    if (command === "timer" && (words.length === 2 || trailingSpace)) {
      return ["start","stop","status","reset","lap","laps"].filter((name) => name.startsWith(partial));
    }
    if (command === "mobile" && (words.length === 2 || trailingSpace)) {
      return ["on","off","status"].filter((name) => name.startsWith(partial));
    }
    if (command === "pack" && (words.length === 2 || trailingSpace)) {
      return ["install","status","uninstall","help"].filter((name) => name.startsWith(partial));
    }
    if (command === "visualizer" && (words.length === 2 || trailingSpace)) {
      return ["wave","noise","diagnostics"].filter((name) => name.startsWith(partial));
    }
    if (command === "decrypt" && (words.length === 2 || trailingSpace)) {
      return ["hint","solve","archive","status","reset"].filter((name) => name.startsWith(partial));
    }
    if (command === "watch" && (words.length === 2 || trailingSpace)) {
      return ["system","date","uptime"].filter((name) => name.startsWith(partial));
    }
    if (["man","help"].includes(command) && (words.length === 2 || trailingSpace)) {
      return Object.keys(manuals).filter((name) => name.startsWith(partial));
    }

    const commandNames = ["help","clear","ls","cd","pwd","cat","less","more","echo","printf","touch","write","append","mkdir","rm","rmdir","cp","mv","tree","find","locate","patch","head","tail","tac","nl","fold","grep","wc","sort","uniq","paste","cut","tr","rev","diff","base64","hash","calc","random","uuid","json","rot13","replace","timer","download","mobile","desktop","crash-test","history","alias","unalias","export","unset","man","which","type","whoami","id","hostname","uname","date","cal","uptime","ps","top","free","df","du","env","printenv","neofetch","fortune","cowsay","token","femtanyl","about","version","reboot","exit","ping","ifconfig","seq","pack","visualizer","decrypt","chmod","chown","perm","watch","jobs","kill"];
    if (words.length <= 1 && !trailingSpace) return commandNames.filter((name) => name.startsWith(partial));

    const pathCommands = ["cd","ls","cat","less","more","type","touch","write","append","rm","rmdir","cp","mv","tree","find","locate","patch","chmod","chown","perm","head","tail","nl","fold","uniq","rev","cut","file","stat","du","replace","download","base64","hash","json","rot13"];
    const pathPart = partial.includes("/") || partial.startsWith("~");
    const wantsPath = pathCommands.includes(command) && (words.length >= 2 || trailingSpace);
    if (pathPart || wantsPath) {
      const slash = partial.lastIndexOf("/");
      const dirText = slash >= 0 ? partial.slice(0, slash + 1) : "";
      const nameText = slash >= 0 ? partial.slice(slash + 1) : partial;
      const dir = normalizePath(dirText || ".");
      if (!isDir(dir)) return [];
      return childrenOf(dir)
        .filter(([name]) => name.startsWith(nameText) && (!name.startsWith(".") || nameText.startsWith(".")))
        .map(([name, kind]) => dirText + name + (kind === "dir" ? "/" : ""));
    }
    return commandNames.filter((name) => name.startsWith(partial));
  }

  commandForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    if (!line) return;
    commandEcho(line);
    history.push(line);
    history = history.slice(-100);
    historyIndex = history.length;
    historySearchActive = false;
    historySearchQuery = "";
    historySearchIndex = -1;
    commandCount += 1;
    persist();
    input.value = "";
    tabMatches = [];
    executeLine(line);
    setPrompt();
    screen.scrollTop = screen.scrollHeight;
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "r" && event.ctrlKey) {
      event.preventDefault();
      if (!historySearchActive) {
        historySearchQuery = input.value;
        historySearchIndex = history.length;
        historySearchActive = true;
      }
      let match = historySearchIndex - 1;
      while (match >= 0 && !history[match].toLowerCase().includes(historySearchQuery.toLowerCase())) match -= 1;
      if (match >= 0) {
        historySearchIndex = match;
        input.value = history[match];
      } else print("reverse search: no earlier match", "muted");
    } else if (event.key === "ArrowUp") {
      historySearchActive = false;
      event.preventDefault();
      if (history.length) { historyIndex = Math.max(0, historyIndex - 1); input.value = history[historyIndex] || ""; }
    } else if (event.key === "ArrowDown") {
      historySearchActive = false;
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      const raw = input.value;
      const partial = raw.split(/\s+/).pop() || "";
      if (!tabMatches.length) { tabMatches = availableCompletions(partial, raw); tabIndex = -1; }
      if (tabMatches.length === 1) {
        input.value = raw.slice(0, raw.length - partial.length) + tabMatches[0] + (isDir(normalizePath(tabMatches[0])) ? "" : " ");
        tabMatches = [];
      } else if (tabMatches.length > 1) {
        const prefix = tabMatches.reduce((p, item) => {
          let i = 0; while (i < p.length && i < item.length && p[i] === item[i]) i += 1;
          return p.slice(0, i);
        });
        if (prefix.length > partial.length && tabIndex < 0) {
          input.value = raw.slice(0, raw.length - partial.length) + prefix;
        } else {
          tabIndex = (tabIndex + 1) % tabMatches.length;
          input.value = raw.slice(0, raw.length - partial.length) + tabMatches[tabIndex];
        }
      }
    } else if (event.key === "Escape") {
      input.value = "";
      tabMatches = [];
      historySearchActive = false;
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      clearScreen();
    } else if (event.key === "c" && event.ctrlKey) {
      event.preventDefault();
      print("^C", "muted");
      input.value = "";
    } else {
      tabMatches = [];
      historySearchActive = false;
    }
  });

  terminalShell.addEventListener("click", () => input.focus());
  $("skipBoot").addEventListener("click", () => { window.clearInterval(bootTimer); bootIndex = bootLines.length; bootProgress.style.width = "100%"; showTerminal(); });
  function updateClock() { clock.textContent = new Date().toLocaleTimeString([], { hour12: false }); }
  window.TKEN27Shell = {
    dispatch: dispatch,
    recordCommand: function (line) {
      history.push(String(line));
      history = history.slice(-100);
      historyIndex = history.length;
      historySearchActive = false;
      commandCount += 1;
      persist();
    }
  };
  window.setInterval(updateClock, 1000);
  boot();
})();