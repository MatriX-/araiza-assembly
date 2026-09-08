const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.hidden = !open;
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.style.setProperty("--delay", `${entry.target.dataset.delay || 0}ms`);
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const contactSection = document.querySelector("#contact");
const stickyActions = document.querySelector(".mobile-sticky-actions");
if (contactSection && stickyActions) {
  const contactObserver = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle("quote-in-view", entry.isIntersecting);
  }, { threshold: 0.18 });
  contactObserver.observe(contactSection);
}

const fileInput = document.querySelector("#photo-upload");
const fileName = document.querySelector("#file-name");
fileInput?.addEventListener("change", () => {
  fileName.textContent = fileInput.files?.[0]?.name || "No file chosen";
});

const quoteForm = document.querySelector("#quote-form");
const formStatus = document.querySelector("#form-status");
quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = quoteForm.querySelector(".form-submit");
  submitButton.disabled = true;
  submitButton.textContent = "Request captured";
  formStatus.textContent = "Prototype only: nothing was sent. In production, this request will connect to email or a form service. For now, call or text 910-527-4800.";
  quoteForm.reset();
  if (fileName) fileName.textContent = "No file chosen";
  window.setTimeout(() => {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Request my free quote <span aria-hidden="true">↗</span>';
  }, 2600);
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
