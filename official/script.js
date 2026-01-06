// imports



// components initializ
const hour = document.getElementById("hour");
const minute = document.getElementById("minute");
const second = document.getElementById("second");

// open dialog
const open_creation = document.getElementById("create");
// close dialog
const close_creation = document.getElementById("close-dialog");


// create-Host event 
const host_dialog = document.getElementById("host-dialog");

// drop-down
const dropdown = document.querySelector(".dropdown");
const btn = dropdown.querySelector(".dropdown-btn");
const menu = dropdown.querySelector(".dropdown-menu");

let selectedEventType = null;


// -------------------------------functions-------------------------------

// nav lock
function updateClock() {
  const now = new Date();

  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  hour.style.transform =
    `rotate(${h * 30 + m / 2}deg)`;
  minute.style.transform =
    `rotate(${m * 6 + s / 10}deg)`;
  second.style.transform =
    `rotate(${s * 6}deg)`;
}
// interval
setInterval(updateClock, 1000);
updateClock();


// ------------------open event creation dialog------------------
open_creation.addEventListener("click", () => {
  host_dialog.classList.toggle("hidden");

});
// close dialoge
close_creation.addEventListener("click", () =>{

  host_dialog.classList.toggle("hidden");
});



// toggle dropdown
btn.addEventListener("click", () => {
  dropdown.classList.toggle("active");
});

// li HIT EVENT (event delegation)
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    selectedEventType = e.target.dataset.value;

    btn.textContent = e.target.textContent;
    dropdown.classList.remove("active");

    console.log("Event Type Selected:", selectedEventType);
  }
});

// close on outside click
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// host button logic
document.getElementById("host").addEventListener("click", () => {
  if (!selectedEventType) {
    alert("Please choose event type!");
    return;
  }

  const title = document.querySelectorAll("#eventTitle")[0].value;

  console.log({
    type: selectedEventType,
    title
  });

  alert("Event Hosted 🚀");
});


