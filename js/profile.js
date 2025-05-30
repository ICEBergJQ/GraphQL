import { displayToast } from "./utils.js";
import { deduplicateSkills } from "./utils.js";
import { addProjects } from "./utils.js";
import { convertXP } from "./utils.js";
import { showTooltip } from "./utils.js";

const container = document.getElementById("Maincontainer");

export function renderProfile() {
  container.innerHTML = `
    <div id="navbar">
        <h1>01QL</h1>
        <div id="sec">
            <h3 id="user">loading...</h3>
            <button id="logoutbtn">Logout</button>
        </div>
    </div>
    <div class="profile-container">
        <div class="welcome">
            <h1>Welcome Back, <span id="username"></span></h1>
        </div>
        <div class="container">
            <h2>User Info:</h2>
            <p id="fullname">Loading...</p>
            <p id="email">Loading...</p>
        </div>

        <div class="container" id="projects">
            <h2>Projects History:</h2>
        </div>
        <div class="container" id="RXP">
            <div class="container" id="xp-box">
                <h2>Total XP</h2>
                <p id="xp-count">Loading...</p>
            </div>
            <div class="container" id="box4">
                <h2>Audit Ratio</h2>
                <p id="audit-ratio">Fetching...</p>
            </div>
        </div>
        <div class="container" id="xpc">
        <div class="container" id="box2">
            <h2>XP Graph</h2>
            <div id="xp-graph"></div>
        </div>
        </div>
             <div class="container" id="box5">
                <h2>Top Skills</h2>
                <div id="skills-chart"></div>
            </div>
        </div>
    `;
  fetchUserData();
  addLogoutevent();
}

async function fetchUserData() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.reload();
    return;
  }

  const query = {
    query: `{
            user {
                login
                firstName
                lastName
                auditRatio
                email
                transactions(
                    where: { type: { _like: "skill_%" } }
                    order_by: { amount: desc }
                ) {
                    type
                    amount
                }
            }
            transaction(
                where: { _and: [{ type: { _eq: "xp" } }, { eventId: { _eq: 41 } }] }
            ) {
                amount
                createdAt
                object { name }
            }
            Project: transaction(
                    where: {type: {_eq: "xp"}, eventId: {_eq: 41}, object: {type: {_eq: "project"}}}
                    order_by: {createdAt: desc}
                    limit: 5
                  ) {
                    amount
                    object {
                      name
                      
                    }
                  }
        }`,
  };

  try {
    const response = await fetch(
      "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      }
    );
    console.log(token);
    const data = await response.json();
    if (!data || !data.data) throw new Error("Failed to fetch user data");

    // Display user details
    const user = data.data.user[0]; // Assuming there's only one user
    const project = data.data.Project;

    if (user) {
      addProjects(project);
      document.getElementById("user").textContent = user.login;
      document.getElementById("username").textContent = user.login + "!";
      document.getElementById(
        "fullname"
      ).textContent = `${user.firstName} ${user.lastName}`;
      document.getElementById("email").textContent = `${user.email}`;
      document.getElementById("audit-ratio").textContent = user.auditRatio
        ? user.auditRatio.toFixed(1)
        : "N/A";
    }

    // Render XP and Level
    renderXp(data);
    renderXPGraph(data.data.transaction); // Pass XP transactions to graph
    renderSkillsChart(user.transactions); // Pass skill transactions to bar chart
  } catch (error) {
    displayToast("red","there was an error loading your data logout and try again!");
    setTimeout(() => {
      logout();
    }, 2000);
  }
}

function renderXp(data) {
  let xp = data.data.transaction.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  document.getElementById("xp-count").textContent = convertXP(xp);
}

function renderXPGraph(transactions) {
    if (!transactions.length) return;
  
    let cumulativeXP = 0;
    const sortedData = transactions.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  
    const dataPoints = sortedData.map((transaction) => {
      cumulativeXP += transaction.amount;
      return { date: new Date(transaction.createdAt), xp: cumulativeXP };
    });
  
    const width = 400;
    const height = 200;
    const margin = 40;
  
    const startDate = dataPoints[0].date;
    const endDate = dataPoints[dataPoints.length - 1].date;
    const maxXP = dataPoints[dataPoints.length - 1].xp;
  
    const scaleX = (date) =>
      margin + ((date - startDate) / (endDate - startDate)) * (width - margin * 2);
    const scaleY = (xp) =>
      height - margin - (xp / maxXP) * (height - margin * 2);
  
    const pathData = dataPoints
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${scaleX(point.date)} ${scaleY(point.xp)}`
      )
      .join(" ");
  
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "103%";
  
    // Draw axes
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", margin);
    xAxis.setAttribute("y1", height - margin);
    xAxis.setAttribute("x2", width - margin);
    xAxis.setAttribute("y2", height - margin);
    xAxis.setAttribute("stroke", "#999");
    svg.appendChild(xAxis);
  
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", margin);
    yAxis.setAttribute("y1", margin);
    yAxis.setAttribute("x2", margin);
    yAxis.setAttribute("y2", height - margin);
    yAxis.setAttribute("stroke", "#999");
    svg.appendChild(yAxis);
  
    // Add axis labels
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.textContent = "Time";
    xLabel.setAttribute("x", width / 2);
    xLabel.setAttribute("y", height - 5);
    xLabel.setAttribute("text-anchor", "middle");
    xLabel.setAttribute("font-size", "12");
    xLabel.setAttribute("fill", "#444");
    svg.appendChild(xLabel);
  
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.textContent = "XP";
    yLabel.setAttribute("x", 10);
    yLabel.setAttribute("y", height / 2);
    yLabel.setAttribute("transform", `rotate(-90 10,${height / 2})`);
    yLabel.setAttribute("text-anchor", "middle");
    yLabel.setAttribute("font-size", "12");
    yLabel.setAttribute("fill", "#444");
    svg.appendChild(yLabel);
  
    // Graph path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "red");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
  
    // Data points
    dataPoints.forEach((point) => {
      const cx = scaleX(point.date);
      const cy = scaleY(point.xp);
  
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", 3);
      circle.setAttribute("fill", "black");
      circle.setAttribute("stroke", "white");
      circle.setAttribute("stroke-width", "1");
  
      // Tooltip
      circle.addEventListener("mouseenter", (e) => {
        showTooltip(e,`XP: ${convertXP(point.xp)}<br>${point.date.toLocaleDateString()}`)
      });
  
      svg.appendChild(circle);
    });
  
    document.getElementById("xp-graph").innerHTML = "";
    document.getElementById("xp-graph").appendChild(svg);
  }
  

function renderSkillsChart(transactions) {
  if (!transactions.length) return;

  const topSkills = deduplicateSkills(transactions).slice(0, 6);

  const svgWidth = 300;
  const svgHeight = 30 * topSkills.length + 20;
  const barHeight = 20;
  const barSpacing = 10;
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", svgHeight);
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  topSkills.forEach((skill, index) => {
    const y = index * (barHeight + barSpacing) + 10;

    // Background bar (optional)
    const bgBar = document.createElementNS(svgNS, "rect");
    bgBar.setAttribute("x", 100);
    bgBar.setAttribute("y", y);
    bgBar.setAttribute("width", svgWidth - 120);
    bgBar.setAttribute("height", barHeight);
    bgBar.setAttribute("fill", "#eee");
    svg.appendChild(bgBar);

    // Foreground (filled) bar
    const fgBar = document.createElementNS(svgNS, "rect");
    fgBar.setAttribute("x", 100);
    fgBar.setAttribute("y", y);
    fgBar.setAttribute("width", ((svgWidth - 120) * skill.amount) / 100);
    fgBar.setAttribute("height", barHeight);
    fgBar.setAttribute("fill", "#3498db");
    fgBar.style.cursor = "pointer";
    fgBar.addEventListener("mouseover", (e) =>
      showTooltip(e, `${skill.type.replace("skill_", "")}: ${skill.amount}%`)
    );
    svg.appendChild(fgBar);

    // Skill label on the left
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", 95);
    label.setAttribute("y", y + barHeight / 2);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("alignment-baseline", "middle");
    label.setAttribute("font-size", "12px");
    label.setAttribute("fill", "#444");
    label.textContent = skill.type.replace("skill_", "");
    svg.appendChild(label);

    // skill.amount label on the right of bar
    const percentLabel = document.createElementNS(svgNS, "text");
    percentLabel.setAttribute("x", 100 + ((svgWidth - 120) * skill.amount) / 100 + 5);
    percentLabel.setAttribute("y", y + barHeight / 2);
    percentLabel.setAttribute("alignment-baseline", "middle");
    percentLabel.setAttribute("font-size", "12px");
    percentLabel.setAttribute("fill", "#333");
    percentLabel.textContent = `${skill.amount}%`;
    svg.appendChild(percentLabel);
  });

  const container = document.getElementById("skills-chart");
  container.innerHTML = "";
  container.appendChild(svg);
}

function addLogoutevent() {
  const button = document.getElementById("logoutbtn");

  button.addEventListener("click", () => {
    logout();
  });
}

function logout() {
  localStorage.removeItem("jwt");
  location.reload();
}
