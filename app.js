let accounts = [
  { id: 1, provider: "MetroGAS", account: "921-45-8877", amount: 38640, due: "04 mar" },
  { id: 2, provider: "Enel", account: "88212013", amount: 52110, due: "07 mar" },
  { id: 3, provider: "TAG", account: "PAT-HJTR22", amount: 17090, due: "02 mar" },
  { id: 4, provider: "Entel", account: "+56 9 6641 2211", amount: 28990, due: "05 mar" },
  { id: 5, provider: "Aguas Andinas", account: "55447090", amount: 24950, due: "09 mar" }
];

let paymentMethods = [
  { id: 1, type: "TC", brand: "Visa", last4: "4242", holder: "Vicente Torres", isDefault: true },
  { id: 2, type: "TD", brand: "Santander", last4: "8891", holder: "Vicente Torres", isDefault: false }
];

let selectedIds = new Set();
let tickets = 0;
let activity = [];

const loginScreen = document.getElementById("login-screen");
const appPanel = document.getElementById("app-panel");
const loginError = document.getElementById("login-error");
const payError = document.getElementById("pay-error");
const receipt = document.getElementById("receipt");
const ticketsCount = document.getElementById("tickets-count");
const ticketsCountProfile = document.getElementById("tickets-count-profile");
const selectedTotalEl = document.getElementById("selected-total");
const selectedLabel = document.getElementById("selected-label");
const amountInput = document.getElementById("amount");
const selectAllEl = document.getElementById("select-all");
const searchInput = document.getElementById("search-account");
const methodSelect = document.getElementById("method");
const addAccountModal = document.getElementById("add-account-modal");
const methodError = document.getElementById("method-error");

function clp(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

function selectedAccounts() {
  return accounts.filter((item) => selectedIds.has(item.id));
}

function selectedAmount() {
  return selectedAccounts().reduce((acc, item) => acc + item.amount, 0);
}

function filteredAccounts() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return accounts;
  return accounts.filter(
    (item) =>
      item.provider.toLowerCase().includes(query) ||
      item.account.toLowerCase().includes(query)
  );
}

function defaultMethod() {
  return paymentMethods.find((item) => item.isDefault) || paymentMethods[0];
}

function methodLabel(item) {
  return `${item.type} · ${item.brand} ****${item.last4}`;
}

function syncSummary() {
  const total = selectedAmount();
  selectedTotalEl.textContent = clp(total);
  amountInput.value = total || "";

  if (selectedIds.size === 0) {
    selectedLabel.textContent = "Selecciona una o varias cuentas para pagar";
  } else if (selectedIds.size === 1) {
    const account = selectedAccounts()[0];
    selectedLabel.textContent = `${account.provider} · ${account.account}`;
  } else {
    selectedLabel.textContent = `${selectedIds.size} cuentas seleccionadas`;
  }

  const visibleIds = filteredAccounts().map((item) => item.id);
  const selectedVisible = visibleIds.filter((id) => selectedIds.has(id));
  selectAllEl.checked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
}

function renderMethods() {
  const list = document.getElementById("payment-methods-list");
  list.innerHTML = "";

  paymentMethods.forEach((item) => {
    const card = document.createElement("article");
    card.className = "method-item";
    card.innerHTML = `
      <div>
        <strong>${methodLabel(item)}</strong>
        <small>Titular: ${item.holder}</small>
      </div>
      <div class="method-actions">
        ${item.isDefault ? '<span class="method-default">Predeterminado</span>' : `<button data-default="${item.id}">Usar por defecto</button>`}
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("button[data-default]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.default);
      paymentMethods = paymentMethods.map((item) => ({
        ...item,
        isDefault: item.id === id
      }));
      renderMethods();
      renderCheckoutMethods();
    });
  });
}

function renderCheckoutMethods() {
  methodSelect.innerHTML = "";
  paymentMethods.forEach((item) => {
    const option = document.createElement("option");
    option.value = methodLabel(item);
    option.textContent = methodLabel(item) + (item.isDefault ? " (Predeterminado)" : "");
    methodSelect.appendChild(option);
  });

  const current = defaultMethod();
  if (current) methodSelect.value = methodLabel(current);
}

function renderAccounts() {
  const root = document.getElementById("accounts");
  root.innerHTML = "";

  filteredAccounts().forEach((item) => {
    const card = document.createElement("article");
    card.className = "account";
    card.innerHTML = `
      <label class="checkline account-check">
        <input type="checkbox" data-id="${item.id}" ${selectedIds.has(item.id) ? "checked" : ""} />
        Incluir en pago
      </label>
      <div class="account-head">
        <strong>${item.provider}</strong>
        <strong>${clp(item.amount)}</strong>
      </div>
      <small>Cuenta ${item.account} · Vence ${item.due}</small>
      <button data-single="${item.id}">Pagar solo esta cuenta</button>
    `;
    root.appendChild(card);
  });

  root.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = Number(checkbox.dataset.id);
      if (checkbox.checked) selectedIds.add(id);
      else selectedIds.delete(id);
      syncSummary();
      payError.textContent = "";
      receipt.classList.remove("show");
    });
  });

  root.querySelectorAll("button[data-single]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedIds.clear();
      selectedIds.add(Number(button.dataset.single));
      renderAccounts();
      syncSummary();
      payError.textContent = "";
      receipt.classList.remove("show");
    });
  });

  syncSummary();
}

function renderActivity() {
  const root = document.getElementById("activity-list");
  root.innerHTML = "";

  if (!activity.length) {
    root.innerHTML = "<li>Aun no hay pagos registrados.</li>";
    return;
  }

  activity.slice(0, 5).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.when} · ${item.accounts} · ${clp(item.amount)} · +${item.tickets} tickets`;
    root.appendChild(li);
  });
}

function refreshTickets() {
  ticketsCount.textContent = String(tickets);
  ticketsCountProfile.textContent = String(tickets);
}

function openModal(node) {
  node.classList.add("open");
  node.setAttribute("aria-hidden", "false");
}

function closeModal(node) {
  node.classList.remove("open");
  node.setAttribute("aria-hidden", "true");
}

function openApp() {
  loginScreen.style.display = "none";
  appPanel.classList.add("open");
  appPanel.setAttribute("aria-hidden", "false");
  renderAccounts();
  renderActivity();
  renderMethods();
  renderCheckoutMethods();
  refreshTickets();
}

document.getElementById("login-password").addEventListener("click", () => {
  const password = document.getElementById("password-input").value;
  if (password !== "1234") {
    loginError.textContent = "Clave incorrecta. Usa 1234.";
    return;
  }
  loginError.textContent = "";
  openApp();
});

document.getElementById("login-faceid").addEventListener("click", () => {
  loginError.textContent = "Face ID validado";
  setTimeout(() => {
    loginError.textContent = "";
    openApp();
  }, 400);
});

document.getElementById("logout").addEventListener("click", () => {
  appPanel.classList.remove("open");
  appPanel.setAttribute("aria-hidden", "true");
  loginScreen.style.display = "grid";
  selectedIds.clear();
  payError.textContent = "";
  receipt.classList.remove("show");
});

selectAllEl.addEventListener("change", () => {
  const visible = filteredAccounts();
  if (selectAllEl.checked) {
    visible.forEach((item) => selectedIds.add(item.id));
  } else {
    visible.forEach((item) => selectedIds.delete(item.id));
  }
  renderAccounts();
});

searchInput.addEventListener("input", () => {
  renderAccounts();
});

document.getElementById("open-add-account").addEventListener("click", () => openModal(addAccountModal));
document.getElementById("close-add-account").addEventListener("click", () => closeModal(addAccountModal));
addAccountModal.addEventListener("click", (event) => {
  if (event.target === addAccountModal) closeModal(addAccountModal);
});

document.getElementById("save-account").addEventListener("click", () => {
  const provider = document.getElementById("new-provider").value.trim();
  const account = document.getElementById("new-account").value.trim();
  const amount = Number(document.getElementById("new-amount").value);
  const due = document.getElementById("new-due").value.trim() || "15 mar";
  const error = document.getElementById("add-account-error");

  if (!provider || !account || !Number.isFinite(amount) || amount <= 0) {
    error.textContent = "Completa proveedor, cuenta y monto valido.";
    return;
  }

  const id = Math.max(...accounts.map((item) => item.id)) + 1;
  accounts.unshift({ id, provider, account, amount, due });
  selectedIds.add(id);

  document.getElementById("new-provider").value = "";
  document.getElementById("new-account").value = "";
  document.getElementById("new-amount").value = "";
  document.getElementById("new-due").value = "";
  error.textContent = "";
  closeModal(addAccountModal);

  renderAccounts();
});

document.getElementById("save-method").addEventListener("click", () => {
  const type = document.getElementById("new-method-type").value;
  const brand = document.getElementById("new-method-brand").value.trim();
  const last4 = document.getElementById("new-method-last4").value.trim();
  const holder = document.getElementById("new-method-holder").value.trim();

  if (!brand || !holder || !/^\d{4}$/.test(last4)) {
    methodError.textContent = "Completa marca, titular y ultimos 4 digitos validos.";
    return;
  }

  const id = Math.max(...paymentMethods.map((item) => item.id)) + 1;
  paymentMethods.push({ id, type, brand, last4, holder, isDefault: false });

  document.getElementById("new-method-brand").value = "";
  document.getElementById("new-method-last4").value = "";
  document.getElementById("new-method-holder").value = "";
  methodError.textContent = "";

  renderMethods();
  renderCheckoutMethods();
});

document.getElementById("pay-now").addEventListener("click", () => {
  const selected = selectedAccounts();
  if (!selected.length) {
    payError.textContent = "Selecciona al menos una cuenta.";
    return;
  }

  const typedAmount = Number(amountInput.value);
  const amount = Number.isFinite(typedAmount) && typedAmount > 0 ? typedAmount : selectedAmount();
  const method = document.getElementById("method").value;
  const gateway = document.getElementById("gateway").value;

  payError.textContent = "Procesando pago...";

  setTimeout(() => {
    const earned = Math.max(1, Math.floor(amount / 10000));
    tickets += earned;
    refreshTickets();

    const providers = selected.map((item) => item.provider).slice(0, 3).join(", ");
    const label = selected.length > 3 ? `${providers} +${selected.length - 3}` : providers;

    activity.unshift({
      when: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      accounts: `${selected.length} cuenta(s)`,
      amount,
      tickets: earned
    });
    renderActivity();

    selectedIds.clear();
    renderAccounts();

    payError.textContent = "";
    receipt.classList.add("show");
    receipt.innerHTML = `
      <strong>Pago exitoso</strong><br>
      ${label}<br>
      Metodo: ${method}<br>
      Pasarela: ${gateway}<br>
      Total: ${clp(amount)}<br>
      Tickets ganados: ${earned}
    `;
  }, 900);
});

document.querySelectorAll(".view-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.view;

    document.querySelectorAll(".view-tab").forEach((node) => node.classList.remove("active"));
    button.classList.add("active");

    document.getElementById("accounts-view").classList.toggle("hidden-view", target !== "accounts-view");
    document.getElementById("my-account-view").classList.toggle("hidden-view", target !== "my-account-view");
  });
});
