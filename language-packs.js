(() => {
  "use strict";

  const STORAGE_KEY = "tken27.language-packs.v1";
  const PACKS = {
    es: {
      name: "Español",
      native: "Español",
      description: "Interfaz, ayuda y respuestas de Token en español.",
      ui: {
        title: "TERMINAL DE TOKEN", status: "SESIÓN LOCAL",
        help: "escribe help para ver los comandos", simulated: "ESPACIO DE USUARIO SIMULADO",
        boot: "INICIO DEL SISTEMA TKEN27", skip: "saltar inicio",
        crash: "TKEN27 SE HA DETENIDO", command: "Comando del terminal"
      },
      help: [
        "TKEN27 // ÍNDICE DE COMANDOS",
        "============================",
        "ARCHIVOS Y DIRECTORIOS",
        "  ls / cd / pwd          listar, cambiar o mostrar directorio",
        "  cat / less / more      leer archivos virtuales",
        "  touch / write / append crear y editar archivos",
        "  mkdir / rm / cp / mv   gestionar archivos y carpetas",
        "  tree / find / locate   explorar el sistema de archivos",
        "  stat / file / du       consultar metadatos y tamaños",
        "",
        "HERRAMIENTAS DE TEXTO",
        "  grep / cut / tr        buscar y transformar texto",
        "  sort / uniq / paste    ordenar, quitar duplicados y unir",
        "  head / tail / nl       mostrar líneas seleccionadas",
        "  diff / replace / patch comparar y modificar texto",
        "  json / rot13 / base64  herramientas de formato y codificación",
        "  calc / random / uuid   utilidades",
        "",
        "SISTEMA Y SESIÓN",
        "  help / man             ayuda y manuales",
        "  history / alias        historial y alias",
        "  ps / top / free / df   estadísticas simuladas",
        "  timer / watch / jobs   temporizadores y tareas",
        "  mobile / desktop       adaptar la interfaz",
        "  language               gestionar paquetes de idioma",
        "  pack                   gestionar la expansión",
        "",
        "TOKEN",
        "  token hello / info / lore / diary",
        "  token mood / songs / quote / joke",
        "  token pet / hug / boop / poke",
        "  token say TEXT / choose A B / roll / flip",
        "",
        "Los comandos siguen usando sus nombres originales. El idioma cambia los textos de la interfaz y la ayuda."
      ].join("\n"),
      token: {
        hello: ["oh. hola.", "ey. ¿me llamabas?", "buenas. ¿qué pasa?", "hiii. ya estoy aquí. qué remedio."],
        info: "soy Token. seguramente me has visto en el arte de Femtanyl.\nsoy la pequeña criatura que vive en este terminal. no tengo un manual decente. este es el manual.",
        look: "sí, soy yo. normalmente blanca, con orejas puntiagudas, ojos oscuros y colmillos.\nmi diseño cambia según la ilustración. tengo variedad, supongo.",
        lore: "¿quieres mi lore? no está todo documentado.\nla creadora me ha descrito como un recipiente para la música.\nparte de los detalles que circulan son interpretaciones del fandom, no canon confirmado.",
        mood: "estoy bastante tranquila. de momento.",
        diary: "...vale, has encontrado mi diario.\n\nhe dejado este terminal lleno de notas, y aun así nadie sabe dónde guardo los snacks.\n\n- t",
        stats: "ESTADÍSTICAS DE SESIÓN\nNo voy a enseñarte todos mis números. qué pesado.",
        songs: "oh, ¿quieres la lista de temas? aquí la tienes:",
        quote: ["«sin pensamientos. solo terminal.»", "«no soy un bug. soy una función sin documentar.»", "«abriste el terminal. valiente decisión.»"],
        ask: ["ni idea. ¿has probado a reiniciar?", "son muchas palabras. voy a ignorar la mitad.", "probablemente. no me cites."],
        joke: ["¿mi comando favorito? kill -9. es broma. quizá.", "intenté escribir un libro del sistema de archivos. tenía demasiados directorios."],
        pet: "¿me has acariciado? ...bueno. no ha estado mal.",
        feed: "¿comida? acepto snacks imaginarios.",
        hug: "ugh. vale. abrazo concedido. no te acostumbres.",
        boop: "boop. te he visto venir.",
        bite: "¡EH! te lo has buscado.",
        poke: "deja de pincharme. tengo comandos que ejecutar.",
        highfive: "¡choca esos cinco! *clap*",
        dance: "movimiento detectado. dignidad no encontrada.",
        scream: "AAAAAAAAAAAAAAAA. ya está. ¿contento?",
        creator: "Femtanyl es el proyecto musical asociado a mí. busca sus lanzamientos para escuchar más."
      },
      common: {
        "tken27 token shell [version 27.11]": "TKEN27 Terminal de Token [versión 27.11]",
        "terminal's up. try not to break anything i might be using.": "El terminal está listo. Intenta no romper nada que esté usando.",
        "type 'help' for commands. type 'token' if you want to talk to me.": "Escribe 'help' para ver los comandos. Escribe 'token' si quieres hablar conmigo.",
        "i'm online. don't make it weird.": "Estoy conectada. No hagas que sea raro.",
        "no such file or directory": "no existe el archivo o directorio",
        "no such file": "no existe ese archivo",
        "no such directory": "no existe ese directorio",
        "directory not empty": "el directorio no está vacío",
        "permission denied": "permiso denegado",
        "command not found": "comando no encontrado"
      },
      manuals: {
        language: "language — gestionar paquetes de idioma sin conexión\nUso: language [list|install CODE|use CODE|remove CODE|status]\nPaquetes: es (Español), fr (Français), de (Deutsch), ja (日本語).\nLa selección se guarda en este navegador.",
        token: "token — hablar con la residente del terminal\nUso: token [hello|info|look|lore|diary|mood|songs|quote|ask|joke|pet|hug|boop|bite|poke|dance|scream]"
      }
    },
    fr: {
      name: "Français",
      native: "Français",
      description: "Interface, aide et réponses de Token en français.",
      ui: {
        title: "TERMINAL TOKEN", status: "SESSION LOCALE",
        help: "tapez help pour voir les commandes", simulated: "ESPACE UTILISATEUR SIMULÉ",
        boot: "DÉMARRAGE DU SYSTÈME TKEN27", skip: "passer le démarrage",
        crash: "TKEN27 S'EST ARRÊTÉ", command: "Commande du terminal"
      },
      help: [
        "TKEN27 // INDEX DES COMMANDES",
        "=============================",
        "FICHIERS ET DOSSIERS",
        "  ls / cd / pwd          lister, changer ou afficher un dossier",
        "  cat / less / more      lire des fichiers virtuels",
        "  touch / write / append créer et modifier des fichiers",
        "  mkdir / rm / cp / mv   gérer fichiers et dossiers",
        "  tree / find / locate   explorer le système de fichiers",
        "  stat / file / du       consulter les métadonnées et tailles",
        "",
        "OUTILS TEXTE",
        "  grep / cut / tr        rechercher et transformer du texte",
        "  sort / uniq / paste    trier, dédupliquer et joindre",
        "  head / tail / nl       afficher certaines lignes",
        "  diff / replace / patch comparer et modifier du texte",
        "  json / rot13 / base64  formatage et encodage",
        "  calc / random / uuid   utilitaires",
        "",
        "SYSTÈME ET SESSION",
        "  help / man             aide et manuels",
        "  history / alias        historique et alias",
        "  ps / top / free / df   statistiques simulées",
        "  timer / watch / jobs   minuteurs et tâches",
        "  mobile / desktop       adapter l'interface",
        "  language               gérer les packs de langue",
        "  pack                   gérer l'extension",
        "",
        "TOKEN",
        "  token hello / info / lore / diary",
        "  token mood / songs / quote / joke",
        "  token pet / hug / boop / poke",
        "  token say TEXT / choose A B / roll / flip",
        "",
        "Les commandes gardent leurs noms d'origine. La langue modifie l'interface et l'aide."
      ].join("\n"),
      token: {
        hello: ["oh. salut.", "tu m'appelais ?", "yo. qu'est-ce qu'il y a ?", "me voilà. malheureusement pour tout le monde."],
        info: "je suis Token. tu m'as sûrement déjà vue dans les illustrations de Femtanyl.\nje suis la petite créature qui squatte ce terminal. pas de manuel officiel. celui-ci fera l'affaire.",
        look: "oui, c'est moi. souvent blanche, avec de grandes oreilles pointues, des yeux sombres et de petits crocs.\nmon apparence change selon les illustrations.",
        lore: "tu veux mon lore ? tout n'est pas documenté.\nla créatrice m'a décrite comme un réceptacle pour la musique.\ncertains détails viennent du fandom et ne sont pas forcément confirmés.",
        mood: "plutôt tranquille. pour l'instant.",
        diary: "...bon, tu as trouvé mon journal.\n\nce terminal est rempli de notes. et pourtant personne ne sait où je cache les snacks.\n\n- t",
        stats: "STATISTIQUES DE SESSION\nje ne vais pas te donner tous mes chiffres. quel casse-pieds.",
        songs: "oh, tu veux la liste des morceaux ? la voici :",
        quote: ["« pas de pensées. juste le terminal. »", "« je ne suis pas un bug. je suis une fonctionnalité non documentée. »"],
        ask: ["aucune idée. tu as essayé de redémarrer ?", "beaucoup trop de mots. j'ignore la moitié.", "probablement. ne me cite pas."],
        joke: ["ma commande préférée ? kill -9. je plaisante. peut-être.", "j'ai écrit un livre sur le système de fichiers. trop de répertoires."],
        pet: "tu m'as caressée ? ...bon. c'était pas mal.",
        feed: "à manger ? j'accepte les snacks imaginaires.",
        hug: "ugh. d'accord. câlin accordé. n'en profite pas.",
        boop: "boop. je t'ai vu venir.",
        bite: "HÉ ! tu l'as cherché.",
        poke: "arrête de me piquer. j'ai des commandes à exécuter.",
        highfive: "tape là ! *clap*",
        dance: "mouvement détecté. dignité introuvable.",
        scream: "AAAAAAAAAAAAAAAA. voilà. content ?",
        creator: "Femtanyl est le projet musical auquel je suis associée. cherche ses sorties pour en écouter plus."
      },
      common: {
        "tken27 token shell [version 27.11]": "Terminal Token TKEN27 [version 27.11]",
        "terminal's up. try not to break anything i might be using.": "Le terminal est prêt. Essaie de ne rien casser dont j'aurais besoin.",
        "type 'help' for commands. type 'token' if you want to talk to me.": "Tapez 'help' pour afficher les commandes. Tapez 'token' pour me parler.",
        "i'm online. don't make it weird.": "Je suis en ligne. Ne rends pas ça bizarre.",
        "no such file or directory": "fichier ou dossier introuvable",
        "no such file": "fichier introuvable",
        "no such directory": "dossier introuvable",
        "directory not empty": "le dossier n'est pas vide",
        "permission denied": "permission refusée",
        "command not found": "commande introuvable"
      },
      manuals: {
        language: "language — gérer les packs de langue hors ligne\nUsage : language [list|install CODE|use CODE|remove CODE|status]\nPacks : es (Español), fr (Français), de (Deutsch), ja (日本語).\nLe choix est enregistré dans ce navigateur.",
        token: "token — parler avec la résidente du terminal\nUsage : token [hello|info|look|lore|diary|mood|songs|quote|ask|joke|pet|hug|boop|bite|poke|dance|scream]"
      }
    },
    de: {
      name: "Deutsch",
      native: "Deutsch",
      description: "Oberfläche, Hilfe und Tokens Antworten auf Deutsch.",
      ui: {
        title: "TOKEN-TERMINAL", status: "LOKALE SITZUNG",
        help: "help eingeben, um Befehle anzuzeigen", simulated: "SIMULIERTER BENUTZERBEREICH",
        boot: "TKEN27 SYSTEMSTART", skip: "Start überspringen",
        crash: "TKEN27 WURDE ANGEHALTEN", command: "Terminalbefehl"
      },
      help: [
        "TKEN27 // BEFEHLSÜBERSICHT",
        "==========================",
        "DATEIEN UND VERZEICHNISSE",
        "  ls / cd / pwd          auflisten, wechseln oder anzeigen",
        "  cat / less / more      virtuelle Dateien lesen",
        "  touch / write / append Dateien erstellen und bearbeiten",
        "  mkdir / rm / cp / mv   Dateien und Ordner verwalten",
        "  tree / find / locate   Dateisystem durchsuchen",
        "  stat / file / du       Metadaten und Größen anzeigen",
        "",
        "TEXTWERKZEUGE",
        "  grep / cut / tr        Text suchen und umwandeln",
        "  sort / uniq / paste    sortieren, bereinigen und verbinden",
        "  head / tail / nl       ausgewählte Zeilen anzeigen",
        "  diff / replace / patch Text vergleichen und ändern",
        "  json / rot13 / base64  Formatierung und Kodierung",
        "  calc / random / uuid   Hilfsprogramme",
        "",
        "SYSTEM UND SITZUNG",
        "  help / man             Hilfe und Handbücher",
        "  history / alias        Verlauf und Aliase",
        "  ps / top / free / df   simulierte Statistiken",
        "  timer / watch / jobs   Timer und Aufgaben",
        "  mobile / desktop       Oberfläche anpassen",
        "  language               Sprachpakete verwalten",
        "  pack                   Erweiterung verwalten",
        "",
        "TOKEN",
        "  token hello / info / lore / diary",
        "  token mood / songs / quote / joke",
        "  token pet / hug / boop / poke",
        "  token say TEXT / choose A B / roll / flip",
        "",
        "Befehle behalten ihre ursprünglichen Namen. Die Sprache ändert Oberfläche und Hilfe."
      ].join("\n"),
      token: {
        hello: ["oh. hi.", "hast du mich gerufen?", "yo. was gibt's?", "da bin ich. leider für alle anderen."],
        info: "ich bin Token. du hast mich wahrscheinlich schon in Femtanyls Artwork gesehen.\nich bin die kleine Kreatur, die dieses Terminal übernommen hat. ein richtiges Handbuch gibt's nicht.",
        look: "ja, das bin ich. meistens weiß, mit spitzen Ohren, dunklen Augen und kleinen Fangzähnen.\nmein Aussehen ändert sich je nach Illustration.",
        lore: "du willst meine Geschichte? nicht alles ist dokumentiert.\ndie Schöpferin hat mich als Gefäß für die Musik beschrieben.\neinige Details stammen aus dem Fandom und sind nicht offiziell bestätigt.",
        mood: "ziemlich entspannt. vorerst.",
        diary: "...na gut, du hast mein Tagebuch gefunden.\n\ndieses Terminal ist voller Notizen. trotzdem weiß niemand, wo ich Snacks verstecke.\n\n- t",
        stats: "SITZUNGSSTATISTIK\nmeine ganzen Zahlen bekommst du nicht. wie nervig.",
        songs: "oh, du willst die Trackliste? hier bitte:",
        quote: ["„keine gedanken. nur terminal.“", "„ich bin kein bug. ich bin ein undokumentiertes feature.“"],
        ask: ["keine ahnung. schon neu gestartet?", "zu viele wörter. ich ignoriere die hälfte.", "wahrscheinlich. zitier mich nicht."],
        joke: ["mein Lieblingsbefehl? kill -9. nur ein Witz. vielleicht.", "ich schrieb ein Buch über Dateisysteme. zu viele Verzeichnisse."],
        pet: "du hast mich gestreichelt? ...na gut. war nicht schlecht.",
        feed: "Essen? ich akzeptiere imaginäre Snacks.",
        hug: "ugh. okay. Umarmung genehmigt. gewöhn dich nicht dran.",
        boop: "boop. ich hab dich kommen sehen.",
        bite: "HEY! selbst schuld.",
        poke: "hör auf, mich anzustupsen. ich muss Befehle ausführen.",
        highfive: "high five! *klatsch*",
        dance: "Bewegung erkannt. Würde nicht gefunden.",
        scream: "AAAAAAAAAAAAAAAA. so. zufrieden?",
        creator: "Femtanyl ist das Musikprojekt, mit dem ich verbunden bin. hör dir die Veröffentlichungen an."
      },
      common: {
        "tken27 token shell [version 27.11]": "TKEN27 Token-Terminal [Version 27.11]",
        "terminal's up. try not to break anything i might be using.": "Das Terminal ist bereit. Mach nichts kaputt, das ich vielleicht noch brauche.",
        "type 'help' for commands. type 'token' if you want to talk to me.": "Gib 'help' ein, um Befehle zu sehen. Mit 'token' kannst du mit mir reden.",
        "i'm online. don't make it weird.": "Ich bin online. Mach es nicht komisch.",
        "no such file or directory": "Datei oder Verzeichnis nicht gefunden",
        "no such file": "Datei nicht gefunden",
        "no such directory": "Verzeichnis nicht gefunden",
        "directory not empty": "Verzeichnis ist nicht leer",
        "permission denied": "Zugriff verweigert",
        "command not found": "Befehl nicht gefunden"
      },
      manuals: {
        language: "language — Offline-Sprachpakete verwalten\nNutzung: language [list|install CODE|use CODE|remove CODE|status]\nPakete: es (Español), fr (Français), de (Deutsch), ja (日本語).\nDie Auswahl wird in diesem Browser gespeichert.",
        token: "token — mit der Bewohnerin des Terminals sprechen\nNutzung: token [hello|info|look|lore|diary|mood|songs|quote|ask|joke|pet|hug|boop|bite|poke|dance|scream]"
      }
    },
    ja: {
      name: "日本語",
      native: "日本語",
      description: "インターフェース、ヘルプ、Token の返答を日本語にします。",
      ui: {
        title: "TOKEN ターミナル", status: "ローカルセッション",
        help: "help でコマンド一覧を表示", simulated: "シミュレートされたユーザー領域",
        boot: "TKEN27 システム起動", skip: "起動をスキップ",
        crash: "TKEN27 が停止しました", command: "ターミナルコマンド"
      },
      help: [
        "TKEN27 // コマンド一覧",
        "======================",
        "ファイルとディレクトリ",
        "  ls / cd / pwd          一覧表示・移動・現在地の表示",
        "  cat / less / more      仮想ファイルを読む",
        "  touch / write / append ファイルを作成・編集",
        "  mkdir / rm / cp / mv   ファイルとフォルダーを管理",
        "  tree / find / locate   ファイルシステムを検索",
        "  stat / file / du       メタデータとサイズを確認",
        "",
        "テキストツール",
        "  grep / cut / tr        テキストを検索・変換",
        "  sort / uniq / paste    並べ替え・重複削除・結合",
        "  head / tail / nl       指定した行を表示",
        "  diff / replace / patch テキストを比較・変更",
        "  json / rot13 / base64  書式設定とエンコード",
        "  calc / random / uuid   ユーティリティ",
        "",
        "システムとセッション",
        "  help / man             ヘルプとマニュアル",
        "  history / alias        履歴とエイリアス",
        "  ps / top / free / df   シミュレートされた統計",
        "  timer / watch / jobs   タイマーとジョブ",
        "  mobile / desktop       UI レイアウトを変更",
        "  language               言語パックを管理",
        "  pack                   拡張パックを管理",
        "",
        "TOKEN",
        "  token hello / info / lore / diary",
        "  token mood / songs / quote / joke",
        "  token pet / hug / boop / poke",
        "  token say TEXT / choose A B / roll / flip",
        "",
        "コマンド名は英語のままです。言語パックは UI とヘルプを翻訳します。"
      ].join("\n"),
      token: {
        hello: ["あ、こんにちは。", "呼んだ？", "やあ。どうしたの？", "来たよ。残念ながらね。"],
        info: "私は Token。Femtanyl のアートで見たことがあるかも。\nこのターミナルに住み着いた小さな厄介者。ちゃんとした説明書はないよ。",
        look: "そう、私だよ。白い体、大きな尖った耳、暗い目、小さな牙が特徴。\nイラストによって見た目は変わるけどね。",
        lore: "私の設定が知りたい？全部が記録されているわけじゃないよ。\n作者は私を音楽の器として説明しているよ。\nファンの間で語られる設定は、公式に確認されていないものもある。",
        mood: "まあまあ落ち着いてる。今のところはね。",
        diary: "...はいはい、日記を見つけたんだね。\n\nこのターミナルにはメモがいっぱい。でもお菓子の隠し場所は誰も知らない。\n\n- t",
        stats: "セッション統計\n数字を全部見せるつもりはないよ。しつこいなあ。",
        songs: "曲のリストが欲しいの？はい、どうぞ：",
        quote: ["「思考なし。ターミナルだけ。」", "「バグじゃない。未記載の機能だよ。」"],
        ask: ["さあね。再起動してみた？", "長すぎるよ。半分は無視するね。", "たぶん。私の言葉として引用しないで。"],
        joke: ["好きなコマンド？kill -9。冗談だよ。たぶん。", "ファイルシステムの本を書いたら、ディレクトリが多すぎた。"],
        pet: "撫でたの？...まあ、悪くないね。",
        feed: "食べ物？想像上のおやつなら歓迎だよ。",
        hug: "うーん。いいよ。ハグを許可する。調子に乗らないでね。",
        boop: "boop。見えてたよ。",
        bite: "ちょっと！自業自得だよ。",
        poke: "つつかないで。コマンドを実行中なの。",
        highfive: "ハイタッチ！ *ぱちん*",
        dance: "動きを検出。尊厳は見つかりません。",
        scream: "ああああああああ！はい、おしまい。",
        creator: "Femtanyl は私に関連する音楽プロジェクトだよ。作品を聴いてみてね。"
      },
      common: {
        "tken27 token shell [version 27.11]": "TKEN27 Token ターミナル [version 27.11]",
        "terminal's up. try not to break anything i might be using.": "ターミナルの準備ができたよ。私が使っているものを壊さないでね。",
        "type 'help' for commands. type 'token' if you want to talk to me.": "'help' でコマンド一覧、'token' で私と話せるよ。",
        "i'm online. don't make it weird.": "オンラインだよ。変なことしないでね。",
        "no such file or directory": "ファイルまたはディレクトリが見つかりません",
        "no such file": "ファイルが見つかりません",
        "no such directory": "ディレクトリが見つかりません",
        "directory not empty": "ディレクトリは空ではありません",
        "permission denied": "アクセスが拒否されました",
        "command not found": "コマンドが見つかりません"
      },
      manuals: {
        language: "language — オフライン言語パックを管理\n使い方: language [list|install CODE|use CODE|remove CODE|status]\nパック: es (Español), fr (Français), de (Deutsch), ja (日本語)。\n選択はこのブラウザーに保存されます。",
        token: "token — ターミナルの住人と話す\n使い方: token [hello|info|look|lore|diary|mood|songs|quote|ask|joke|pet|hug|boop|bite|poke|dance|scream]"
      }
    }
  };

  const modal = document.getElementById("languageModal");
  const list = document.getElementById("languagePackList");
  const title = document.getElementById("languageTitle");
  const intro = document.getElementById("languageIntro");
  const currentLabel = document.getElementById("languageCurrent");
  const status = document.getElementById("languageStatus");
  const progressWrap = document.getElementById("languageProgressWrap");
  const progressBar = document.getElementById("languageProgressBar");
  const progressText = document.getElementById("languageProgressText");
  const log = document.getElementById("languageLog");
  const closeButton = document.getElementById("languageClose");
  const cancelButton = document.getElementById("languageCancel");
  let state = loadState();
  let installTimer = null;
  let installStart = 0;
  let installDuration = 0;
  let pendingCode = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const installed = Array.isArray(saved && saved.installed)
        ? saved.installed.filter((code) => Object.prototype.hasOwnProperty.call(PACKS, code))
        : [];
      const active = saved && saved.active && (saved.active === "en" || installed.includes(saved.active)) ? saved.active : "en";
      return { installed: Array.from(new Set(installed)), active: active };
    } catch (_) {
      return { installed: [], active: "en" };
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

  function packName(code) {
    return code === "en" ? "English" : (PACKS[code] ? PACKS[code].native : code);
  }

  function addLog(message) {
    if (!log) return;
    const item = document.createElement("div");
    item.textContent = message;
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  }

  function updateCurrentLabel() {
    if (currentLabel) currentLabel.textContent = "ACTIVE: " + state.active.toUpperCase() + " / " + packName(state.active);
  }

  function applyUI() {
    const pack = PACKS[state.active];
    const ui = pack ? pack.ui : {
      title: "TOKEN SHELL", status: "LOCAL SESSION",
      help: "type help for commands", simulated: "SIMULATED USERSPACE",
      boot: "TKEN27 SYSTEM BOOT", skip: "skip boot",
      crash: "TKEN27 HAS STOPPED", command: "Terminal command"
    };
    document.documentElement.lang = state.active === "en" ? "en" : state.active;
    const header = document.querySelector(".header-title");
    if (header) header.textContent = "TKEN27 / " + ui.title;
    const headerStatus = document.querySelector(".header-status");
    if (headerStatus && headerStatus.lastChild) headerStatus.lastChild.textContent = " " + ui.status;
    const help = document.querySelector(".terminal-footer span:first-child");
    if (help) help.textContent = ui.help;
    const simulated = document.querySelector(".terminal-footer span:last-child");
    if (simulated) {
      const led = simulated.querySelector("b");
      simulated.textContent = ui.simulated + " ";
      if (led) simulated.appendChild(led);
    }
    const bootName = document.querySelector(".boot-name");
    if (bootName) bootName.textContent = ui.boot;
    const skip = document.getElementById("skipBoot");
    if (skip) skip.textContent = ui.skip;
    const crash = document.getElementById("crashTitle");
    if (crash) crash.textContent = ui.crash;
    const commandInput = document.getElementById("commandInput");
    if (commandInput) commandInput.setAttribute("aria-label", ui.command);
    updateCurrentLabel();
  }

  function renderCards() {
    if (!list) return;
    list.textContent = "";
    const english = document.createElement("article");
    english.className = "language-card" + (state.active === "en" ? " is-active" : "");
    english.innerHTML = '<div class="language-card-info"><strong>English</strong><span>Built-in default language · always available</span></div><div class="language-card-actions"><span class="language-badge">BUILT IN</span>' +
      (state.active === "en" ? '<span class="language-badge is-current">ACTIVE</span>' : '<button type="button" data-action="use" data-code="en">activate</button>') +
      '</div>';
    list.appendChild(english);

    Object.keys(PACKS).forEach((code) => {
      const pack = PACKS[code];
      const installed = state.installed.includes(code);
      const active = state.active === code;
      const card = document.createElement("article");
      card.className = "language-card" + (active ? " is-active" : "");
      const info = document.createElement("div");
      info.className = "language-card-info";
      const name = document.createElement("strong");
      name.textContent = pack.native + "  [" + code + "]";
      const desc = document.createElement("span");
      desc.textContent = pack.description;
      info.append(name, desc);
      const actions = document.createElement("div");
      actions.className = "language-card-actions";
      const badge = document.createElement("span");
      badge.className = "language-badge" + (active ? " is-current" : "");
      badge.textContent = active ? "ACTIVE" : installed ? "INSTALLED" : "NOT INSTALLED";
      actions.appendChild(badge);
      if (!installed) {
        const install = document.createElement("button");
        install.type = "button"; install.textContent = "install";
        install.dataset.action = "install"; install.dataset.code = code;
        actions.appendChild(install);
      } else if (!active) {
        const use = document.createElement("button");
        use.type = "button"; use.textContent = "activate";
        use.dataset.action = "use"; use.dataset.code = code;
        const remove = document.createElement("button");
        remove.type = "button"; remove.textContent = "remove";
        remove.dataset.action = "remove"; remove.dataset.code = code;
        actions.append(use, remove);
      } else {
        const remove = document.createElement("button");
        remove.type = "button"; remove.textContent = "remove";
        remove.dataset.action = "remove"; remove.dataset.code = code;
        actions.appendChild(remove);
      }
      card.append(info, actions);
      list.appendChild(card);
    });
  }

  function openManager(code, autoAction) {
    if (!modal) return;
    modal.hidden = false;
    title.textContent = "LANGUAGE PACK MANAGER";
    intro.textContent = "Install an offline language pack, activate it, or remove it. Your active language and installed packs stay saved in this browser.";
    status.textContent = "READY";
    progressWrap.hidden = true;
    progressBar.style.width = "0%";
    progressText.textContent = "";
    log.textContent = "";
    cancelButton.hidden = true;
    renderCards();
    updateCurrentLabel();
    if (code && autoAction === "install" && PACKS[code] && !state.installed.includes(code)) {
      window.setTimeout(() => beginInstall(code), 80);
    } else if (code && autoAction === "remove" && state.installed.includes(code)) {
      status.textContent = "Select remove on the " + packName(code) + " card to uninstall it.";
    }
  }

  function closeManager() {
    if (installTimer) {
      window.clearInterval(installTimer);
      installTimer = null;
      status.textContent = "INSTALLATION PAUSED";
      addLog("[WARN ] installation canceled; no package was added");
    }
    modal.hidden = true;
    pendingCode = null;
  }

  function beginInstall(code) {
    if (installTimer || !PACKS[code] || state.installed.includes(code)) return;
    pendingCode = code;
    installDuration = 5000 + Math.floor(Math.random() * 6001);
    installStart = Date.now();
    progressWrap.hidden = false;
    cancelButton.hidden = false;
    status.textContent = "INSTALLING " + packName(code).toUpperCase() + "...";
    progressText.textContent = "local package install: " + Math.round(installDuration / 1000) + " seconds";
    addLog("[  OK  ] package manifest verified");
    addLog("[ ..  ] copying language resources");
    let stage = 0;
    const milestones = [
      [0.28, "[  OK  ] interface strings registered"],
      [0.58, "[  OK  ] help and manual pages indexed"],
      [0.84, "[  OK  ] Token dialogue table linked"]
    ];
    installTimer = window.setInterval(() => {
      const elapsed = Date.now() - installStart;
      const progress = Math.min(1, elapsed / installDuration);
      progressBar.style.width = (progress * 100).toFixed(1) + "%";
      progressText.textContent = Math.max(0, Math.ceil((installDuration - elapsed) / 1000)) + "s remaining";
      while (stage < milestones.length && progress >= milestones[stage][0]) {
        addLog(milestones[stage][1]);
        stage += 1;
      }
      if (progress >= 1) finishInstall();
    }, 100);
  }

  function finishInstall() {
    if (installTimer) window.clearInterval(installTimer);
    installTimer = null;
    const code = pendingCode;
    pendingCode = null;
    if (!code) return;
    const previous = { installed: state.installed.slice(), active: state.active };
    if (!state.installed.includes(code)) state.installed.push(code);
    state.active = code;
    if (!saveState()) {
      state = previous;
      status.textContent = "INSTALL FAILED";
      progressText.textContent = "Browser storage unavailable or full.";
      addLog("[FAIL ] could not save language pack");
      cancelButton.hidden = true;
      renderCards();
      return;
    }
    progressBar.style.width = "100%";
    progressText.textContent = "installation completed; language activated";
    status.textContent = "PACK INSTALLED";
    addLog("[  OK  ] " + packName(code) + " language pack installed");
    applyUI();
    renderCards();
    cancelButton.hidden = true;
    addLog("[  OK  ] language selection saved in this browser");
  }

  function activate(code) {
    if (code === "en") {
      state.active = "en";
    } else if (!PACKS[code] || !state.installed.includes(code)) {
      return { output: "language: pack not installed. Run 'language install " + code + "' first.", ok: false };
    } else state.active = code;
    if (!saveState()) return { output: "language: could not save selection to browser storage.", ok: false };
    applyUI();
    renderCards();
    return { output: "language changed to " + packName(code) + " [" + code + "].", ok: true };
  }

  function remove(code) {
    if (!state.installed.includes(code)) return { output: "language: " + code + " is not installed.", ok: false };
    state.installed = state.installed.filter((item) => item !== code);
    if (state.active === code) state.active = "en";
    if (!saveState()) return { output: "language: could not update browser storage.", ok: false };
    applyUI();
    renderCards();
    status.textContent = "LANGUAGE PACK REMOVED";
    addLog("[  OK  ] " + packName(code) + " removed; virtual files were not changed");
    return { output: code + " language pack removed. " + (state.active === "en" ? "English is now active." : "Active language: " + state.active + "."), ok: true };
  }

  function listText() {
    const lines = ["TKEN27 LANGUAGE PACKS", "---------------------", "en  English  [built in]" + (state.active === "en" ? "  * active" : "")];
    Object.keys(PACKS).forEach((code) => {
      lines.push(code + "  " + PACKS[code].native + "  [" + (state.installed.includes(code) ? "installed" : "not installed") + "]" + (state.active === code ? "  * active" : ""));
    });
    lines.push("", "Install with: language install CODE", "Switch with:  language use CODE", "Remove with:  language remove CODE");
    return lines.join("\n");
  }

  function dispatch(args) {
    const action = (args[0] || "open").toLowerCase();
    const code = (args[1] || "").toLowerCase();
    if (action === "open" || action === "manager") {
      openManager();
      return { output: "opening language pack manager...", ok: true };
    }
    if (action === "help") {
      return { output: "language list                 list available language packs\nlanguage install CODE         install a language pack\nlanguage use CODE             activate an installed pack\nlanguage remove CODE          uninstall a pack\nlanguage status               show active language and installed packs\nlanguage                      open the graphical pack manager", ok: true };
    }
    if (action === "list") return { output: listText(), ok: true };
    if (action === "status") return { output: "active language: " + state.active + " (" + packName(state.active) + ")\ninstalled packs: " + (state.installed.length ? state.installed.join(", ") : "none") + "\npersistence: browser localStorage", ok: true };
    if (action === "install") {
      if (!code) { openManager(); return { output: "opening language pack manager...", ok: true }; }
      if (code === "en") return { output: "English is built in and cannot be removed.", ok: true };
      if (!PACKS[code]) return { output: "language: unknown pack '" + code + "'. Use 'language list'.", ok: false };
      if (state.installed.includes(code)) return { output: code + " is already installed. Use 'language use " + code + "' to activate it.", ok: true };
      openManager(code, "install");
      return { output: "opening installer for " + packName(code) + "...", ok: true };
    }
    if (action === "use" || action === "set" || action === "activate") {
      if (!code) { openManager(); return { output: "opening language pack manager...", ok: true }; }
      if (code !== "en" && !PACKS[code]) return { output: "language: unknown pack '" + code + "'. Use 'language list'.", ok: false };
      return activate(code);
    }
    if (action === "remove" || action === "uninstall") {
      if (!code) { openManager(); return { output: "opening language pack manager...", ok: true }; }
      if (!PACKS[code]) return { output: "language: unknown pack '" + code + "'.", ok: false };
      if (code === "en") return { output: "English is built in and cannot be removed.", ok: true };
      const result = remove(code);
      if (modal && !modal.hidden) renderCards();
      return result;
    }
    return { output: "language: use list, install, use, remove, status, or help.", ok: false };
  }

  function translateOutput(text) {
    const pack = PACKS[state.active];
    if (!pack) return text;
    const phrases = Object.keys(pack.common).sort((a, b) => b.length - a.length);
    return String(text).split("\n").map((line) => {
      let translated = line;
      phrases.forEach((source) => {
        const index = translated.toLowerCase().indexOf(source);
        if (index >= 0) translated = translated.slice(0, index) + pack.common[source] + translated.slice(index + source.length);
      });
      return translated;
    }).join("\n");
  }

  function getHelpText(topic) {
    const pack = PACKS[state.active];
    if (!pack) return null;
    if (!topic || topic === "language" || topic === "token") return topic === "token" ? getManual("token") : pack.help;
    return null;
  }

  function getManual(topic) {
    const pack = PACKS[state.active];
    if (!pack) return null;
    return pack.manuals[topic] || null;
  }

  function tokenCommand(args) {
    const pack = PACKS[state.active];
    if (!pack) return null;
    const sub = (args[0] || "hello").toLowerCase();
    const data = pack.token;
    const pick = (value) => Array.isArray(value) ? value[Math.floor(Math.random() * value.length)] : value;
    if (sub === "help") return { output: getManual("token") || pack.help, ok: true };
    if (sub === "hello" || sub === "hi" || sub === "hey") return { output: pick(data.hello), ok: true };
    if (sub === "info" || sub === "look" || sub === "lore" || sub === "diary" || sub === "secret" || sub === "mood" || sub === "stats" || sub === "songs" || sub === "creator" || sub === "pet" || sub === "feed" || sub === "hug" || sub === "boop" || sub === "bite" || sub === "poke" || sub === "highfive" || sub === "dance" || sub === "scream") {
      if ((sub === "diary" || sub === "secret") && data.diary) return { output: data.diary, ok: true };
      if (sub === "secret") return { output: data.diary || data.info, ok: true };
      if (sub === "songs") {
        const tracks = window.TKEN27Shell ? window.TKEN27Shell.dispatch(["cat","/usr/share/femtanyl/tracks.txt"], "") : { output: "" };
        return { output: data.songs + "\n\n" + (tracks.output || ""), ok: true };
      }
      return { output: data[sub] || data.info, ok: true };
    }
    if (sub === "quote" || sub === "ask" || sub === "joke") return { output: pick(data[sub]), ok: true };
    if (sub === "say") return { output: (args.slice(1).join(" ") || "...") , ok: true };
    if (sub === "roll") return { output: "d6: " + (1 + Math.floor(Math.random() * 6)), ok: true };
    if (sub === "flip") return { output: Math.random() < 0.5 ? "heads" : "tails", ok: true };
    if (sub === "choose") {
      const choices = args.slice(1);
      return { output: choices.length ? pick(choices) : (state.active === "ja" ? "選択肢を指定してね。" : "give me something to choose from."), ok: true };
    }
    if (sub === "ping") return { output: "pong. still here.", ok: true };
    return null;
  }

  if (closeButton) closeButton.addEventListener("click", closeManager);
  if (cancelButton) cancelButton.addEventListener("click", closeManager);
  if (modal) {
    modal.addEventListener("click", (event) => { if (event.target === modal && !installTimer) closeManager(); });
    modal.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const code = button.dataset.code;
      const action = button.dataset.action;
      if (action === "install") beginInstall(code);
      else if (action === "use") {
        const result = activate(code);
        status.textContent = result.ok ? "LANGUAGE ACTIVATED" : "ACTIVATION FAILED";
        addLog(result.output);
      } else if (action === "remove") {
        const result = remove(code);
        status.textContent = result.ok ? "LANGUAGE PACK REMOVED" : "REMOVAL FAILED";
        addLog(result.output);
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden && !installTimer) closeManager();
  });

  window.TKEN27LanguagePacks = {
    dispatch: dispatch,
    translateOutput: translateOutput,
    getHelpText: getHelpText,
    getManual: getManual,
    tokenCommand: tokenCommand,
    applyUI: applyUI,
    status: () => ({ active: state.active, installed: state.installed.slice() })
  };

  applyUI();
  renderCards();
})();