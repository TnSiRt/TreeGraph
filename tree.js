const tree = document.getElementById("tree");
const lines = document.getElementById("lines");

let nodes = [];
let families = [];
let levels = {};
let selectedNode = null;

// ====== МОДЕЛИ ======

function createNode(name, gender, level) {
  const div = document.createElement("div");
  div.className = "person " + (gender === "M" ? "male" : "female");
  div.textContent = name;
  tree.appendChild(div);

  const node = {
    id: nodes.length,
    name,
    gender,
    level,
    div,
    familyAsChild: null,
    familyAsParent: null,
    x: 0,
    y: 0
  };

  nodes.push(node);
  if (!levels[level]) levels[level] = [];
  levels[level].push(node);

  div.oncontextmenu = e => {
    e.preventDefault();
    selectedNode = node;
    showContextMenu(e.clientX, e.clientY);
  };

  layout();
  return node;
}

function createFamily(parent1, parent2) {
  const family = {
    parents: [parent1, parent2].filter(Boolean),
    children: []
  };
  families.push(family);
  return family;
}

// ====== ГЕОМЕТРИЯ ======

function layout() {
  lines.innerHTML = "";

  // 1. Сначала раскладываем уровни БЕЗ детей
  Object.keys(levels).forEach(lvl => {
    const arr = levels[lvl];
    const gap = 140;
    const total = (arr.length - 1) * gap;
    const startX = window.innerWidth / 2 - total / 2;

    arr.forEach((node, i) => {
      node.x = startX + i * gap;
      node.y = 600 - lvl * 160;
    });
  });

  // 2. Теперь корректируем детей относительно семьи
  families.forEach(fam => {
    if (!fam.children.length) return;

    // центр семьи = центр родителей
    const centerX =
      fam.parents.reduce((s, p) => s + p.x, 0) / fam.parents.length;

    const gap = 120;
    const count = fam.children.length;
    const startX = centerX - ((count - 1) * gap) / 2;

    fam.children.forEach((child, i) => {
      child.x = startX + i * gap;
    });
  });

  // 3. Применяем координаты к DOM
  nodes.forEach(node => {
    node.div.style.left = node.x - 30 + "px";
    node.div.style.top  = node.y - 30 + "px";
  });

  drawLines();
}

// ====== ЛИНИИ ======

function drawLines() {
  const tRect = tree.getBoundingClientRect();

  families.forEach(fam => {
    if (!fam.parents.length || !fam.children.length) return;

    const parentRects = fam.parents.map(p => p.div.getBoundingClientRect());

    const parentXs = parentRects.map(
      r => r.left - tRect.left + r.width / 2
    );

    const parentBottomY = Math.max(
      ...parentRects.map(r => r.bottom - tRect.top)
    );

    const jointY = parentBottomY + 20;
    const centerX = parentXs.reduce((a, b) => a + b, 0) / parentXs.length;

    // линия между родителями
    if (parentXs.length === 2) {
      line(parentXs[0], parentBottomY, parentXs[1], parentBottomY);
    }

    // вертикаль вниз
    line(centerX, parentBottomY, centerX, jointY);

    // горизонталь к детям
    const childXs = fam.children.map(c => c.x);
    line(
      Math.min(...childXs),
      jointY,
      Math.max(...childXs),
      jointY
    );

    // вертикали к каждому ребёнку
    fam.children.forEach(child => {
      const r = child.div.getBoundingClientRect();
      const cy = r.top - tRect.top;
      line(child.x, jointY, child.x, cy);
    });
  });
}

function line(x1, y1, x2, y2) {
  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", "black");
  lines.appendChild(l);
}

