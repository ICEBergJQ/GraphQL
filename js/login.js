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

    window.addEventListener('DOMContentLoaded', () => {
        addLoginEvent();
      });
}

function addLoginEvent() {
    const button = document.getElementById('loginbtn')


    button.addEventListener('click', login);
    document.body.addEventListener('keyup', function (e) {
        if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
          login();
          document.activeElement.blur();
        }
    });
}

let isLoggingIn = false;

async function login() {
    if (isLoggingIn) return;
    isLoggingIn = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin/', {
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
            displayToast("red", 'Invalid credentials!');
        }
    } catch (error) {
        console.error('Login error:', error);
        displayToast("red", 'An error occurred. Please try again.');
    } finally {
        isLoggingIn = false;
    }
}