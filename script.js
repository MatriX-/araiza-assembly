document.documentElement.classList.add("js");

const CUSTOMER_CONFIRMATION_ENDPOINT = "https://araiza-confirmation.stephenmatrixca.workers.dev";

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
const quoteSuccess = document.querySelector("#quote-success");
const quoteSuccessMessage = document.querySelector("#quote-success-message");
const contactMethods = quoteDialog ? [...quoteDialog.querySelectorAll('input[name="contact-method"]')] : [];
const contactValueField = document.querySelector("#contact-value-field");
const contactValueLabel = document.querySelector("#contact-value-label");
const contactValue = document.querySelector("#contact-value");
const contactHelper = document.querySelector("#contact-helper");
const itemList = document.querySelector("#item-list");
const initialItemCard = itemList?.querySelector("[data-item-card]")?.cloneNode(true);
const formStatus = document.querySelector("#form-status");
const formStatusMessage = document.querySelector("[data-form-status-message]");
const dismissFormStatusButton = document.querySelector("[data-dismiss-form-status]");
const smsRequestLink = document.querySelector("#sms-request-link");
const quotePreferredContactField = document.querySelector("#quote-preferred-contact-method");
const quoteEmailField = document.querySelector("#quote-email");
const quoteEmailContainer = document.querySelector("#quote-email-field");
const quoteReplyToField = document.querySelector("#quote-replyto");
const quoteUrlField = document.querySelector("#quote-url");
const quoteNextField = quoteForm?.querySelector('[name="_next"]');
const quoteSubmitFrame = document.querySelector("#quote-submit-frame");
const nextStepButton = quoteDialog?.querySelector("[data-next-step]");
const previousStepButton = quoteDialog?.querySelector("[data-prev-step]");
let activeQuoteStep = 1;

function showQuoteStep(step, focusSelector) {
  activeQuoteStep = step;
  if (quoteSuccess) quoteSuccess.hidden = true;
  quoteSteps.forEach((quoteStep) => {
    quoteStep.hidden = Number(quoteStep.dataset.quoteStep) !== step;
  });
  quoteDialog?.setAttribute("aria-labelledby", step === 1 ? "quote-dialog-title" : "quote-dialog-step2-title");
  quoteDialog?.scrollTo({ top: 0, behavior: "auto" });
  if (focusSelector) window.setTimeout(() => quoteDialog?.querySelector(focusSelector)?.focus(), 50);
}

function showQuoteSuccess(confirmationSent = false) {
  if (!quoteSuccess) return;
  activeQuoteStep = 0;
  quoteSteps.forEach((quoteStep) => { quoteStep.hidden = true; });
  quoteSuccess.hidden = false;
  if (quoteSuccessMessage) {
    quoteSuccessMessage.textContent = confirmationSent
      ? "Thanks for sharing the details. We also sent a clean copy to your email. Reply to that email anytime if you want to add anything."
      : "Thanks for sharing the details. Your request was received, and we will follow up by your preferred method."
  }
  quoteDialog?.setAttribute("aria-labelledby", "quote-success-title");
  quoteDialog?.scrollTo({ top: 0, behavior: "auto" });
  window.setTimeout(() => quoteSuccess.querySelector("[data-close-quote]")?.focus(), 50);
}

function updateContactField() {
  const selectedMethod = contactMethods.find((method) => method.checked)?.value;
  const hasMethod = selectedMethod === "email" || selectedMethod === "phone";
  if (!contactValueField || !contactValueLabel || !contactValue || !quoteEmailContainer || !quoteEmailField) return;

  if (!hasMethod) {
    quoteEmailContainer.hidden = true;
    quoteEmailField.disabled = true;
    quoteEmailField.required = false;
    contactValueField.hidden = true;
    contactValue.disabled = true;
    contactValue.required = false;
    contactValue.value = "";
    contactValue.type = "text";
    contactValue.removeAttribute("autocomplete");
    contactValue.placeholder = "";
    if (contactHelper) contactHelper.textContent = "Choose Email or Phone to continue.";
    return;
  }

  quoteEmailContainer.hidden = false;
  quoteEmailField.disabled = false;
  quoteEmailField.required = true;
  const isEmail = selectedMethod === "email";
  contactValueField.hidden = isEmail;
  contactValue.disabled = isEmail;
  contactValue.required = !isEmail;
  if (isEmail) {
    contactValue.value = "";
    contactValue.type = "tel";
    contactValue.removeAttribute("autocomplete");
    contactValue.placeholder = "";
    if (contactHelper) contactHelper.textContent = "We will use this email for your receipt and ongoing replies.";
    return;
  }

  contactValue.type = "tel";
  contactValue.autocomplete = "tel";
  contactValue.placeholder = "910-527-4800";
  contactValueLabel.innerHTML = "Phone number <b>*</b>";
  if (contactHelper) contactHelper.textContent = "We will use this number for follow-up, and email the receipt to you.";
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
    itemName.name = `item_${itemNumber}_name`;
    itemName.id = `item-name-${itemNumber}`;
    itemPhoto.name = `item_${itemNumber}_photo`;
    itemPhoto.id = `item-photo-${itemNumber}`;
    itemLink.name = `item_${itemNumber}_link`;
    if (!itemPhoto.files?.length) {
      const fileName = card.querySelector("[data-file-name]");
      const preview = card.querySelector("[data-file-preview]");
      if (fileName) fileName.textContent = "Optional";
      if (preview) {
        preview.hidden = true;
        preview.removeAttribute("src");
      }
    }
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
  if (fileName) fileName.textContent = file?.name || "Optional";
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
  clearFormStatus();
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
    newCard.querySelector("[data-file-name]").textContent = "Optional";
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
  const email = quoteEmailField?.value.trim() || "";
  const contactDetail = selectedMethod === "email" ? email || "not provided" : contactValue?.value.trim() || "not provided";
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

function buildCustomerConfirmationPayload() {
  const valueFor = (selector) => quoteForm?.querySelector(selector)?.value.trim() || "";
  const selectedMethod = contactMethods.find((method) => method.checked)?.value || "not specified";
  const email = quoteEmailField?.value.trim() || "";
  const contactDetail = selectedMethod === "email" ? email : contactValue?.value.trim() || "";
  const items = [...(itemList?.querySelectorAll("[data-item-card]") || [])].map((card) => ({
    name: card.querySelector("[data-item-name]")?.value.trim() || "Item details not provided",
    link: card.querySelector("[data-item-link]")?.value.trim() || "",
    photo: card.querySelector("[data-item-photo]")?.files?.length ? true : false
  }));

  return {
    website: quoteForm?.querySelector('[name="_honey"]')?.value || "",
    request_id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: valueFor('[name="customer-name"]'),
    email,
    preferred_contact_method: selectedMethod,
    contact_value: contactDetail,
    zip_code: valueFor('[name="zip-code"]'),
    notes: valueFor('[name="notes"]'),
    items
  };
}

async function sendCustomerConfirmation() {
  const response = await fetch(CUSTOMER_CONFIRMATION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildCustomerConfirmationPayload())
  });
  if (!response.ok) throw new Error(`Customer confirmation failed (${response.status})`);
}

function showSmsFallback(message) {
  const smsUrl = `sms:+19105274800?&body=${encodeURIComponent(message)}`;
  setFormStatus("Email delivery was unavailable. Your request is ready to text instead.", "error");
  if (smsRequestLink) {
    smsRequestLink.href = smsUrl;
    smsRequestLink.hidden = false;
  }
}

function submitNativeForm() {
  return new Promise((resolve, reject) => {
    if (!quoteSubmitFrame) {
      reject(new Error("Quote submission frame is unavailable"));
      return;
    }

    let settled = false;
    let timeout;
    const finish = (success) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      quoteSubmitFrame.removeEventListener("load", handleLoad);
      if (success) resolve();
      else reject(new Error("Native FormSubmit request failed"));
    };
    const handleLoad = () => {
      try {
        const resultUrl = new URL(quoteSubmitFrame.contentWindow.location.href);
        finish(resultUrl.origin === window.location.origin && resultUrl.searchParams.get("quote") === "sent");
      } catch {
        finish(false);
      }
    };

    timeout = window.setTimeout(() => finish(false), 20000);
    quoteSubmitFrame.addEventListener("load", handleLoad);
    HTMLFormElement.prototype.submit.call(quoteForm);
  });
}

function setFormStatus(message, state = "success") {
  if (!formStatus) return;
  if (formStatusMessage) formStatusMessage.textContent = message;
  formStatus.dataset.state = state;
  formStatus.hidden = false;
}

function clearFormStatus() {
  if (!formStatus) return;
  formStatus.hidden = true;
  formStatus.removeAttribute("data-state");
  if (formStatusMessage) formStatusMessage.textContent = "";
}

dismissFormStatusButton?.addEventListener("click", clearFormStatus);

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (activeQuoteStep !== 2 || !validateStep(2)) return;
  const submitButton = quoteForm.querySelector("[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  const requestMessage = buildRequestMessage();
  const selectedMethod = contactMethods.find((method) => method.checked)?.value;
  if (quotePreferredContactField) quotePreferredContactField.value = selectedMethod || "not specified";
  if (quoteReplyToField) quoteReplyToField.value = quoteEmailField?.value.trim() || "";
  if (quoteUrlField) quoteUrlField.value = window.location.href.split("#")[0];
  if (quoteNextField) quoteNextField.value = `${window.location.origin}/?quote=sent`;

  try {
    await submitNativeForm();
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Try email again";
    showSmsFallback(requestMessage);
    return;
  }

  let confirmationSent = false;
  try {
    await sendCustomerConfirmation();
    confirmationSent = true;
  } catch (error) {
    console.error(error);
  }

  try {
    if (smsRequestLink) smsRequestLink.hidden = true;
    showQuoteSuccess(confirmationSent);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Request";
  }
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
