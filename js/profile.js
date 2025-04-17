const container = document.getElementById('Maincontainer');

export function renderProfile() {
    container.innerHTML = `
    <button class="logout-btn">Logout</button>
    <div class="profile-container">
    <h1>Welcome, <span id="username"></span></h1>
        <h3 id="fullname"></h3>

        <div class="stats-container">
            <div class="stat-box" id="xp-box">
                <h2>XP</h2>
                <p id="xp-count">Loading...</p>
            </div>
            <div class="stat-box" id="box2">
                <h2>Graph</h2>
                <div id="xp-graph"></div> <!-- Graph container -->
            </div>
             <div class="stat-box" id="box5">
                <h2>Skills</h2>
                <div id="skills-chart"></div> <!-- Bar chart container -->
            </div>
            <div class="stat-box" id="box4">
                <h2>Audit Ratio</h2>
                <p id="audit-ratio">Fetching...</p>
            </div>
        </div>
    </div>
    `;
    fetchUserData();
}

async function fetchUserData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        window.location.reload();
        return;
    }

    const query = {
        query: `{
            user {
                firstName
                lastName
                auditRatio
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
        }`
    };

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });

        const data = await response.json();
        if (!data || !data.data) throw new Error('Failed to fetch user data');

        // Display user details
        const user = data.data.user[0]; // Assuming there's only one user
        if (user) {
            document.getElementById('username').textContent = user.firstName;
            document.getElementById('fullname').textContent = `${user.firstName} ${user.lastName}`;
            document.getElementById('audit-ratio').textContent = user.auditRatio ? user.auditRatio.toFixed(2) : "N/A";
        }

        // Render XP and Level
        renderXp(data);
        renderXPGraph(data.data.transaction); // Pass XP transactions to graph
        renderSkillsChart(user.transactions); // Pass skill transactions to bar chart

    } catch (error) {
        console.error(error);
        alert('Error fetching data');
    }
}

function renderXp(data) {
    let xp = data.data.transaction.reduce((acc, transaction) => acc + transaction.amount, 0);
    xp = Math.ceil(xp / 1000); // Convert XP to KB
    document.getElementById('xp-count').textContent = `${xp} KB`;
}

function renderXPGraph(transactions) {
    if (!transactions.length) return;

    let cumulativeXP = 0;
    const sortedData = transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const dataPoints = sortedData.map(transaction => {
        cumulativeXP += transaction.amount;
        return { date: new Date(transaction.createdAt), xp: cumulativeXP };
    });

    const width = 400, height = 200;
    const startDate = dataPoints[0].date, endDate = dataPoints[dataPoints.length - 1].date;
    const maxXP = dataPoints[dataPoints.length - 1].xp;

    const scaleX = date => ((date - startDate) / (endDate - startDate)) * width;
    const scaleY = xp => height - (xp / maxXP) * height;

    const pathData = dataPoints.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${scaleX(point.date)} ${scaleY(point.xp)}`
    ).join(' ');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'red');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    document.getElementById('xp-graph').innerHTML = '';
    document.getElementById('xp-graph').appendChild(svg);
}
function renderSkillsChart(transactions) {
    if (!transactions.length) return;

    const topSkills = transactions.sort((a, b) => b.amount - a.amount).slice(1, 5);
    
    // Find the maximum XP value for scaling
    const maxSkillXP = Math.max(...transactions.map(t => t.amount));

    const width = 250, height = 170, barWidth = 40;
    const scaleY = xp => height - (xp / maxSkillXP) * height;

    // Create SVG container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height + 20}`);

    topSkills.forEach((transaction, index) => {
        const barHeight = height - scaleY(transaction.amount);
        
        // Create bar
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', index * (barWidth + 15));
        bar.setAttribute('y', scaleY(transaction.amount));
        bar.setAttribute('width', barWidth);
        bar.setAttribute('height', barHeight);
        bar.setAttribute('fill', 'red');
        bar.style.cursor = 'pointer';

        // Tooltip on hover
        bar.addEventListener('mouseover', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 10}px`;
            tooltip.style.padding = '5px';
            tooltip.style.borderRadius = '3px';
            tooltip.style.background = 'black';
            tooltip.style.color = 'white';
            tooltip.style.fontSize = '12px';
            tooltip.innerHTML = `${transaction.type.replace('skill_', '')} (${transaction.amount} %)`;
            document.body.appendChild(tooltip);

            bar.addEventListener('mouseout', () => tooltip.remove());
        });

        svg.appendChild(bar);
    });

    document.getElementById('skills-chart').innerHTML = '';
    document.getElementById('skills-chart').appendChild(svg);
}


