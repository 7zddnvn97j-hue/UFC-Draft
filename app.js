async function loadData() {
  const res = await fetch("data.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load data.json");
  return await res.json();
}

function calcScores(data) {
  const players = data.players;
  const points = {};
  const champs = {};
  players.forEach(p => { points[p] = 0; champs[p] = 0; });

  const divisions = Object.keys(data.rankingsTop5 || {});
  for (const div of divisions) {
    const top5 = data.rankingsTop5[div] || [];
    const picksForDiv = (data.picks && data.picks[div]) ? data.picks[div] : {};

    // For each player, award points based on where their pick appears in top5
    for (const player of players) {
      const pick = picksForDiv[player];
      if (!pick) continue;

      const idx = top5.findIndex(name => name.toLowerCase() === pick.toLowerCase());
      if (idx === -1) continue;

      const awarded = Math.max(0, 5 - idx); // idx 0 => 5 points, idx 4 => 1 point
      points[player] += awarded;
      if (idx === 0) champs[player] += 1;
    }
  }

  // Build leaderboard array
  const leaderboard = players.map(p => ({
    player: p,
    champs: champs[p],
    points: points[p]
  }));

  leaderboard.sort((a, b) => {
    if (b.champs !== a.champs) return b.champs - a.champs;
    return b.points - a.points;
  });

  return leaderboard;
}

function renderHome(data, leaderboard) {
  const leader = leaderboard[0];
  const leaderText = leader
    ? `<strong>${leader.player}</strong> leads with <strong>${leader.champs}</strong> champs and <strong>${leader.points}</strong> points.`
    : `No data yet.`;

  document.getElementById("currentLeaderText").innerHTML = leaderText;

  const body = document.getElementById("leaderboardBody");
  body.innerHTML = "";
  for (const row of leaderboard) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.player}</td>
      <td>${row.champs}</td>
      <td>${row.points}</td>
    `;
    body.appendChild(tr);
  }

  const nf = data.nextImportantFight || {};
  const nfText = nf.event
    ? `<strong>${nf.event}</strong> — ${nf.fighters?.join(" vs ") || "TBD"} (${nf.date || "TBD"})`
    : `TBD`;
  document.getElementById("nextFightText").innerHTML = nfText;

  const updated = data.updatedAt ? new Date(data.updatedAt).toUTCString() : "";
  document.getElementById("updatedAtText").textContent = updated ? `Last updated: ${updated}` : "";
}

(async function init() {
  try {
    const data = await loadData();
    const leaderboard = calcScores(data);
    renderHome(data, leaderboard);
  } catch (err) {
    document.getElementById("currentLeaderText").textContent = "Error loading data.";
    console.error(err);
  }
})();

