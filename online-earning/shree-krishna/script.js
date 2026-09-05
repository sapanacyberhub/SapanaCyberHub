document.addEventListener('click', function () {
    const music = document.getElementById('bg-music');
    if (music.paused) {
        music.play().catch(error => console.log("Audio play prevented: ", error));
    }
}, { once: true }); // 'once: true' ensures it only triggers on the first click

console.log("Script loaded");

const kamalImage = document.querySelector(".kamal-image");


kamalImage.addEventListener("click", () => {
    const container = document.getElementById("bramcharya-container");
    container.classList.add("active");
    setInterval(changeBackground, 5000); // Change every 10 seconds

});


const godImages = [
    "assets/Gods/Goddess_Gayatri_seated_on_lotus_202607011144.jpeg",
    "assets/Gods/Krishna_hands_playing_flute_202607011136.jpeg",
    "assets/Gods/Krishna_painting_Radha's_feet_202607011137.jpeg",
    "assets/Gods/Krishna_playing_flute_for_Radha_202607011137.jpeg",
    "assets/Gods/Krishna_surprising_Radha_with_be..._202607011136.jpeg",
    "assets/Gods/Lord_Agni_standing_with_flames_202607011146.jpeg",
    "assets/Gods/Lord_Dhanvantari_holding_pot_202607011146.jpeg",
    "assets/Gods/Lord_Jagannath_Balabhadra_Subhadra_202607011140.jpeg",
    "assets/Gods/Lord_Krishna_playing_flute_forest_202606301507.jpeg",
    "assets/Gods/Lord_Kubera_seated_on_throne_202607011146.jpeg",
    "assets/Gods/Lord_Narasimha_appearing_from_pi..._202607011144.jpeg",
    "assets/Gods/Lord_Shani_standing_with_crow_202607011146.jpeg",
    "assets/Gods/Lord_Vayu_riding_deer_storm_202607011146.jpeg",
    "assets/Gods/Lord_Venkateswara_standing_adorned_202607011154.jpeg",
    "assets/Gods/Lord_Vishnu_Goddess_Lakshmi_cosm..._202607011137.jpeg",
    "assets/Gods/Lord_Vishnu_Goddess_Lakshmi_cosm..._202607011140.jpeg",
    "assets/Gods/Lord_Vishnu_Goddess_Lakshmi_looking_202607011140.jpeg",
    "assets/Gods/Lord_Vishnu_Goddess_Lakshmi_Vaik..._202607011137.jpeg",
    "assets/Gods/Lord_Vishnu_Goddess_Lakshmi_Vaik..._202607011140.jpeg",
    "assets/Gods/Lord_Vishnu_Lakshmi_golden_throne_202607011140.jpeg",
    "assets/Gods/Lord_Vitthal_Rukmini_standing_to..._202607011140.jpeg",
    "assets/Gods/Radha_feeding_Krishna_butter_202607011137.jpeg",
    "assets/Gods/Radha_Krishna_atop_hill_Vrindavan_202607011137.jpeg",
    "assets/Gods/Radha_Krishna_by_Yamuna_river_202607011137.jpeg",
    "assets/Gods/Radha_Krishna_exchanging_flower_..._202607011137.jpeg",
    "assets/Gods/Radha_Krishna_looking_into_eyes_202607011137.jpeg",
    "assets/Gods/Radha_Krishna_on_wooden_swing_202607011137.jpeg",
    "assets/Gods/Radha_Krishna_playing_with_peacock_202607011137.jpeg",
    "assets/Gods/Radha_Krishna_under_lotus_leaf_202607011136.jpeg",
    "assets/Gods/Radha_Krishna_walking_hand-in-ha..._202607011137.jpeg",
    "assets/Gods/Vishnu_and_Lakshmi_in_garden_202607011140.jpeg"
];

const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");

let current = 0;
let showingFirst = true;

function changeBackground() {

    current = (current + 1) % godImages.length;

    const nextImg = showingFirst ? bg2 : bg1;
    const currentImg = showingFirst ? bg1 : bg2;

    nextImg.src = godImages[current];

    nextImg.onload = () => {
        nextImg.classList.add("active");
        currentImg.classList.remove("active");
        showingFirst = !showingFirst;
    };
}
