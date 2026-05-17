document.addEventListener("DOMContentLoaded", () => {
  const garden = document.querySelector(".garden");
  if (!garden) return;

  const svg = garden.querySelector(".garden-paths");

  const nodes = window.gardenNodes || [];
  const connections = window.gardenConnections || [];

  // ---- GET THE MAX ROWS FROM NODES ----
  const maxRow = Math.max(
    ...nodes.map((node) => node.row || 1)
  );

  // ---- READ CONFIG FROM CSS ----
  const styles = getComputedStyle(document.documentElement);

  const GRID_COLS = parseInt(
    styles.getPropertyValue("--grid-cols")
  );

  const COLUMN_WIDTH = parseInt(
    styles.getPropertyValue("--column-width")
  );

  const ROW_HEIGHT = parseInt(
    styles.getPropertyValue("--row-height")
  );

  const X_OFFSET = parseInt(
    styles.getPropertyValue("--x-offset")
  );

  const Y_OFFSET = parseInt(
    styles.getPropertyValue("--y-offset")
  );

  const NODE_SIZE = parseInt(
    styles.getPropertyValue("--node-size")
  );

  // ---- SET GARDEN HEIGHT ----
  const gardenHeight =
    Y_OFFSET +
    (maxRow - 1) * ROW_HEIGHT +
    NODE_SIZE

  garden.style.height = `${gardenHeight}px`;

  // Add (row, col) coordinates to each tile in the grid
  const draftLayer = document.getElementById("garden-draft-layer");
  const isDraft = garden.classList.contains("is-draft");

  if (isDraft && draftLayer) {
    
    for (let r = 1; r <= maxRow; r++) {
      for (let c = 1; c <= GRID_COLS; c++) {
        const label = document.createElement("div");
        label.className = "grid-coord";
        
        // Calculate bottom-left position of the tile
        const x = (c - 1) * COLUMN_WIDTH;
        const y = r * ROW_HEIGHT;
        
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.textContent = `(${c}, ${r})`;
        
        draftLayer.appendChild(label);
      }
    }
  }

  // ---- SYNC SVG VIEWBOX WITH ACTUAL GARDEN SIZE ----
  const gardenRect = garden.getBoundingClientRect();

  svg.setAttribute(
    "viewBox",
    `0 0 ${gardenRect.width} ${gardenHeight}`
  );

  // ---- INDEX NODES ----
  const nodeMap = {};
  const nodePositions = {};

  nodes.forEach((node) => {
    const { x, y } = gridToPixels(node);

    nodeMap[node.id] = node;
    nodePositions[node.id] = { x, y };
  });

  // ---- APPLY POSITIONING TO DOM ----
  document.querySelectorAll(".garden-node").forEach((el) => {
    const col = parseInt(el.dataset.col);
    const row = parseInt(el.dataset.row);

    const offsetX = parseInt(
      el.dataset.offsetX || "0"
    );

    const offsetY = parseInt(
      el.dataset.offsetY || "0"
    );

    // IMPORTANT:
    // left/top now represent CENTER
    const x =
      X_OFFSET +
      (col - 1) * COLUMN_WIDTH +
      NODE_SIZE / 2 +
      offsetX;

    const y =
      Y_OFFSET +
      (row - 1) * ROW_HEIGHT +
      NODE_SIZE / 2 +
      offsetY;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });

  // ---- RENDER CONNECTIONS ----
  connections.forEach((connection) => {
    const from = nodePositions[connection.from];
    const to = nodePositions[connection.to];

    if (!from || !to) {
      console.warn(
        "[Garden] Missing node for connection:",
        connection
      );

      return;
    }

    const path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    path.setAttribute(
      "d",
      createBezierPath(
        from.x,
        from.y,
        to.x,
        to.y
      )
    );

    path.setAttribute(
      "class",
      `garden-path ${connection.type}`
    );

    svg.appendChild(path);
  });

  // ---- GRID → PIXELS ----
  function gridToPixels(node) {
    const col = node.col ?? 1;
    const row = node.row ?? 1;

    const offsetX = node.offsetX || 0;
    const offsetY = node.offsetY || 0;

    // IMPORTANT:
    // Coordinates represent NODE CENTERS
    const x =
      X_OFFSET +
      (col - 1) * COLUMN_WIDTH +
      NODE_SIZE / 2 +
      offsetX;

    const y =
      Y_OFFSET +
      (row - 1) * ROW_HEIGHT +
      NODE_SIZE / 2 +
      offsetY;

    return { x, y };
  }

  // ---- BEZIER PATH ----
  function createBezierPath(x1, y1, x2, y2) {
    const midY = (y1 + y2) / 2;

    return `
      M ${x1} ${y1}
      C ${x1} ${midY},
        ${x2} ${midY},
        ${x2} ${y2}
    `;
  }
});