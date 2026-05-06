// ===== メニュー開閉 =====
document.querySelectorAll(".menu-title.has-plus").forEach(title => {
  title.addEventListener("click", () => {
    const block = title.parentElement;

    document.querySelectorAll(".menu-block").forEach(b => {
      if (b !== block) {
        b.classList.remove("open");
        const t = b.querySelector(".menu-title");
        if (t) t.classList.remove("open");
      }
    });

    block.classList.toggle("open");
    title.classList.toggle("open");
  });
});

// ===== ランダム時計（拡張版） =====
const zones = [
  { tz: "Asia/Tokyo", label: "JST" },
  { tz: "Asia/Seoul", label: "KST" },
  { tz: "Asia/Shanghai", label: "CST" },
  { tz: "Asia/Bangkok", label: "ICT" },
  { tz: "Asia/Kolkata", label: "IST" },
  { tz: "Asia/Dubai", label: "GST" },
  { tz: "Europe/Athens", label: "EET" },
  { tz: "Europe/Rome", label: "CET" },
  { tz: "Europe/Paris", label: "CET" },
  { tz: "Europe/Berlin", label: "CET" },
  { tz: "Europe/London", label: "GMT" },
  { tz: "Europe/Reykjavik", label: "GMT" },
  { tz: "Africa/Cairo", label: "EET" },
  { tz: "Africa/Nairobi", label: "EAT" },
  { tz: "Africa/Lagos", label: "WAT" },
  { tz: "America/New_York", label: "EST" },
  { tz: "America/Chicago", label: "CST" },
  { tz: "America/Denver", label: "MST" },
  { tz: "America/Los_Angeles", label: "PST" },
  { tz: "America/Mexico_City", label: "CST" },
  { tz: "America/Sao_Paulo", label: "BRT" },
  { tz: "America/Argentina/Buenos_Aires", label: "ART" },
  { tz: "America/Santiago", label: "CLT" },
  { tz: "Pacific/Honolulu", label: "HST" },
  { tz: "Australia/Sydney", label: "AEST" },
  { tz: "Australia/Perth", label: "AWST" },
  { tz: "Pacific/Auckland", label: "NZST" },
  { tz: "Pacific/Fiji", label: "FJT" },
  { tz: "Asia/Ulaanbaatar", label: "ULAT" },
  { tz: "Asia/Kathmandu", label: "NPT" },
  { tz: "America/Anchorage", label: "AKST" },
  { tz: "Atlantic/Azores", label: "AZOT" }
];

// ランダム選択
const zone = zones[Math.floor(Math.random() * zones.length)];

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("en-GB", {
    timeZone: zone.tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  document.getElementById("clock").textContent = `${time} ${zone.label}`;
}

setInterval(updateClock, 1000);
updateClock();

// ===== スプレッドシート設定 =====
const SHEET_ID = "1uakXSK0EOAc7HQjgjsNMQHtrXoozHGk1khORkhg3Ig0";
const BASE = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

// ===== CSVパース（安定版） =====
function parseCSV(str) {
  const rows = str.trim().split("\n");

  const headers = rows[0]
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map(h => h.replace(/"/g, "").trim());

  return rows.slice(1).map(row => {
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    let obj = {};
    headers.forEach((h, i) => {
      let val = cols[i] || "";
      val = val.replace(/^"|"$/g, "").trim();
      obj[h] = val;
    });

    return obj;
  });
}

// ===== 共通取得 =====
async function loadSheet(name) {
  const res = await fetch(BASE + name);
  const text = await res.text();
  return parseCSV(text);
}

// ===== project =====
async function renderProjects() {
  const data = await loadSheet("project");
  const container = document.getElementById("project-list");

  container.innerHTML = "";

  data.forEach(d => {
    if (d.visible !== "TRUE") return;

    const el = document.createElement("div");
    el.className = "link-item";
    el.innerHTML = `<a href="work.html?type=project&id=${d.id}">● ${d.title}</a>`;

    container.appendChild(el);
  });
}

// ===== text =====
async function renderText() {
  const data = await loadSheet("text");
  const container = document.getElementById("text-list");

  data
    .filter(d => d.visible === "TRUE")
    .forEach(d => {

      // 外部リンク or 別HTML
      if (d.link) {
        const el = document.createElement("div");
        el.className = "text-item";
        el.innerHTML = `<a href="${d.link}" target="_blank">${d.title}</a>`;
        container.appendChild(el);

      } else {
        // 開閉型
        const item = document.createElement("div");
        item.className = "text-item has-plus-inner";
        item.textContent = d.title;

        const detail = document.createElement("div");
        detail.className = "text-detail";

        let publicationHTML = "";
        if (d.publication_url) {
          publicationHTML = `<a href="${d.publication_url}" target="_blank">${d.publication_name || "link"}</a>`;
        }

        detail.innerHTML = `
          <div><span>type:</span> ${d.type || ""}</div>
          <div><span>date:</span> ${d.date || ""}</div>
          <div><span>publication:</span> ${publicationHTML}</div>
        `;

        // 本文
        if (d.body) {
          const body = document.createElement("div");
          body.className = "text-body";
          body.innerHTML = d.body.replace(/\n/g, "<br>");
          detail.appendChild(body);
        }

        container.appendChild(item);
        container.appendChild(detail);

        item.addEventListener("click", () => {

  // 他を全部閉じる
  container.querySelectorAll(".text-detail").forEach(d => {
    if (d !== detail) d.classList.remove("open");
  });

  // 自分を開閉
  detail.classList.toggle("open");
});
      }
    });
}

// ===== demo =====
async function renderDemo() {
  const data = await loadSheet("demo");
  const container = document.getElementById("demo-list");

  container.innerHTML = "";

  data.forEach(d => {
    if (d.visible !== "TRUE") return;

    const el = document.createElement("div");
    el.className = "link-item";
    el.innerHTML = `<a href="work.html?type=demo&id=${d.id}">● ${d.title}</a>`;

    container.appendChild(el);
  });
}

// ===== about =====
async function renderAbout() {
  const data = await loadSheet("about");
  const container = document.getElementById("about-list");

  data.forEach(d => {

    if (!d.text) {
      const spacer = document.createElement("div");
      spacer.style.height = "12px";
      container.appendChild(spacer);
      return;
    }

    const el = document.createElement("div");
    el.innerHTML = d.text;
    container.appendChild(el);
  });
}

// ===== link =====
async function renderLinks() {
  const data = await loadSheet("link");
  const container = document.getElementById("link-list");

  data.forEach(d => {
    let url = d.url || "";

    // メール自動補正
    if (url.includes("@") && !url.startsWith("http") && !url.startsWith("mailto:")) {
      url = "mailto:" + url;
    }

    // 表示用テキスト
    let display = d.name;
    if (url.startsWith("mailto:")) {
      display = url.replace("mailto:", "");
    }

    const el = document.createElement("div");
    el.innerHTML = `<a href="${url}" target="_blank">${display}</a>`;
    container.appendChild(el);
  });
}

// ===== 実行 =====
renderProjects();
renderText();
renderDemo();
renderAbout();
renderLinks();