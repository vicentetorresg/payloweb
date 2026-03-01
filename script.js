const accounts = [
  { provider: "MetroGAS", account: "921-45-8877", amount: 38640, due: "04 mar" },
  { provider: "Enel", account: "88212013", amount: 52110, due: "07 mar" },
  { provider: "TAG", account: "PAT-HJTR22", amount: 17090, due: "02 mar" },
  { provider: "Entel", account: "+56 9 6641 2211", amount: 28990, due: "05 mar" },
  { provider: "Aguas Andinas", account: "55447090", amount: 24950, due: "09 mar" }
];

const demoSteps = [
  {
    title: "Login seguro",
    copy: "Los usuarios entran con Face ID o clave. Acceso rapido y protegido.",
    extra: "Time to login: 4 segundos"
  },
  {
    title: "Seleccion de cuentas",
    copy: "Visualizan deudas pendientes, montos y vencimientos en una sola vista.",
    extra: "5 cuentas, 1 tap para pagar"
  },
  {
    title: "Pago en 1 flujo",
    copy: "Seleccionan medio de pago TC/TD y completan checkout con pasarela integrada.",
    extra: "Pasarela: Fintoc"
  },
  {
    title: "Rewards activos",
    copy: "Cada pago suma tickets para premios mensuales: viajes, autos y giftcards.",
    extra: "Engagement: +34%"
  }
];

let selectedAccount = null;
let tickets = 0;
let demoIndex = 0;

const phoneDemo = document.getElementById("phone-demo");
const stepButtons = Array.from(document.querySelectorAll(".step"));
const modal = document.getElementById("login-modal");
const appPanel = document.getElementById("app-panel");
const loginError = document.getElementById("login-error");
const payError = document.getElementById("pay-error");
const receipt = document.getElementById("receipt");
const ticketsCount = document.getElementById("tickets-count");

function clp(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
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

function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

["open-login", "open-login-hero", "open-login-cta"].forEach((id) => {
  document.getElementById(id).addEventListener("click", openModal);
});

document.getElementById("close-login").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

function loginSuccess() {
  closeModal();
  appPanel.classList.add("open");
  appPanel.setAttribute("aria-hidden", "false");
  appPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  renderAccounts();
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
  selectedAccount = null;
  payError.textContent = "";
  receipt.classList.remove("show");
});

function renderAccounts() {
  const root = document.getElementById("accounts");
  root.innerHTML = "";

  accounts.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "account";
    card.innerHTML = `
      <div class="account-head">
        <strong>${item.provider}</strong>
        <strong>${clp(item.amount)}</strong>
      </div>
      <small>Cuenta ${item.account} · Vence ${item.due}</small>
      <button data-index="${index}">Pagar esta cuenta</button>
    `;
    root.appendChild(card);
  });

  root.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const account = accounts[Number(button.dataset.index)];
      selectedAccount = account;
      document.getElementById("selected-label").textContent =
        `${account.provider} · ${account.account}`;
      document.getElementById("amount").value = account.amount;
      payError.textContent = "";
      receipt.classList.remove("show");
    });
  });
}

document.getElementById("pay-now").addEventListener("click", () => {
  if (!selectedAccount) {
    payError.textContent = "Selecciona una cuenta primero.";
    return;
  }

  const amount = Number(document.getElementById("amount").value);
  const method = document.getElementById("method").value;
  const gateway = document.getElementById("gateway").value;

  if (!Number.isFinite(amount) || amount <= 0) {
    payError.textContent = "Monto invalido.";
    return;
  }

  payError.textContent = "Procesando pago...";

  setTimeout(() => {
    const earned = Math.max(1, Math.floor(amount / 10000));
    tickets += earned;
    ticketsCount.textContent = String(tickets);
    payError.textContent = "";
    receipt.classList.add("show");
    receipt.innerHTML = `
      <strong>Pago exitoso</strong><br>
      ${selectedAccount.provider} · ${clp(amount)}<br>
      Metodo: ${method}<br>
      Pasarela: ${gateway}<br>
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
