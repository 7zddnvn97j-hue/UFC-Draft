async function loadData() {
  const res = await fetch("data.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load data.json");
  return await res.json();
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPicks(data) {
  const root = document.getElementById("picksRoot");
  const divisions = Object.keys(data.picks || {});
  const players = data.players || [];
  const fighters = data.fighters || {};

  if (divisions.length === 0) {
    root.textContent = "No picks found in data.json yet.";
    return;
  }

  const cards = divisions.map(div => {
    const picksForDiv = data.picks[div] || {};

    const rows = players.map(player => {
      const fighterName = picksForDiv[player] || "";
      const img = fighters[fighterName];

      const imgHtml = img && img.trim()
        ? `<img class="pick-img" src="${escapeHtml(img)}" alt="${escapeHtml(fighterName)}" loading="lazy"
             onerror="this.onerror=null; this.src='https://via.placeholder.com/96x96?text=No+Img';">`
        : `<img class="pick-img" src="https://via.placeholder.com/96x96?text=No+Img" alt="No image" loading="lazy">`;

      return `
        <div class="pick-row">
          ${imgHtml}
          <div class="pick-meta">
            <div class="pick-player">${escapeHtml(player)}</div>
            <div class="pick-fighter">${escapeHtml(fighterName || "—")}</div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <section class="pick-card">
        <h2 class="pick-division">${escapeHtml(div)}</h2>
        <div class="pick-list">${rows}</div>
      </section>
    `;
  }).join("");

  root.innerHTML = cards;
}

(async function init() {
  try {
    const data = await loadData();
    renderPicks(data);
  } catch (e) {
    console.error(e);
    document.getElementById("picksRoot").textContent = "Error loading picks. Check that data.json exists and is valid JSON.";
  }
})();
