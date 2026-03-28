/* ERP Design 3: Swiss Minimalist — JS */
document.addEventListener("DOMContentLoaded", () => {
  const nodes = document.querySelectorAll(".flow-node");
  const detailsTitle = document.getElementById("details-title");
  const detailsDesc = document.getElementById("details-desc");
  const detailsParticipants = document.getElementById("details-participants");
  const payloadBox = document.getElementById("payload-box");

  const contentData = {
    1: {
      title: "System A Initiation",
      desc: "The connection sequence commences. The administrative interface on System A securely queries the backend `/initiate` endpoint. This internal trigger instructs System A to construct a structured connection request bound for the external target, System B.",
      participants: ["Admin Interface", "System A API"],
      payload: `{\n  "domain": "erp-b.internal",\n  "name": "Warehouse Management",\n  "type": "logistics_erp",\n  "services": {\n    "inventory_sync": ["read", "write"]\n  }\n}\n\n// Status remains PENDING locally.`,
    },
    2: {
      title: "Trusted Credential Validation",
      desc: "Upon receiving the incoming POST request to `/receive`, System B halts processing. It immediately forwards the requesting system's details to the central Admin System Service Provider via the `/validate` endpoint. Admin System acts as the ultimate arbiter of trust, verifying the credentials against the operator database.",
      participants: ["System B API", "Service Provider (Admin System)"],
      payload: `{\n  "domain": "erp-a.internal",\n  "name": "Central Accounting",\n  "type": "finance_erp"\n}\n\n// Admin System Response:\n// HTTP 200 OK — ORIGIN_VERIFIED`,
    },
    3: {
      title: "Webhook Confirmation",
      desc: "Validation succeeds. System B registers the connection status as active in its database. To complete the handshake, System B queries the webhook endpoint (`/complete`) predetermined on System A, transmitting the newly generated access token and granted service scopes.",
      participants: ["System B Database", "System A Webhook"],
      payload: `{\n  "domain": "erp-b.internal",\n  "name": "Warehouse Management",\n  "type": "logistics_erp",\n  "token": "eyJh... (ACCESS_TOKEN)",\n  "services": {\n    "inventory_sync": ["read", "write"]\n  }\n}`,
    },
    4: {
      title: "Local State Resolution",
      desc: "System A's webhook receives the final response payload. The local database is updated, saving the access token for future automated exchanges. Finally, the administrative user interface polling the status receives the success event, finalizing the connection sequence.",
      participants: ["System A API", "System A Database", "Frontend UI"],
      payload: `// System A internal state transition:\n// PENDING -> ESTABLISHED\n\n{\n  "connection_id": "conn_8f9x",\n  "target": "erp-b.internal",\n  "status": "active",\n  "token_stored": true\n}`,
    },
  };

  // Swiss-style custom syntax highlighter
  function highlight(str) {
    if (str.startsWith("//")) {
      const parts = str.split("\n");
      let result = "";
      parts.forEach((p) => {
        if (p.startsWith("//"))
          result += `<span class="hl-comment">${p}</span>\n`;
        else {
          result +=
            p
              .replace(/"([^"]+)"\s*:/g, '<span class="hl-key">"$1"</span>:')
              .replace(
                /: \s*"([^"]*)"/g,
                ': <span class="hl-string">"$1"</span>',
              ) + "\n";
        }
      });
      return result;
    }

    return str
      .replace(/"([^"]+)"\s*:/g, '<span class="hl-key">"$1"</span>:')
      .replace(/: \s*"([^"]*)"/g, ': <span class="hl-string">"$1"</span>');
  }

  function activateNode(stepId) {
    // Reset nodes
    nodes.forEach((n) => n.classList.remove("active"));

    // Set active node
    const node = document.querySelector(`.flow-node[data-step="${stepId}"]`);
    if (node) node.classList.add("active");

    // Update Content
    const data = contentData[stepId];
    if (data) {
      detailsTitle.textContent = data.title;
      detailsDesc.textContent = data.desc;

      // Update participants
      detailsParticipants.innerHTML = "";
      data.participants.forEach((p) => {
        const span = document.createElement("span");
        span.className = "participant";
        span.textContent = p;
        detailsParticipants.appendChild(span);
      });

      // Update Payload
      payloadBox.innerHTML = highlight(data.payload);
    }
  }

  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      activateNode(node.getAttribute("data-step"));
    });
  });

  // Init step 1
  activateNode("1");
});
