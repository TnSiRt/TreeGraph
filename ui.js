let menu = null;

document.addEventListener("DOMContentLoaded", () => {
  menu = document.getElementById("contextMenu");

  document.body.addEventListener("click", () => {
    if (menu) menu.style.display = "none";
  });
});

function showContextMenu(x, y) {
  if (!menu) return;
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

// ====== ДЕЙСТВИЯ ======

function addRoot() {
  const name = prompt("Имя:");
  const gender = prompt("Пол (M/F):", "M");
  if (!name) return;
  createNode(name, gender, 0);
}

function addParents() {
  if (!selectedNode) return;

  const motherName = prompt("Имя матери:");
  const fatherName = prompt("Имя отца:");
  if (!motherName || !fatherName) return;

  const mother = createNode(motherName, "F", selectedNode.level + 1);
  const father = createNode(fatherName, "M", selectedNode.level + 1);

  const fam = createFamily(mother, father);
  fam.children.push(selectedNode);
  selectedNode.familyAsChild = fam;

  mother.familyAsParent = fam;
  father.familyAsParent = fam;

  layout();
}

function addSibling() {
  if (!selectedNode || !selectedNode.familyAsChild) return;

  const name = prompt("Имя:");
  const gender = prompt("Пол (M/F):", "M");
  if (!name) return;

  const sib = createNode(name, gender, selectedNode.level);
  sib.familyAsChild = selectedNode.familyAsChild;
  selectedNode.familyAsChild.children.push(sib);

  layout();
}

