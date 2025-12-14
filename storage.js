function saveTree(){
  const data = nodes.map(n=>({
    name:n.name,
    gender:n.gender,
    level:n.level,
    parent:n.parent?.id
  }));
  const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="tree.json";
  a.click();
}

function loadTree(e){
  const f=e.target.files[0];
  f.text().then(t=>{
    nodes=[];levels={};tree.innerHTML="";lines.innerHTML="";
    const data=JSON.parse(t);
    data.forEach(d=>createNode(d.name,d.gender,d.level,null));
    data.forEach((d,i)=>{
      if(d.parent!==undefined) nodes[i].parent=nodes[d.parent];
    });
    layout();
  });
}

function addRoot(){
  const name=prompt("Имя:");
  const g=prompt("Пол (M/F):","M");
  createNode(name,g,0,null);
}

