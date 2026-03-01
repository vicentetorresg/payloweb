let accounts = [
  { id: 1, provider: "MetroGAS", account: "921-45-8877", amount: 38640, due: "04 mar" },
  { id: 2, provider: "Enel", account: "88212013", amount: 52110, due: "07 mar" },
  { id: 3, provider: "TAG", account: "PAT-HJTR22", amount: 17090, due: "02 mar" },
  { id: 4, provider: "Entel", account: "+56 9 6641 2211", amount: 28990, due: "05 mar" },
  { id: 5, provider: "Aguas Andinas", account: "55447090", amount: 24950, due: "09 mar" }
];

const demoSteps = [
  {
    title: "Login seguro",
    copy: "Los usuarios entran con Face ID o clave. Acceso rapido y protegido.",
    extra: "Time to login: 4 segundos"
  },
  {
    title: "Seleccion flexible",
    copy: "Puedes elegir una, varias o todas las cuentas en segundos.",
    extra: "Seleccion masiva + filtros"
  },
  {
    title: "Pago en 1 flujo",
    copy: "Seleccionas TC/TD y pagas lote completo con pasarela integrada.",
    extra: "Pasarela: Fintoc"
  },
  {
    title: "Rewards activos",
    copy: "Cada pago suma tickets para sorteos mensuales: viajes, autos y giftcards.",
    extra: "Engagement: +34%"
  }
];

let selectedIds = new Set();
let tickets = 0;
let demoIndex = 0;
let activity = [];

const phoneDemo = document.getElementById("phone-demo");
const stepButtons = Array.from(document.querySelectorAll(".step"));
const modal = document.getElementById("login-modal");
const addAccountModal = document.getElementById("add-account-modal");
const appPanel = document.getElementById("app-panel");
const loginError = document.getElementById("login-error");
const payError = document.getElementById("pay-error");
const receipt = document.getElementById("receipt");
const ticketsCount = document.getElementById("tickets-count");
const selectedTotalEl = document.getElementById("selected-total");
const selectedLabel = document.getElementById("selected-label");
const amountInput = document.getElementById("amount");
const selectAllEl = document.getElementById("select-all");
const searchInput = document.getElementById("search-account");

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

function filteredAccounts() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return accounts;
  return accounts.filter(
    (item) =>
      item.provider.toLowerCase().includes(query) ||
      item.account.toLowerCase().includes(query)
  );
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

function renderDemo(index) {
  const item = demoSteps[index];
  phoneDemo.innerHTML = `
    <h4>${item.title}</h4>
    <p>${item.copy}</p>
    <p style="margin-top: 14px; color: #66d4ff; font-weight: 700;">${item.extra}</p>
    <div style="margin-top: 16px; border-radius: 12px; border: 1px solid #2f5776; padding: 11px; background: #0f2640;">
      <small style="color:#8fc6e9">Demo Paylo</small>
      <div style="margin-top:6px; color:#fff; font-weight:700;">Experiencia fintech para pagos recurrentes</div>
    </div>
  `;

  stepButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index);
  });
}

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    demoIndex = Number(button.dataset.step);
    renderDemo(demoIndex);
  });
});

setInterval(() => {
  demoIndex = (demoIndex + 1) % demoSteps.length;
  renderDemo(demoIndex);
}, 5000);

renderDemo(0);

function openModal(node) {
  node.classList.add("open");
  node.setAttribute("aria-hidden", "false");
}

function closeModal(node) {
  node.classList.remove("open");
  node.setAttribute("aria-hidden", "true");
}

["open-login", "open-login-hero", "open-login-cta"].forEach((id) => {
  document.getElementById(id).addEventListener("click", () => openModal(modal));
});

document.getElementById("close-login").addEventListener("click", () => closeModal(modal));
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal(modal);
});

document.getElementById("open-add-account").addEventListener("click", () => openModal(addAccountModal));
document.getElementById("close-add-account").addEventListener("click", () => closeModal(addAccountModal));
addAccountModal.addEventListener("click", (event) => {
  if (event.target === addAccountModal) closeModal(addAccountModal);
});

function loginSuccess() {
  closeModal(modal);
  appPanel.classList.add("open");
  appPanel.setAttribute("aria-hidden", "false");
  appPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  renderAccounts();
  renderActivity();
}

document.getElementById("login-password").addEventListener("click", () => {
  const password = document.getElementById("password-input").value;
  if (password !== "1234") {
    loginError.textContent = "Clave incorrecta. Usa 1234.";
    return;
  }
  loginError.textContent = "";
  loginSuccess();
});

document.getElementById("login-faceid").addEventListener("click", () => {
  loginError.textContent = "Face ID validado";
  setTimeout(() => {
    loginError.textContent = "";
    loginSuccess();
  }, 400);
});

document.getElementById("logout").addEventListener("click", () => {
  appPanel.classList.remove("open");
  appPanel.setAttribute("aria-hidden", "true");
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
    ticketsCount.textContent = String(tickets);

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

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
