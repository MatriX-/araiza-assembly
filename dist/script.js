document.documentElement.classList.add("js");

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

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty("--delay", `${entry.target.dataset.delay || 0}ms`);
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const quoteDialog = document.querySelector("#quote-dialog");
const quoteTriggers = document.querySelectorAll("[data-quote-trigger]");
const closeQuoteButtons = document.querySelectorAll("[data-close-quote]");

function openQuote(event) {
  event?.preventDefault();
  setMenu(false);
  if (!quoteDialog) return;
  if (typeof quoteDialog.showModal === "function" && !quoteDialog.open) quoteDialog.showModal();
  else quoteDialog.setAttribute("open", "");
  document.body.classList.add("dialog-open");
  window.setTimeout(() => quoteDialog.querySelector("input[name=\"name\"]")?.focus(), 80);
}

function closeQuote() {
  if (!quoteDialog) return;
  if (typeof quoteDialog.close === "function" && quoteDialog.open) quoteDialog.close();
  else quoteDialog.removeAttribute("open");
  document.body.classList.remove("dialog-open");
}

quoteTriggers.forEach((trigger) => trigger.addEventListener("click", openQuote));
closeQuoteButtons.forEach((button) => button.addEventListener("click", closeQuote));
quoteDialog?.addEventListener("cancel", () => document.body.classList.remove("dialog-open"));
quoteDialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));
quoteDialog?.addEventListener("click", (event) => {
  if (event.target === quoteDialog) closeQuote();
});

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
  formStatus.textContent = "Prototype only: nothing was sent. For now, call or text 910-527-4800.";
  quoteForm.reset();
  if (fileName) fileName.textContent = "No file chosen";
  window.setTimeout(() => {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Request my free quote <span aria-hidden="true">↗</span>';
    formStatus.textContent = "";
  }, 2600);
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
