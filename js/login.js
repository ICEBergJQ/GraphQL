import { renderProfile } from './profile.js';
import { displayToast } from "./utils.js";
const container = document.getElementById('Maincontainer');

export function renderLoginSec() {
    container.innerHTML = `
    <section id="login-section">
        <div class="wrapper">
            <div class="form-box" id="login">
                <h2>Login</h2>
                <input type="text" id="username" placeholder="Enter username or email">
                <input type="password" id="password" placeholder="Enter password">
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
            displayToast("red", 'invalid credentials!')
        }
    });
}