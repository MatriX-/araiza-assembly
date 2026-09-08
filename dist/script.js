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
const quoteForm = document.querySelector("#quote-form");
const quoteSteps = quoteDialog ? [...quoteDialog.querySelectorAll("[data-quote-step]")] : [];
const contactMethods = quoteDialog ? [...quoteDialog.querySelectorAll('input[name="contact-method"]')] : [];
const contactValueField = document.querySelector("#contact-value-field");
const contactValueLabel = document.querySelector("#contact-value-label");
const contactValue = document.querySelector("#contact-value");
const contactHelper = document.querySelector("#contact-helper");
const itemList = document.querySelector("#item-list");
const initialItemCard = itemList?.querySelector("[data-item-card]")?.cloneNode(true);
const formStatus = document.querySelector("#form-status");
const nextStepButton = quoteDialog?.querySelector("[data-next-step]");
const previousStepButton = quoteDialog?.querySelector("[data-prev-step]");
let activeQuoteStep = 1;

function showQuoteStep(step, focusSelector) {
  activeQuoteStep = step;
  quoteSteps.forEach((quoteStep) => {
    quoteStep.hidden = Number(quoteStep.dataset.quoteStep) !== step;
  });
  quoteDialog?.setAttribute("aria-labelledby", step === 1 ? "quote-dialog-title" : "quote-dialog-step2-title");
  quoteDialog?.scrollTo({ top: 0, behavior: "auto" });
  if (focusSelector) window.setTimeout(() => quoteDialog?.querySelector(focusSelector)?.focus(), 50);
}

function updateContactField() {
  const selectedMethod = contactMethods.find((method) => method.checked)?.value;
  const hasMethod = selectedMethod === "email" || selectedMethod === "phone";
  if (!contactValueField || !contactValueLabel || !contactValue) return;

  contactValueField.hidden = !hasMethod;
  contactValue.disabled = !hasMethod;
  contactValue.required = hasMethod;
  if (!hasMethod) {
    contactValue.value = "";
    contactValue.type = "text";
    contactValue.removeAttribute("autocomplete");
    contactValue.placeholder = "";
    if (contactHelper) contactHelper.textContent = "Choose email or phone to show the right contact field.";
    return;
  }

  const isEmail = selectedMethod === "email";
  contactValue.type = isEmail ? "email" : "tel";
  contactValue.autocomplete = isEmail ? "email" : "tel";
  contactValue.placeholder = isEmail ? "you@example.com" : "910-527-4800";
  contactValueLabel.innerHTML = `${isEmail ? "Email address" : "Phone number"} <b>*</b>`;
  if (contactHelper) contactHelper.textContent = isEmail ? "We will use this email for your quote." : "We will use this phone number for your quote.";
}

function validateStep(step) {
  const quoteStep = quoteDialog?.querySelector(`[data-quote-step="${step}"]`);
  if (!quoteStep) return true;
  const fields = [...quoteStep.querySelectorAll("input, select, textarea")].filter((field) => !field.disabled);
  const invalidField = fields.find((field) => !field.checkValidity());
  if (!invalidField) return true;
  invalidField.reportValidity();
  return false;
}

function syncItemCards() {
  const cards = itemList ? [...itemList.querySelectorAll("[data-item-card]")] : [];
  cards.forEach((card, index) => {
    const itemNumber = index + 1;
    card.querySelector("[data-item-number]").textContent = `Item ${itemNumber}`;
    const itemName = card.querySelector("[data-item-name]");
    const itemPhoto = card.querySelector("[data-item-photo]");
    const itemLink = card.querySelector("[data-item-link]");
    itemName.name = `items[${index}][name]`;
    itemName.id = `item-name-${itemNumber}`;
    itemPhoto.name = `items[${index}][photo]`;
    itemPhoto.id = `item-photo-${itemNumber}`;
    itemLink.name = `items[${index}][link]`;
    card.querySelector("[data-remove-item]").hidden = cards.length === 1;
  });
}

function resetItemList() {
  if (!itemList || !initialItemCard) return;
  itemList.replaceChildren(initialItemCard.cloneNode(true));
  syncItemCards();
}

function resetQuoteForm() {
  quoteForm?.reset();
  if (formStatus) formStatus.textContent = "";
  const submitButton = quoteForm?.querySelector("[type=submit]");
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Free Estimate <span aria-hidden="true">↗</span>';
  }
  resetItemList();
  updateContactField();
  showQuoteStep(1);
}

function openQuote(event) {
  event?.preventDefault();
  setMenu(false);
  if (!quoteDialog) return;
  resetQuoteForm();
  if (typeof quoteDialog.showModal === "function" && !quoteDialog.open) quoteDialog.showModal();
  else quoteDialog.setAttribute("open", "");
  document.body.classList.add("dialog-open");
  window.setTimeout(() => quoteDialog.querySelector('input[name="customer-name"]')?.focus(), 80);
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
  if (event.target === quoteDialog) {
    closeQuote();
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) return;
  const addItemTarget = target.closest("[data-add-item]");
  if (addItemTarget) {
    const newCard = itemList?.querySelector("[data-item-card]")?.cloneNode(true);
    if (!newCard || !itemList) return;
    newCard.querySelectorAll("input").forEach((input) => { input.value = ""; });
    newCard.querySelector("[data-file-name]").textContent = "No file chosen";
    itemList.append(newCard);
    syncItemCards();
    newCard.querySelector("[data-item-name]")?.focus();
  }
  const removeItemTarget = target.closest("[data-remove-item]");
  if (removeItemTarget) {
    const cards = itemList ? [...itemList.querySelectorAll("[data-item-card]")] : [];
    if (cards.length <= 1) return;
    removeItemTarget.closest("[data-item-card]")?.remove();
    syncItemCards();
  }
});

contactMethods.forEach((method) => method.addEventListener("change", updateContactField));
quoteDialog?.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.matches("[data-item-photo]")) return;
  const fileName = input.closest(".upload-field")?.querySelector("[data-file-name]");
  if (fileName) fileName.textContent = input.files?.[0]?.name || "No file chosen";
});

nextStepButton?.addEventListener("click", () => {
  if (validateStep(1)) showQuoteStep(2, "[data-item-name]");
});
previousStepButton?.addEventListener("click", () => showQuoteStep(1, 'input[name="customer-name"]'));
quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (activeQuoteStep !== 2 || !validateStep(2)) return;
  const submitButton = quoteForm.querySelector("[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "Request captured";
  formStatus.textContent = "Prototype only: nothing was sent. For now, call or text 910-527-4800.";
  window.setTimeout(() => {
    resetQuoteForm();
  }, 2600);
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
