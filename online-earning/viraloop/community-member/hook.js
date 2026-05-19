import { 
    db, 
    auth, 
    collection, 
    addDoc, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    deleteUser,
    createViraLoopMember,
    getMemberProfile
} from './community-legal/error.js';

// DOM Selectors
const formContainer = document.querySelector('.form');
const content = document.querySelector('.content');
const nameInput = document.querySelector(".name");
const emailInput = document.querySelector(".email");
const phoneInput = document.querySelector(".phone");
const passwordInput = document.querySelector(".password");
const socialMediaInput = document.querySelector(".social-media");
const statusText = document.getElementById('status-text');
const progressOverlay = document.getElementById('progress-overlay');
const progressTrack = document.getElementById('progress-track');
const closeBtn = document.getElementById('close-overlay');
const joinNowButton = document.querySelector(".join-now-button");

let isLoginMode = false;

// UI Management
function updateOverlay(message, isError = false) {
    progressOverlay.style.display = 'flex';
    statusText.textContent = message;
    if (isError) {
        statusText.classList.add('error-msg');
        progressTrack.style.display = "none";
        closeBtn.style.display = "inline-block";
    } else {
        statusText.classList.remove('error-msg');
        progressTrack.style.display = "block";
        closeBtn.style.display = "none";
    }
}

// Logic to finalize profile or cleanup on failure
async function finalizeProfile(userData) {
    try {
        updateOverlay("Finalizing your profile...");
        await createViraLoopMember(userData);
        window.location.href = '/online-earning/viraloop/';
    } catch (error) {
        // If profile creation fails, delete the Auth user so they can try again
        if (auth.currentUser) {
            await deleteUser(auth.currentUser);
        }
        updateOverlay(`Profile Error: ${error.message}. User deleted for retry.`, true);
    }
}

joinNowButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        formContainer.classList.add('shake');
        setTimeout(() => formContainer.classList.remove('shake'), 500);
        return;
    }

    updateOverlay("Connecting to ViraLoop...");

    try {
        if (isLoginMode) {
            // LOGIN FLOW
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/online-earning/viraloop/';
        } else {
            // REGISTRATION FLOW
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const socialMedia = socialMediaInput.value.trim();

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                await finalizeProfile({ name, email, phone, socialMedia });
            } catch (authError) {
                // Handle existing user with missing profile
                if (authError.code === 'auth/email-already-in-use') {
                    updateOverlay("Checking account status...");
                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        const profile = await getViraLoopMemberDetails({});
                        
                        if (profile && profile.data) {
                            window.location.href = '/online-earning/viraloop/community-member/';
                        } else {
                            // Auth exists but profile is missing, fix it
                            await createViraLoopMember({ name, email, phone, socialMedia });
                            window.location.href = '/online-earning/viraloop/';
                        }
                    } catch (verifyError) {
                        updateOverlay("Email is taken. Please use your correct password or a new email.", true);
                    }
                } else {
                    updateOverlay(`Registration failed: ${authError.message}`, true);
                }
            }
        }
    } catch (error) {
        updateOverlay(`Error: ${error.message}`, true);
    }
});

// Re-initialize toggle listeners
function updateFormNote() {
    const formNote = document.querySelector('.form-note-lgn');
    if (isLoginMode) {
        formNote.innerHTML = 'Don\'t have an account? <a href="#">Be a member❤️</a>.';
    } else {
        formNote.innerHTML = 'Already a member? <a href="#">Log in here</a>.';
    }
    formNote.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        [nameInput, phoneInput, socialMediaInput].forEach(i => i.style.display = isLoginMode ? 'none' : 'block');
        updateFormNote();
        joinNowButton.textContent = isLoginMode ? 'Log In' : 'Join Now';
    });
}

updateFormNote();
closeBtn.addEventListener('click', () => progressOverlay.style.display = 'none');