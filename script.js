document.documentElement.classList.add("js");

const FORM_EMAIL_ENDPOINT = "https://formsubmit.co/ajax/pricing@araizabuild.com";

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
const smsRequestLink = document.querySelector("#sms-request-link");
const quoteMessageField = document.querySelector("#quote-message");
const quotePreferredContactField = document.querySelector("#quote-preferred-contact-method");
const quoteEmailField = document.querySelector("#quote-email");
const quoteReplyToField = document.querySelector("#quote-replyto");
const quoteUrlField = document.querySelector("#quote-url");
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

function updatePhotoPreview(input) {
  const uploadField = input.closest(".upload-field");
  const fileName = uploadField?.querySelector("[data-file-name]");
  const preview = uploadField?.querySelector("[data-file-preview]");
  const file = input.files?.[0];
  if (fileName) fileName.textContent = file?.name || "No file chosen";
  if (!preview) return;
  if (!file) {
    preview.hidden = true;
    preview.removeAttribute("src");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (input.files?.[0] !== file || typeof reader.result !== "string") return;
    preview.src = reader.result;
    preview.hidden = false;
  });
  reader.readAsDataURL(file);
}

function resetQuoteForm() {
  quoteForm?.reset();
  if (formStatus) formStatus.textContent = "";
  if (smsRequestLink) {
    smsRequestLink.hidden = true;
    smsRequestLink.removeAttribute("href");
  }
  const submitButton = quoteForm?.querySelector("[type=submit]");
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = "Send Request";
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
    const newPreview = newCard.querySelector("[data-file-preview]");
    if (newPreview) {
      newPreview.hidden = true;
      newPreview.removeAttribute("src");
    }
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
  updatePhotoPreview(input);
});

nextStepButton?.addEventListener("click", () => {
  if (validateStep(1)) showQuoteStep(2, "[data-item-name]");
});
previousStepButton?.addEventListener("click", () => showQuoteStep(1, 'input[name="customer-name"]'));
function buildRequestMessage() {
  const valueFor = (selector) => quoteForm?.querySelector(selector)?.value.trim() || "";
  const selectedMethod = contactMethods.find((method) => method.checked)?.value || "not specified";
  const contactDetail = contactValue?.value.trim() || "not provided";
  const notes = valueFor('[name="notes"]');
  const lines = [
    "Hi Araiza Assembly! I would like a free estimate.",
    `Name: ${valueFor('[name="customer-name"]')}`,
    `Preferred reply: ${selectedMethod} — ${contactDetail}`,
    `ZIP code: ${valueFor('[name="zip-code"]')}`,
    "",
    "Items:"
  ];

  itemList?.querySelectorAll("[data-item-card]").forEach((card, index) => {
    const itemName = card.querySelector("[data-item-name]")?.value.trim() || "Item details not provided";
    const itemLink = card.querySelector("[data-item-link]")?.value.trim();
    const hasPhoto = Boolean(card.querySelector("[data-item-photo]")?.files?.length);
    lines.push(`${index + 1}. ${itemName}${itemLink ? ` — ${itemLink}` : ""}${hasPhoto ? " — photo selected; attach it to this text" : ""}`);
  });

  if (notes) lines.push("", `Additional notes: ${notes}`);

  return lines.join("\n");
}

function showSmsFallback(message) {
  const smsUrl = `sms:+19105274800?&body=${encodeURIComponent(message)}`;
  if (formStatus) formStatus.textContent = "Email delivery was unavailable. Your request is ready to text instead.";
  if (smsRequestLink) {
    smsRequestLink.href = smsUrl;
    smsRequestLink.hidden = false;
  }
}

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (activeQuoteStep !== 2 || !validateStep(2)) return;
  const submitButton = quoteForm.querySelector("[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  const requestMessage = buildRequestMessage();
  const selectedMethod = contactMethods.find((method) => method.checked)?.value;
  const contactDetail = contactValue?.value.trim() || "";
  const hasPhoto = [...quoteForm.querySelectorAll("[data-item-photo]")].some((input) => input.files?.length);
  if (quoteMessageField) quoteMessageField.value = requestMessage;
  if (quotePreferredContactField) quotePreferredContactField.value = selectedMethod || "not specified";
  if (quoteEmailField) quoteEmailField.value = selectedMethod === "email" ? contactDetail : "";
  if (quoteReplyToField) quoteReplyToField.value = selectedMethod === "email" ? contactDetail : "";
  if (quoteUrlField) quoteUrlField.value = window.location.href.split("#")[0];

  if (hasPhoto) {
    HTMLFormElement.prototype.submit.call(quoteForm);
    submitButton.textContent = "Request sent";
    if (formStatus) formStatus.textContent = "Request sent. We will follow up by your preferred method.";
    if (smsRequestLink) smsRequestLink.hidden = true;
    return;
  }

  try {
    const formData = new FormData(quoteForm);
    const formBody = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && !key.startsWith("items[")) formBody.append(key, value);
    }
    const response = await fetch(FORM_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: formBody
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false || result.success === "false") throw new Error("FormSubmit request failed");
    submitButton.textContent = "Sent successfully";
    if (formStatus) formStatus.textContent = "Request sent. We will follow up by your preferred method.";
    if (smsRequestLink) smsRequestLink.hidden = true;
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Try email again";
    showSmsFallback(requestMessage);
  }
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
