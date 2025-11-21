let lastScroll = 0;
const navbar = document.querySelector(".navbar");

// scroll distance needed before navbar can hide
const hideOffset = 180;

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    // Only start hiding after scrolling enough
    if (currentScroll > hideOffset) {

        if (currentScroll > lastScroll) {
            // Scrolling DOWN → hide navbar
            navbar.classList.add("hide");
        } else {
            // Scrolling UP → show navbar
            navbar.classList.remove("hide");
        }

    } else {
        // At top → never hide navbar
        navbar.classList.remove("hide");
    }

    lastScroll = currentScroll;
});
