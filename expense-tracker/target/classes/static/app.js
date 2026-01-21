const API = "/api/expenses";

const form = document.getElementById("expenseForm");
const tbody = document.getElementById("rows");
const totalEl = document.getElementById("total");
const monthInput = document.getElementById("monthFilter");

function fmtMoney(n){
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

function todayISO(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function monthToRange(yyyyMm){
  const [y, m] = yyyyMm.split("-").map(Number);
  const start = new Date(y, m-1, 1);
  const end = new Date(y, m, 0); // último día del mes
  const s = start.toISOString().slice(0,10);
  const e = end.toISOString().slice(0,10);
  return { start: s, end: e };
}

async function fetchExpenses(){
  // si hay filtro por mes, usa /range
  const month = monthInput.value;
  let url = API;

  if(month){
    const { start, end } = monthToRange(month);
    url = `${API}/range?start=${start}&end=${end}`;
  }

  const res = await fetch(url);
  if(!res.ok) throw new Error("No se pudo cargar gastos");
  return await res.json();
}

function render(expenses){
  tbody.innerHTML = "";
  let total = 0;

  expenses
    .sort((a,b) => (b.expenseDate || "").localeCompare(a.expenseDate || ""))
    .forEach(e => {
      total += Number(e.amount);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(e.title)}</strong><div class="muted">${escapeHtml(e.notes || "")}</div></td>
        <td><span class="badge">${escapeHtml(e.category)}</span></td>
        <td>${escapeHtml(e.expenseDate)}</td>
        <td><strong>${fmtMoney(e.amount)}</strong></td>
        <td><button class="btn danger" data-id="${e.id}">Borrar</button></td>
      `;
      tbody.appendChild(tr);
    });

  totalEl.textContent = fmtMoney(total);

  // borrar
  document.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await fetch(`${API}/${id}`, { method: "DELETE" });
      await load();
    });
  });
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function load(){
  const data = await fetchExpenses();
  render(data);
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value.trim(),
    expenseDate: document.getElementById("expenseDate").value,
    notes: document.getElementById("notes").value.trim()
  };

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });

  if(!res.ok){
    alert("Error guardando gasto. Revisa los campos.");
    return;
  }

  form.reset();
  document.getElementById("expenseDate").value = todayISO();
  await load();
});

monthInput.addEventListener("change", load);

document.getElementById("clearMonth").addEventListener("click", () => {
  monthInput.value = "";
  load();
});

// init
document.getElementById("expenseDate").value = todayISO();
load();
