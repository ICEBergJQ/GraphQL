import { renderProfile } from './profile.js';
const container = document.getElementById('Maincontainer');

export function renderLoginSec() {
    container.innerHTML = `
    <section id="login-section">
        <div class="wrapper">
            <div class="form-box" id="login">
                <h2>Login</h2>
                <input type="text" id="username" placeholder="Enter username or email">
                <input type="text" id="password" placeholder="Enter password">
                <button class="btn" id="loginbtn" type="submit" >Login</button>
            </div>
        </div>
    </section>
    `;
    addLoginEvent();
}

function addLoginEvent() {
    const button = document.getElementById('loginbtn')

    button.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwt', data);
            renderProfile();
        } else {
            const errorData = await response.json();
            const errorMsg = document.createElement('div')
            errorMsg.className = 'error'
            errorMsg.textContent = errorData.error || 'Invalid credentials';
            document.body.appendChild(errorMsg);
            setTimeout(() => {
                errorMsg.remove();
            },3000);
        }
    });
}