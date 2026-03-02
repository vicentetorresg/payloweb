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

let demoIndex = 0;

const phoneDemo = document.getElementById("phone-demo");
const stepButtons = Array.from(document.querySelectorAll(".step"));

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

if (phoneDemo && stepButtons.length) {
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
}

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
