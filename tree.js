/* =======================
   GLOBAL VARIABLES
======================= */

const svg = document.getElementById("tree"); // глобально
let g; // группа для zoom/pan

let nodes = [];
let families = [];
let nodeId = 0;
let selectedNode = null;

let offsetX = 500;
let offsetY = 500;
let scale = 1;

let isPanning = false;
let startX = 0;
let startY = 0;

/* =======================
   NODE / FAMILY
======================= */

function createNode(gender, level) {
  const node = {
    id: nodeId++,
    gender,
    level,
    x: 0,
    y: 0,
    parents: [],
    children: [],
    families: []
  };
  nodes.push(node);
  return node;
}

function createFamily(parents) {
  const fam = { parents, children: [] };
  families.push(fam);
  parents.forEach(p => p.families.push(fam));
  return fam;
}

/* =======================
   ADD FUNCTIONS
======================= */

function addRoot(gender) {
  if (nodes.length > 0) return alert("Корень уже есть");
  createNode(gender, 0);
  layout();
}

function addParent(node, gender) {
  const parent = createNode(gender, node.level + 1);

  let fam;
  if (node.parents.length === 0) {
    fam = createFamily([parent]);
    fam.children.push(node);
    node.parents.push(parent);
    parent.children.push(node);
  } else if (node.parents.length === 1) {
    fam = node.parents[0].families[0];
    fam.parents.push(parent);
    parent.families.push(fam);
    fam.children.forEach(c => c.parents.push(parent));
  }

  layout();
}

function addSibling(node, gender) {
  if (node.parents.length === 0) return;

  const fam = node.parents[0].families[0];
  const sibling = createNode(gender, node.level);

  sibling.parents = [...fam.parents];
  fam.children.push(sibling);
  fam.parents.forEach(p => p.children.push(sibling));

  layout();
}

function addChild(node, gender) {
  let fam;
  if (node.families.length === 0) {
    fam = createFamily([node]);
  } else {
    fam = node.families[0];
  }

  const child = createNode(gender, node.level - 1);
  fam.children.push(child);
  child.parents = [...fam.parents];
  fam.parents.forEach(p => p.children.push(child));

  layout();
}

/* =======================
   LAYOUT FUNCTION
======================= */

function layout() {
  const levels = {};

  nodes.forEach(n => {
    if (!levels[n.level]) levels[n.level] = [];
    levels[n.level].push(n);
  });

  const levelGap = 180;
  const nodeGap = 140;

  Object.keys(levels).forEach(level => {
    const arr = levels[level];
    const width = (arr.length - 1) * nodeGap;
    const startX = -width / 2;

    arr.forEach((n, i) => {
      n.x = startX + i * nodeGap;
      n.y = -level * levelGap;
    });
  });

  // Центрируем детей относительно родителей
  families.forEach(f => {
    if (f.parents.length === 0 || f.children.length === 0) return;

    const centerX =
      f.parents.reduce((s, p) => s + p.x, 0) / f.parents.length;

    const gap = 120;
    const startX = centerX - ((f.children.length - 1) * gap) / 2;

    f.children.forEach((c, i) => {
      c.x = startX + i * gap;
    });
  });

  draw();
}

/* =======================
   DRAW FUNCTION
======================= */

function draw() {
  g = document.createElementNS(svg.namespaceURI, "g");
  g.setAttribute("transform", `translate(${offsetX},${offsetY}) scale(${scale})`);
  svg.innerHTML = "";
  svg.appendChild(g);

  	// DRAW LINES
	families.forEach(f => {
	 f.children.forEach(c => {
	   f.parents.forEach(p => {
	     // сначала вертикальная линия вниз от родителя
	     const midY = (p.y + 25 + c.y - 25) / 2;

	     const vertLine = document.createElementNS(svg.namespaceURI, "line");
	     vertLine.setAttribute("x1", p.x);
	     vertLine.setAttribute("y1", p.y + 25);
	     vertLine.setAttribute("x2", p.x);
	     vertLine.setAttribute("y2", midY);
	     vertLine.setAttribute("stroke", "#888");
	     vertLine.setAttribute("stroke-width", "2");
	     g.appendChild(vertLine);

	     // горизонтальная линия к ребенку
	     const horLine = document.createElementNS(svg.namespaceURI, "line");
	     horLine.setAttribute("x1", p.x);
	     horLine.setAttribute("y1", midY);
	     horLine.setAttribute("x2", c.x);
	     horLine.setAttribute("y2", midY);
	     horLine.setAttribute("stroke", "#888");
	     horLine.setAttribute("stroke-width", "2");
	     g.appendChild(horLine);

	     // вертикальная линия вниз к ребенку
	     const downLine = document.createElementNS(svg.namespaceURI, "line");
	     downLine.setAttribute("x1", c.x);
	     downLine.setAttribute("y1", midY);
	     downLine.setAttribute("x2", c.x);
	     downLine.setAttribute("y2", c.y - 25);
	     downLine.setAttribute("stroke", "#888");
	     downLine.setAttribute("stroke-width", "2");
	     g.appendChild(downLine);
	   });
	 });
	});
  // DRAW NODES
  nodes.forEach(n => {
    if (n.gender === "M") {
      const r = document.createElementNS(svg.namespaceURI, "rect");
      r.setAttribute("x", n.x - 25);
      r.setAttribute("y", n.y - 25);
      r.setAttribute("width", 50);
      r.setAttribute("height", 50);
      r.setAttribute("fill", "#4aa3ff");
      r.classList.add("node");
      r.onclick = e => openMenu(e, n);
      g.appendChild(r);
    } else {
      const c = document.createElementNS(svg.namespaceURI, "circle");
      c.setAttribute("cx", n.x);
      c.setAttribute("cy", n.y);
      c.setAttribute("r", 25);
      c.setAttribute("fill", "#ff77aa");
      c.classList.add("node");
      c.onclick = e => openMenu(e, n);
      g.appendChild(c);
    }
  });
}

/* =======================
   MENU
======================= */

function openMenu(e, node) {
  e.stopPropagation();
  selectedNode = node;

  const action = prompt(
    "1 — добавить родителя\n2 — добавить брата/сестру\n3 — добавить ребёнка\n\nВведите номер:"
  );

  if (action === "1") {
    const g = confirm("Мужчина? OK = Да, Cancel = Женщина");
    addParent(node, g ? "M" : "F");
  }
  if (action === "2") {
    const g = confirm("Мужчина? OK = Да, Cancel = Женщина");
    addSibling(node, g ? "M" : "F");
  }
  if (action === "3") {
    const g = confirm("Мужчина? OK = Да, Cancel = Женщина");
    addChild(node, g ? "M" : "F");
  }
}

/* =======================
   ZOOM + PAN
======================= */

svg.addEventListener("mousedown", e => {
  isPanning = true;
  startX = e.clientX;
  startY = e.clientY;
});

svg.addEventListener("mousemove", e => {
  if (!isPanning) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  offsetX += dx;
  offsetY += dy;
  startX = e.clientX;
  startY = e.clientY;
  g.setAttribute("transform", `translate(${offsetX},${offsetY}) scale(${scale})`);
});

svg.addEventListener("mouseup", e => {
  isPanning = false;
});
svg.addEventListener("mouseleave", e => {
  isPanning = false;
});

svg.addEventListener("wheel", e => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= delta;
  g.setAttribute("transform", `translate(${offsetX},${offsetY}) scale(${scale})`);
});
