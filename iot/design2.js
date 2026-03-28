/* Design 2: Blueprint — JS */
document.addEventListener("DOMContentLoaded", () => {
  // Scroll reveal
  const sections = document.querySelectorAll(".bp-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.08 },
  );
  sections.forEach((s) => observer.observe(s));

  // SSE mockup
  const logContainer = document.getElementById("sse-log");
  if (logContainer) {
    const events = [
      {
        event: "position_update",
        device: "TRK-4A7F",
        x: "12.84",
        y: "34.29",
        floor: "2F",
      },
      {
        event: "rssi_reading",
        device: "TRK-4A7F",
        relay: "RLY-01",
        rssi: "-42dBm",
      },
      {
        event: "rssi_reading",
        device: "TRK-91B2",
        relay: "RLY-03",
        rssi: "-58dBm",
      },
      {
        event: "position_update",
        device: "TRK-91B2",
        x: "8.33",
        y: "21.01",
        floor: "1F",
      },
      {
        event: "calc_complete",
        device: "TRK-4A7F",
        method: "trilateration",
        confidence: "94.2%",
      },
      {
        event: "rssi_reading",
        device: "TRK-C3D1",
        relay: "RLY-04",
        rssi: "-61dBm",
      },
      {
        event: "position_update",
        device: "TRK-4A7F",
        x: "13.11",
        y: "34.51",
        floor: "2F",
      },
      { event: "heartbeat", clients: "3", uptime: "04:22:17" },
      {
        event: "calc_complete",
        device: "TRK-91B2",
        method: "weighted_centroid",
        confidence: "87.6%",
      },
      {
        event: "position_update",
        device: "TRK-C3D1",
        x: "5.22",
        y: "18.44",
        floor: "1F",
      },
    ];
    let idx = 0;

    function addLine() {
      const d = events[idx % events.length];
      const now = new Date();
      const ts = now.toTimeString().split(" ")[0];

      const line = document.createElement("div");
      line.className = "sse-log-line";

      let html = `<span class="time">[${ts}]</span> `;
      html += `<span class="event">${d.event}</span> `;

      if (d.event === "position_update") {
        html += `<span class="data">${d.device}</span> → <span class="coords">(${d.x}, ${d.y}) ${d.floor}</span>`;
      } else if (d.event === "rssi_reading") {
        html += `<span class="data">${d.device} ${d.relay}</span> <span class="coords">${d.rssi}</span>`;
      } else if (d.event === "calc_complete") {
        html += `<span class="data">${d.device} ${d.method}</span> <span class="coords">${d.confidence}</span>`;
      } else {
        html += `<span class="data">clients:${d.clients} up:${d.uptime}</span>`;
      }

      line.innerHTML = html;
      logContainer.prepend(line);

      const lines = logContainer.querySelectorAll(".sse-log-line");
      if (lines.length > 18) lines[lines.length - 1].remove();

      idx++;
    }

    setTimeout(() => {
      addLine();
      setInterval(addLine, 2000);
    }, 800);
  }
});
