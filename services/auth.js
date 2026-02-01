    import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();
const userPanel = document.getElementById("userPanel");

onAuthStateChanged(auth, user => {
  if (!user) {
    userPanel.innerHTML = `<button onclick="login()">Login</button>`;
  } else {
    userPanel.innerHTML = `
      <span>${user.displayName || user.email}</span>
      <button onclick="logout()">Logout</button>
    `;
    

    
  }

});

window.login = () => signInWithPopup(auth, new GoogleAuthProvider());
window.logout = () => signOut(auth);
