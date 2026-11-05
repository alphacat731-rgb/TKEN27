(() => {
  "use strict";

  const STORAGE_KEY = "tken27.expansion-pack.v1";
  const form = document.getElementById("commandForm");
  const input = document.getElementById("commandInput");
  const output = document.getElementById("terminalOutput");
  const screen = document.getElementById("terminalScreen");
  const prompt = document.getElementById("promptLabel");

  const modal = document.getElementById("packModal");
  const title = document.getElementById("packTitle");
  const intro = document.getElementById("packIntro");
  const progressWrap = document.getElementById("packProgressWrap");
  const progressBar = document.getElementById("packProgressBar");
  const progressText = document.getElementById("packProgressText");
  const status = document.getElementById("packStatus");
  const log = document.getElementById("packLog");
  const actions = document.getElementById("packActions");
  const startButton = document.getElementById("packStart");
  const cancelButton = document.getElementById("packCancel");
  const closeButton = document.getElementById("packClose");

  const defaults = { installed: false, decrypted: false, permissions: Object.create(null) };
  let state = loadState();
  let installTimer = null;
  let installStartedAt = 0;
  let installDuration = 0;
  let activeJobs = new Map();
  let nextJobId = 1;
  let visualizerTimer = null;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return Object.assign({}, defaults);
      return {
        installed: parsed.installed === true,
        decrypted: parsed.decrypted === true,
        permissions: parsed.permissions && typeof parsed.permissions === "object" ? parsed.permissions : Object.create(null)
      };
    } catch (_) {
      return Object.assign({}, defaults);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  function addLine(value, kind) {
    const row = document.createElement("div");
    row.className = "output-line" + (kind ? " " + kind : "");
    row.textContent = String(value == null ? "" : value) || " ";
    output.appendChild(row);
    while (output.childNodes.length > 1600) output.removeChild(output.firstChild);
    screen.scrollTop = screen.scrollHeight;
    return row;
  }

  function echo(command) {
    const row = document.createElement("div");
    row.className = "output-line command-echo";
    const p = document.createElement("span");
    p.className = "echo-prompt";
    p.textContent = (prompt ? prompt.textContent : "token@tken27:~$") + " ";
    const c = document.createElement("span");
    c.textContent = command;
    row.append(p, c);
    output.appendChild(row);
  }

  function parseArgs(line) {
    const found = line.match(/"[^"]*"|'[^']*'|[^\s]+/g) || [];
    return found.map((part) => {
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) return part.slice(1, -1);
      return part;
    });
  }

  function showModal(mode) {
    if (!modal) return;
    modal.hidden = false;
    modal.dataset.mode = mode;
    progressWrap.hidden = true;
    progressBar.style.width = "0%";
    progressText.textContent = "";
    log.textContent = "";
    actions.hidden = false;
    startButton.hidden = false;
    cancelButton.hidden = false;
    closeButton.hidden = true;

    if (mode === "install") {
      title.textContent = "TKEN27 EXPANSION PACK";
      intro.textContent = "Adds the signal visualizer, encrypted Token archives, simulated permissions, file patching, file lookup, command discovery, and background watch jobs. The package is stored in this browser and survives reloads.";
      status.textContent = "READY TO INSTALL";
      startButton.textContent = "install pack";
      cancelButton.textContent = "not now";
    } else {
      title.textContent = "REMOVE EXPANSION PACK?";
      intro.textContent = "This removes the extra commands, unlocked archive state, and simulated permission metadata from this browser. Your normal terminal files and command history stay untouched.";
      status.textContent = "CONFIRM REMOVAL";
      startButton.textContent = "uninstall pack";
      cancelButton.textContent = "keep pack";
    }
  }

  function closeModal() {
    if (installTimer) {
      window.clearInterval(installTimer);
      installTimer = null;
    }
    modal.hidden = true;
  }

  function showInstallLog(message) {
    const entry = document.createElement("div");
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  function beginInstall() {
    if (installTimer) return;
    installDuration = 30000 + Math.floor(Math.random() * 90001);
    installStartedAt = Date.now();
    progressWrap.hidden = false;
    actions.hidden = false;
    startButton.hidden = true;
    cancelButton.hidden = false;
    status.textContent = "INSTALLING PACKAGE...";
    progressText.textContent = "randomized install time: " + Math.round(installDuration / 1000) + " seconds";
    showInstallLog("[  OK  ] package manifest verified");
    showInstallLog("[ ..  ] copying local command modules");
    const steps = [
      [0.16, "[  OK  ] signal visualizer registered"],
      [0.34, "[  OK  ] archive decoder initialized"],
      [0.51, "[  OK  ] permission metadata store prepared"],
      [0.69, "[  OK  ] filesystem utilities linked"],
      [0.86, "[  OK  ] job-control interface initialized"],
      [0.97, "[  OK  ] running final integrity check"]
    ];
    let nextStep = 0;
    installTimer = window.setInterval(() => {
      const elapsed = Date.now() - installStartedAt;
      const progress = Math.min(1, elapsed / installDuration);
      progressBar.style.width = (progress * 100).toFixed(1) + "%";
      progressText.textContent = Math.max(0, Math.ceil((installDuration - elapsed) / 1000)) + "s remaining";
      while (nextStep < steps.length && progress >= steps[nextStep][0]) {
        showInstallLog(steps[nextStep][1]);
        nextStep += 1;
      }
      if (progress >= 1) finishInstall();
    }, 100);
  }

  function finishInstall() {
    if (installTimer) window.clearInterval(installTimer);
    installTimer = null;
    state.installed = true;
    if (!saveState()) {
      state.installed = false;
      status.textContent = "INSTALL FAILED";
      progressText.textContent = "Browser storage is unavailable or full.";
      showInstallLog("[FAIL ] could not save installation state");
      startButton.hidden = false;
      startButton.textContent = "retry";
      cancelButton.hidden = true;
      return;
    }
    progressBar.style.width = "100%";
    progressText.textContent = "installation completed";
    status.textContent = "PACK INSTALLED";
    showInstallLog("[  OK  ] TKEN27 expansion pack installed");
    showInstallLog("[  OK  ] installation persists across reloads");
    startButton.hidden = true;
    cancelButton.hidden = true;
    closeButton.hidden = false;
  }

  function uninstallPack() {
    for (const job of activeJobs.values()) window.clearInterval(job.timer);
    activeJobs.clear();
    if (visualizerTimer) window.clearInterval(visualizerTimer);
    visualizerTimer = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      state = Object.assign({}, defaults);
      status.textContent = "PACK UNINSTALLED";
      intro.textContent = "The expansion pack has been removed. Your base terminal and virtual filesystem are unchanged.";
      startButton.hidden = true;
      cancelButton.hidden = true;
      closeButton.hidden = false;
      addLine("TKEN27 expansion pack removed. The base terminal is still yours.", "success");
    } catch (_) {
      status.textContent = "UNINSTALL FAILED";
      intro.textContent = "The browser refused to remove the local package data. Try again after checking site storage permissions.";
    }
  }

  startButton.addEventListener("click", () => {
    if (modal.dataset.mode === "install") beginInstall();
    else uninstallPack();
  });
  cancelButton.addEventListener("click", closeModal);
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden && !installTimer) closeModal();
  });

  function visualizer(args) {
    const mode = (args[0] || "wave").toLowerCase();
    if (!["wave", "noise", "diagnostics"].includes(mode)) {
      return { output: "visualizer: use wave, noise, or diagnostics", ok: false };
    }
    if (mode === "diagnostics") {
      const cpu = (8 + Math.random() * 54).toFixed(1);
      const ram = (220 + Math.random() * 640).toFixed(0);
      const signal = (90 + Math.random() * 9.9).toFixed(1);
      return { output: [
        "TKEN27 SIGNAL DIAGNOSTICS",
        "CPU LOAD       " + cpu + "%",
        "MEMORY         " + ram + " MiB / 4096 MiB",
        "SIGNAL         " + signal + "%",
        "PACKET LOSS    0.0% (simulated)",
        "SOURCE         /dev/token",
        "",
        "All values are fictional terminal telemetry."
      ].join("\n"), ok: true };
    }
    if (visualizerTimer) window.clearInterval(visualizerTimer);
    const width = Math.max(24, Math.min(62, Math.floor(((screen.clientWidth || 560) - 32) / 8)));
    const row = document.createElement("div");
    row.className = "output-line pack-visualizer";
    output.appendChild(row);
    let frame = 0;
    const chars = " .:-=+*#%@";
    const paint = () => {
      const rows = [];
      for (let y = 0; y < 7; y += 1) {
        let line = "";
        for (let x = 0; x < width; x += 1) {
          if (mode === "noise") {
            line += chars[Math.floor(Math.random() * chars.length)];
          } else {
            const center = 3 + Math.sin((x * 0.24) + (frame * 0.28)) * 2.35;
            const distance = Math.abs(y - center);
            line += distance < 0.55 ? "█" : distance < 1.05 ? "▓" : distance < 1.55 ? "▒" : distance < 2.0 ? "░" : " ";
          }
        }
        rows.push(line);
      }
      row.textContent = " /dev/token :: " + mode.toUpperCase() + " \n" + rows.join("\n") + "\n frame " + String(frame).padStart(3, "0") + "  |  CTRL+C is not required; wait for the signal to settle";
      screen.scrollTop = screen.scrollHeight;
      frame += 1;
    };
    paint();
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      const started = Date.now();
      visualizerTimer = window.setInterval(() => {
        paint();
        if (Date.now() - started >= 7000) {
          window.clearInterval(visualizerTimer);
          visualizerTimer = null;
          row.textContent += "\n[visualizer finished]";
        }
      }, 120);
    } else {
      row.textContent += "\n[static frame: reduced-motion preference detected]";
    }
    return { output: "", ok: true };
  }

  function decrypt(args) {
    const action = (args[0] || "show").toLowerCase();
    if (action === "status") {
      return { output: state.decrypted ? "archive unlocked. Token left a second note." : "archive locked. 1 encrypted message waiting.", ok: true };
    }
    if (action === "hint") {
      return { output: "hint: the cipher shifts every letter by 13 places. Try the rot13 command.", ok: true };
    }
    if (action === "solve") {
      const answer = args.slice(1).join(" ").trim().toLowerCase();
      if (answer !== "token keeps a second diary") {
        return { output: "decrypt: key rejected. That is not what the message says.", ok: false };
      }
      state.decrypted = true;
      if (!saveState()) {
        state.decrypted = false;
        return { output: "decrypt: could not save the unlocked archive to browser storage.", ok: false };
      }
      return { output: "KEY ACCEPTED.\n\nTOKEN: ...you actually read it?\n\nFine. There's a second diary. Don't get weird about it.\n\nUse 'decrypt archive' to read the note.", ok: true };
    }
    if (action === "archive") {
      if (!state.decrypted) return { output: "decrypt: archive is locked. Solve the message first.", ok: false };
      return { output: "TOKEN // PRIVATE NOTE 02\n\nThe system remembers.\nSo do I.\n\nI keep copies of things people think they deleted.\nNot the important stuff. Just the funny stuff.\n\n- t", ok: true };
    }
    if (action === "reset") {
      state.decrypted = false;
      if (!saveState()) return { output: "decrypt: could not update browser storage.", ok: false };
      return { output: "archive relocked.", ok: true };
    }
    return { output: [
      "TKEN27 ENCRYPTED ARCHIVE // 01",
      "--------------------------------",
      "gbxra xrrcf n frpbaq qvnel",
      "",
      "decrypt hint     request a clue",
      "decrypt solve    submit the decoded sentence",
      "decrypt archive  read Token's note after unlocking",
      "decrypt status   check archive state"
    ].join("\n"), ok: true };
  }

  function permissionCommand(cmd, args) {
    if (cmd === "perm") {
      const path = args[0];
      if (!path) {
        const entries = Object.keys(state.permissions).sort();
        return { output: entries.length ? entries.map((name) => name + "  " + state.permissions[name].mode + "  " + state.permissions[name].owner).join("\n") : "no custom permission metadata yet.", ok: true };
      }
      const info = state.permissions[path] || { mode: "644", owner: "token:token" };
      return { output: path + "\n  mode: " + info.mode + "\n  owner: " + info.owner + "\n  note: simulated metadata only", ok: true };
    }
    if (cmd === "chmod") {
      if (args.length !== 2 || !/^[0-7]{3,4}$/.test(args[0])) return { output: "chmod: usage: chmod MODE FILE (example: chmod 755 script.sh)", ok: false };
      const path = args[1];
      const current = state.permissions[path] || { mode: "644", owner: "token:token" };
      state.permissions[path] = Object.assign({}, current, { mode: args[0] });
      if (!saveState()) return { output: "chmod: could not save metadata to browser storage.", ok: false };
      return { output: "mode of '" + path + "' set to " + args[0] + " (simulated)", ok: true };
    }
    if (cmd === "chown") {
      if (args.length !== 2 || !/^[A-Za-z0-9_.:-]+$/.test(args[0])) return { output: "chown: usage: chown OWNER:GROUP FILE", ok: false };
      const path = args[1];
      const current = state.permissions[path] || { mode: "644", owner: "token:token" };
      state.permissions[path] = Object.assign({}, current, { owner: args[0] });
      if (!saveState()) return { output: "chown: could not save metadata to browser storage.", ok: false };
      return { output: "owner of '" + path + "' set to " + args[0] + " (simulated)", ok: true };
    }
    return null;
  }

  function watch(args) {
    let interval = 2;
    let command = "system";
    if (args.length && /^\d+(\.\d+)?$/.test(args[0])) {
      interval = Math.max(1, Math.min(10, Number(args[0])));
      command = args[1] || "system";
    } else if (args.length) command = args.join(" ");
    if (!["system", "date", "uptime"].includes(command)) {
      return { output: "watch: supported targets are system, date, and uptime", ok: false };
    }
    const id = nextJobId++;
    const row = addLine("", "muted");
    const render = () => {
      const now = new Date();
      const value = command === "date" ? now.toString()
        : command === "uptime" ? "simulated uptime " + Math.floor((Date.now() - bootTime) / 1000) + " seconds"
        : "TKEN27 SYSTEM  |  CPU " + (10 + Math.random() * 45).toFixed(1) + "%  |  RAM " + (280 + Math.random() * 340).toFixed(0) + " MiB  |  " + now.toLocaleTimeString();
      row.textContent = "[job " + id + "] watch (" + interval + "s): " + value;
    };
    render();
    const timer = window.setInterval(render, interval * 1000);
    activeJobs.set(id, { timer: timer, row: row, command: command });
    return { output: "started background watch job [" + id + "] (use jobs or kill " + id + ")", ok: true };
  }

  const bootTime = Date.now();

  function dispatch(cmd, args) {
    if (cmd === "pack") {
      const action = (args[0] || "status").toLowerCase();
      if (action === "install") {
        if (state.installed) return { output: "expansion pack is already installed.", ok: true };
        showModal("install");
        return { output: "opening TKEN27 expansion installer...", ok: true };
      }
      if (action === "uninstall") {
        if (!state.installed) return { output: "expansion pack is not installed.", ok: true };
        showModal("uninstall");
        return { output: "opening package removal UI...", ok: true };
      }
      if (action === "status") return { output: state.installed ? "TKEN27 expansion pack: INSTALLED\nstorage: browser localStorage\npersistence: enabled across reloads" : "TKEN27 expansion pack: NOT INSTALLED\nrun 'pack install' to open the installer.", ok: true };
      if (action === "help") return { output: "pack install     open the expansion installer\npack status      check installation state\npack uninstall   open the removal confirmation UI", ok: true };
      return { output: "pack: use install, status, uninstall, or help", ok: false };
    }

    if (["visualizer", "decrypt", "chmod", "chown", "perm", "watch", "jobs", "kill"].includes(cmd) && !state.installed) {
      return { output: cmd + ": requires the TKEN27 expansion pack. Run 'pack install' first.", ok: false };
    }

    if (cmd === "visualizer") return visualizer(args);
    if (cmd === "decrypt") return decrypt(args);
    if (cmd === "chmod" || cmd === "chown" || cmd === "perm") return permissionCommand(cmd, args);
    if (cmd === "watch") return watch(args);
    if (cmd === "jobs") {
      if (!activeJobs.size) return { output: "no active background jobs.", ok: true };
      return { output: Array.from(activeJobs.entries()).map(([id, job]) => "[" + id + "] running  watch " + job.command).join("\n"), ok: true };
    }
    if (cmd === "kill") {
      const id = Number(args[0]);
      const job = activeJobs.get(id);
      if (!Number.isInteger(id) || !job) return { output: "kill: no such job. Use 'jobs' to list active jobs.", ok: false };
      window.clearInterval(job.timer);
      job.row.textContent += "  [terminated]";
      activeJobs.delete(id);
      return { output: "terminated job [" + id + "]", ok: true };
    }
    return null;
  }

  const packCommands = new Set(["pack", "visualizer", "decrypt", "chmod", "chown", "perm", "watch", "jobs", "kill"]);
  form.addEventListener("submit", (event) => {
    const line = input.value.trim();
    if (!line) return;
    const args = parseArgs(line);
    const cmd = (args[0] || "").toLowerCase();
    if (!packCommands.has(cmd)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    echo(line);
    input.value = "";
    const result = dispatch(cmd, args.slice(1));
    if (result && result.output) addLine(result.output, result.ok ? "" : "error");
    input.focus();
  }, true);

  window.TKEN27Expansion = {
    dispatch: dispatch,
    isInstalled: () => state.installed
  };

  if (state.installed) {
    document.documentElement.dataset.tken27Pack = "installed";
  }
})();