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
        document.getElementById('projects').innerHTML += `<p>${pr.object.name}</p>`
    });
}

export function convertXP(bytes) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1000 * 1000) return `${Math.ceil(bytes / 1000)} KB`;
  return `${Math.ceil(bytes / (1000 * 1000))} MB`;
}
