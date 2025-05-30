const toast = document.querySelector(".toast");

export const displayToast = (color, txt) => {
  toast.textContent = txt;
  toast.style.top = "40px";
  toast.style.background = color;
  toast.style.animation = "bounce 0.5s ease-in-out";
  hideToast(1500);
};

let timer;
const hideToast = (mill) => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    toast.textContent = '';
    toast.style.animation = "none";
    toast.style.top = "-105px";
  }, mill);
};

export function deduplicateSkills(skills) {
    const map = new Map();

    for (const skill of skills) {
        const existing = map.get(skill.type);
        if (!existing || skill.amount > existing.amount) {
            map.set(skill.type, skill);
        }
    }

    return Array.from(map.values());
}

export function addProjects(projects) {
    let prjdiv = document.getElementById('projects');
    
    projects.forEach(pr=> {
      if (pr.amount >= 0) {
        document.getElementById('projects').innerHTML += `<div class="prj"><p>${pr.object.name}</p><p style="color:green">${convertXP(pr.amount)}</p></div>`
      } else {
        document.getElementById('projects').innerHTML += `<div class="prj"><p>${pr.object.name}</p><p style="color:red">${convertXP(pr.amount)}</p></div>`
      }
    });
}

export function convertXP(bytes) {
  if (bytes < 0) {
    bytes = bytes * -1
    if (bytes < 1000) return `${bytes * -1} B`;
    if (bytes < 1000 * 1000) return `${Math.ceil(bytes / 1000) * -1} KB`;
    return `${bytes / (1000 * 1000) * -1} MB`;
  } else {
    if (bytes < 1000) return `${bytes} B`;
    if (bytes < 1000 * 1000) return `${Math.ceil(bytes / 1000)} KB`;
    return `${bytes / (1000 * 1000)} MB`;
  }
}

export function showTooltip(e, text) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.left = `${e.pageX + 10}px`;
  tooltip.style.top = `${e.pageY - 10}px`;
  tooltip.style.background = "rgba(0,0,0,0.75)";
  tooltip.style.color = "white";
  tooltip.style.padding = "4px 6px";
  tooltip.style.fontSize = "12px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.pointerEvents = "none";
  tooltip.innerHTML = text;

  document.body.appendChild(tooltip);

  function remove() {
    tooltip.remove();
    e.target.removeEventListener("mouseleave", remove);
  }

  e.target.addEventListener("mouseleave", remove);
}
