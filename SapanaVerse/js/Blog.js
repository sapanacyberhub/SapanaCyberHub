// -----------------------------------------------------
// ✅ Import Firebase modules
// -----------------------------------------------------
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";


// -----------------------------------------------------
// ✅ Firebase Config
// -----------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyBNwCmtWja2xwxhWrU9Ejfz0ggGd796mEI",
    authDomain: "my-application-31862.firebaseapp.com",
    projectId: "my-application-31862",
    storageBucket: "my-application-31862.appspot.com",
    messagingSenderId: "409640627398",
    appId: "1:409640627398:web:e2d1782c77e2ab8d527bc7",
};


// -----------------------------------------------------
// ✅ Initialize Firebase
// -----------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// -----------------------------------------------------
// 🔹 UI elements
// -----------------------------------------------------
const feedContainer = document.getElementById("feedContainer");
const createModal = document.getElementById("createModal");
const form = document.getElementById("createBlogForm");
const coverInput = document.getElementById("coverInput");
const coverPreview = document.getElementById("coverPreview");
const noPreview = document.getElementById("noPreview");


// -----------------------------------------------------
// 🔹 Open & Close Modal
// -----------------------------------------------------
document.querySelector("[data-open-create]").onclick = () =>
    createModal.classList.add("show");

document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.onclick = () => createModal.classList.remove("show");
});


// -----------------------------------------------------
// 🔹 Cover Image Preview
// -----------------------------------------------------
coverInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];

    if (!file) {
        coverPreview.classList.add("hidden");
        noPreview.classList.remove("hidden");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        coverPreview.src = reader.result;
        coverPreview.classList.remove("hidden");
        noPreview.classList.add("hidden");
    };
    reader.readAsDataURL(file);
});


// -----------------------------------------------------
// 🔹 Handle User Auth State
// -----------------------------------------------------
onAuthStateChanged(auth, (user) => {
    const userDisplay = document.querySelector(".User-Name");

    if (user) {
        userDisplay.textContent = user.displayName || user.email.split("@")[0];
    } else {
        userDisplay.textContent = "Guest";
    }

    loadBlogs(); // load blogs for both guest + logged in
});


// -----------------------------------------------------
// 🔹 Fetch Blogs from Firestore
// -----------------------------------------------------
async function loadBlogs() {
    feedContainer.innerHTML =
        "<p style='text-align:center;color:#bbb;'>Loading blogs...</p>";

    const q = query(
        collection(db, "SapanaCyberHub", "Blogs", "Blog-official-public"),
        orderBy("timestamp", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
        feedContainer.innerHTML = `
    <article class="Blog-Card">
      <div class="Blog-Body">
        <h2>No blogs yet</h2>
        <p>Be the first to post 💖</p>
        <div class="CreateBlog" id="CreateBtn">Create</div>
      </div>
    </article>
  `;
        document.getElementById("CreateBtn").addEventListener("click", () => {
            createModal.classList.add("show");
        });


        return;
    }

    feedContainer.innerHTML = "";

    snap.forEach(doc => {
        const b = doc.data();

        const html = `
      <article class="Blog-Card">
        <header class="Blog-Header">
          <img src="${b.avatar || '/Assets/SignUpBg.png'}" class="Author-Img">
          <div class="Author-Info">
            <div class="Author-Name">${b.author}</div>
            <div class="Post-Time">${b.timestamp?.seconds
                ? new Date(b.timestamp.seconds * 1000).toLocaleString()
                : ""
            }</div>
          </div>
        </header>

        <div class="Blog-Body">
          <h2 class="Blog-Title">${b.title}</h2>
          <p class="Blog-Desc">${b.desc}</p>
          ${b.cover ? `<img src="${b.cover}" class="Blog-Image">` : ""}
        </div>

        <footer class="Blog-Footer">
          <button class="Action-Btn ghost">❤️ ${b.likes || 0}</button>
          <button class="Action-Btn">💬 ${b.comments || 0}</button>
        </footer>
      </article>
    `;
        feedContainer.insertAdjacentHTML("beforeend", html);
    });
}


// -----------------------------------------------------
// 🔹 Submit / Publish Blog
// -----------------------------------------------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    // 🔒 NEW RULE: only logged-in can write
    if (!user) {
        alert("⚠️ Please log in to publish a blog.");
        return (window.location.href = "../UserRegistration/login.html");
    }

    const title = form.title.value.trim();
    const category = form.category.value.trim();
    const desc = form.desc.value.trim();
    const file = coverInput.files[0];

    if (!title || !category || !desc) {
        return alert("Please fill all fields.");
    }

    let imageUrl = "";

    // -----------------------------------------------------
    // 🌆 Upload Image (only logged-in users)
    // -----------------------------------------------------
    if (file) {
        const storageRef = ref(storage, `blog_covers/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        const progressContainer = document.getElementById("uploadProgress");
        const progressBar = document.getElementById("progressBar");
        const progressText = document.getElementById("progressText");

        progressContainer.style.display = "flex";

        await new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const percent =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = percent + "%";
                    progressText.textContent = Math.floor(percent) + "%";
                },
                reject,
                async () => {
                    imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve();
                }
            );
        });

        setTimeout(() => {
            progressContainer.style.display = "none";
            progressBar.style.width = "0%";
            progressText.textContent = "0%";
        }, 1200);
    }


    // -----------------------------------------------------
    // 🔥 Save Blog in Firestore (write only if logged in)
    // -----------------------------------------------------
    await addDoc(
        collection(db, "SapanaCyberHub", "Blogs", "Blog-official-public"),
        {
            author: user.displayName || user.email.split("@")[0],
            authorUid: user.uid,
            avatar: user.photoURL || "/Assets/SignUpBg.png",
            title,
            category,
            desc,
            cover: imageUrl,
            likes: 0,
            comments: 0,
            timestamp: serverTimestamp(),
        }
    );

    alert("🎉 Blog published successfully!");

    form.reset();
    coverPreview.classList.add("hidden");
    noPreview.classList.remove("hidden");
    createModal.classList.remove("show");

    loadBlogs();
});


// -----------------------------------------------------
// 🔹 Home Button Navigation
// -----------------------------------------------------
document.querySelector(".Home").onclick = () =>
    (window.location.href = "/index.html");
