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
            await checkIfAuthorized(data)
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

async function checkIfAuthorized(token) {
  const query = `
    {
      user {
        campus
      }
    }`;
  
  try {
    const response = await fetch(
      "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: {}
        }),
      }
    );
    
    const data = await response.json();
    console.log(data);
    
    if (!data || !data.data) throw new Error("Failed to fetch user data");
    
    const user = data.data.user[0];
    const campus = user.campus;
    
    if (campus === null) throw new Error("unauthorized");
    
    localStorage.setItem('jwt', token);
    renderProfile();
  } catch (error) {
    displayToast("red", error);
  }
}