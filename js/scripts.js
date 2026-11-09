const storageFeedback = document.getElementById("storage-feedback");
const storageKeys = {
  theme: "preferenciaTema",
  savedItems: "listaSalva",
  visitor: "preferenciaVisitante",
  visitorName: "nomeVisitante",
};

const welcomeForm = document.getElementById("welcome-form");
const welcomeNameInput = document.getElementById("visitor-name");
const welcomeMessage = document.getElementById("welcome-message");

function showWelcome(name) {
  if (!welcomeForm || !welcomeMessage) {
    return;
  }

  welcomeForm.hidden = true;
  welcomeMessage.textContent = `Olá, ${name}!`;
  welcomeMessage.hidden = false;
}

if (welcomeForm && welcomeNameInput && welcomeMessage) {
  const savedName = readStorage(storageKeys.visitorName)?.trim();
  if (savedName) {
    showWelcome(savedName);
  } else {
    welcomeForm.hidden = false;
  }

  welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = welcomeNameInput.value.trim();
    if (!name) {
      welcomeNameInput.setCustomValidity("Informe seu nome para continuar.");
      welcomeNameInput.reportValidity();
      welcomeNameInput.addEventListener("input", () => welcomeNameInput.setCustomValidity(""), { once: true });
      return;
    }

    if (writeStorage(storageKeys.visitorName, name)) {
      showWelcome(name);
    }
  });
}

function showStorageError() {
  if (storageFeedback) {
    storageFeedback.textContent = "Não foi possível salvar suas preferências neste navegador.";
  }
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    showStorageError();
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    showStorageError();
    return false;
  }
}

const themeToggle = document.getElementById("theme-toggle");
let currentTheme = readStorage(storageKeys.theme) === "dark" ? "dark" : "light";

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? "Ativar tema claro" : "Ativar tema escuro";
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
  drawStudyChart();
}

applyTheme(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    writeStorage(storageKeys.theme, nextTheme);
  });
}

const savedList = document.getElementById("saved-list");
const savedEmpty = document.getElementById("saved-empty");
const saveButtons = document.querySelectorAll("[data-save-item]");
const availableItems = new Set(Array.from(saveButtons, (button) => button.dataset.saveItem));
let savedItems = [];

try {
  const storedItems = JSON.parse(readStorage(storageKeys.savedItems) || "[]");
  if (Array.isArray(storedItems)) {
    savedItems = storedItems.filter((item) => availableItems.has(item));
  } else {
    showStorageError();
  }
} catch {
  showStorageError();
}

function renderSavedItems() {
  if (!savedList || !savedEmpty) {
    return;
  }

  savedList.replaceChildren();
  savedItems.forEach((item) => {
    const listItem = document.createElement("li");
    const label = document.createElement("span");
    const removeButton = document.createElement("button");

    label.textContent = item;
    removeButton.className = "remove-saved-item";
    removeButton.type = "button";
    removeButton.dataset.removeSavedItem = item;
    removeButton.textContent = "Remover";
    removeButton.setAttribute("aria-label", `Remover ${item} da lista`);
    listItem.append(label, removeButton);
    savedList.append(listItem);
  });

  savedEmpty.hidden = savedItems.length > 0;
  saveButtons.forEach((button) => {
    const isSaved = savedItems.includes(button.dataset.saveItem);
    button.textContent = isSaved ? "Salvo" : "Salvar";
    button.setAttribute("aria-pressed", String(isSaved));
  });
}

function persistSavedItems() {
  writeStorage(storageKeys.savedItems, JSON.stringify(savedItems));
  renderSavedItems();
}

saveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.dataset.saveItem;
    savedItems = savedItems.includes(item)
      ? savedItems.filter((savedItem) => savedItem !== item)
      : [...savedItems, item];
    persistSavedItems();
  });
});

if (savedList) {
  savedList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-saved-item]");
    if (button) {
      savedItems = savedItems.filter((item) => item !== button.dataset.removeSavedItem);
      persistSavedItems();
    }
  });
}

renderSavedItems();

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const formFeedback = document.getElementById("form-feedback");
  const preferenceGroup = contactForm.querySelector('[role="radiogroup"]');
  const preferenceError = document.getElementById("preferencia-erro");
  const preferenceInputs = contactForm.querySelectorAll('input[name="preferencia"]');
  const newsletterInput = document.getElementById("newsletter");
  const visitorPreference = {
    contact: "",
    newsletter: false,
  };

  try {
    const storedPreference = JSON.parse(readStorage(storageKeys.visitor) || "{}");
    if (["email", "telefone", "whatsapp"].includes(storedPreference.contact)) {
      visitorPreference.contact = storedPreference.contact;
      const savedContact = contactForm.querySelector(
        `input[name="preferencia"][value="${visitorPreference.contact}"]`,
      );
      if (savedContact) {
        savedContact.checked = true;
      }
    }
    if (typeof storedPreference.newsletter === "boolean") {
      visitorPreference.newsletter = storedPreference.newsletter;
      newsletterInput.checked = visitorPreference.newsletter;
    }
  } catch {
    showStorageError();
  }

  function persistVisitorPreference() {
    const selectedContact = contactForm.querySelector('input[name="preferencia"]:checked');
    visitorPreference.contact = selectedContact ? selectedContact.value : "";
    visitorPreference.newsletter = newsletterInput.checked;
    writeStorage(storageKeys.visitor, JSON.stringify(visitorPreference));
  }

  preferenceInputs.forEach((input) => {
    input.addEventListener("change", persistVisitorPreference);
  });
  newsletterInput.addEventListener("change", persistVisitorPreference);

  function showFieldError(control, message) {
    const error = document.getElementById(`${control.id}-erro`);
    control.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) {
      error.textContent = message;
    }
  }

  function validateField(control) {
    let message = "";
    if (!control.value.trim()) {
      message = "Este campo é obrigatório.";
    } else if (control.type === "email" && control.validity.typeMismatch) {
      message = "Informe um endereço de e-mail válido.";
    } else if (control.type === "tel" && control.value.replace(/\D/g, "").length < 10) {
      message = "Informe um telefone com DDD e pelo menos 10 dígitos.";
    }
    showFieldError(control, message);
    return !message;
  }

  contactForm.addEventListener("input", (event) => {
    formFeedback.textContent = "";
    formFeedback.className = "form-feedback";
    if (event.target.matches("input, select, textarea")) {
      if (event.target.getAttribute("aria-invalid") === "true") {
        validateField(event.target);
      } else {
        showFieldError(event.target, "");
      }
    }
  });

  contactForm.addEventListener("change", (event) => {
    if (event.target.name === "preferencia") {
      preferenceGroup.removeAttribute("aria-invalid");
      preferenceError.textContent = "";
    }
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = Array.from(contactForm.querySelectorAll("input[required], select[required], textarea[required]"))
      .filter((control) => control.type !== "radio");
    let isValid = fields.map(validateField).every(Boolean);
    const selectedContact = contactForm.querySelector('input[name="preferencia"]:checked');

    preferenceGroup.setAttribute("aria-invalid", String(!selectedContact));
    preferenceError.textContent = selectedContact ? "" : "Selecione uma preferência de contato.";
    isValid = Boolean(selectedContact) && isValid;
    formFeedback.className = "form-feedback";

    if (!isValid) {
      formFeedback.textContent = "Revise os campos destacados antes de continuar.";
      formFeedback.classList.add("error");
      const firstInvalid = contactForm.querySelector(
        'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]',
      ) || (selectedContact ? null : preferenceInputs[0]);
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    persistVisitorPreference();
    formFeedback.textContent = "Dados validados. Este site ainda não possui serviço de envio, então sua mensagem não foi transmitida.";
    formFeedback.classList.add("success");
  });
}

function drawStudyChart() {
  const canvas = document.getElementById("graficoCanvas");
  const context = canvas && canvas.getContext("2d");
  if (!context) {
    return;
  }

  const isDark = currentTheme === "dark";
  context.fillStyle = isDark ? "#202c3d" : "#f7fafc";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const hours = [4, 6, 8, 7, 10];
  const weeks = ["S1", "S2", "S3", "S4", "S5"];

  hours.forEach((value, index) => {
    const x = 45 + index * 75;
    const y = 190 - value * 12;
    context.fillStyle = isDark ? "#79b9e8" : "#2e6f9f";
    context.fillRect(x, y, 45, value * 12);
    context.fillStyle = isDark ? "#e7edf5" : "#1f2a37";
    context.font = "14px Arial";
    context.fillText(weeks[index], x + 15, 210);
  });
}
