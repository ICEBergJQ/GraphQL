import { renderLoginSec } from './login.js';
import { renderProfile } from './profile.js';

function main() {
    const token = localStorage.getItem('jwt');

    if (token) {
        renderProfile();
    } else {
        renderLoginSec();
    }
}

main();