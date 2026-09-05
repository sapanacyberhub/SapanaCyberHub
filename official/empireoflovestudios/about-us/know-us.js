document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".main");
  const indicatorNav = document.querySelector(".scroll-indicator");
  const sections = document.querySelectorAll(".snap-section");

  if (!scrollContainer || !indicatorNav || sections.length === 0) return;

  // 1. DYNAMICALLY GENERATE AND BUILD INDICATOR DOTS
  sections.forEach((section, index) => {
    section.id = `sec-${index}`;

    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.setAttribute("data-target", index);

    dot.addEventListener("click", () => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    indicatorNav.appendChild(dot);
  });

  const dots = document.querySelectorAll(".scroll-indicator .dot");

  // 2. AUTOMATIC OBSERVER TIMELINE SYNCHRONIZATION
  const observerOptions = {
    root: scrollContainer,
    threshold: 0.5 // Triggers when 50% of the section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // FIXED: Explicitly convert the string ID fragment into a Number index
        const index = Number(entry.target.id.replace("sec-", ""));

        dots.forEach(dot => dot.classList.remove("active"));

        if (dots[index]) {
          dots[index].classList.add("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
});
const qr = new QRCodeStyling({
  width: 100,
  height: 100,

  type: "canvas",

  data: "https://empireoflovestudios.com",

  margin: 0,

  qrOptions: {
    errorCorrectionLevel: "H"
  },

  

  dotsOptions: {
    color: "#111111",
    type: "square"
  },

  backgroundOptions: {
    color: "#ffffff"
  },

  cornersSquareOptions: {
    color: "#111111",
    type: "square"
  },

  cornersDotOptions: {
    color: "#ff0000",
    type: "square"
  }
});

qr.append(
  document.getElementById("eolQR")
);
