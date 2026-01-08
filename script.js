/* ==============================
   ZYNKORA – SCRIPT BASE
   ============================== */

/* ---------- CONFIG ---------- */
const APP_NAME = "ZYNKORA";
const CURRENCY = "KZ";

/* ---------- DATABASE LOCAL (SIMULAÇÃO) ---------- */
if (!localStorage.getItem("zynkora_db")) {
    localStorage.setItem(
        "zynkora_db",
        JSON.stringify({
            session: {
                logged: true,
                userId: "U" + Math.floor(Math.random() * 10000)
            },
            user: {
                id: "U" + Math.floor(Math.random() * 10000),
                saldo: 0,
                ganhoHoje: 0,
                totalGanho: 0,
                vip: null,
                convite: "ZYNK" + Math.floor(1000 + Math.random() * 9000),
                convidados: 0
            },
            historico: {
                depositos: [],
                saques: [],
                ganhos: []
            }
        })
    );
}

let db = JSON.parse(localStorage.getItem("zynkora_db"));
let user = db.user;

/* ---------- HELPERS ---------- */
function kz(valor) {
    return `${valor.toLocaleString()} ${CURRENCY}`;
}

function salvar() {
    localStorage.setItem("zynkora_db", JSON.stringify(db));
}

/* ---------- UI UPDATE ---------- */
function updateDashboard() {
    const saldoEl = document.getElementById("saldo");
    const ganhoHojeEl = document.getElementById("ganhoHoje");
    const totalGanhoEl = document.getElementById("totalGanho");
    const userIdEl = document.getElementById("userId");
    const conviteEl = document.getElementById("codigoConvite");

    if (saldoEl) saldoEl.innerText = kz(user.saldo);
    if (ganhoHojeEl) ganhoHojeEl.innerText = kz(user.ganhoHoje);
    if (totalGanhoEl) totalGanhoEl.innerText = kz(user.totalGanho);
    if (userIdEl) userIdEl.innerText = user.id;
    if (conviteEl) conviteEl.value = user.convite;
}

/* ---------- NAVIGATION ---------- */
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    const page = document.getElementById(id);
    if (page) page.style.display = "block";

    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
    const nav = document.querySelector(`nav a[data-page="${id}"]`);
    if (nav) nav.classList.add("active");
}

/* ---------- DEPOSITO (SIMULADO) ---------- */
function deposito(valor) {
    user.saldo += valor;
    db.historico.depositos.push({
        valor,
        data: new Date().toISOString()
    });
    salvar();
    updateDashboard();
    alert("Depósito realizado com sucesso");
}

/* ---------- SAQUE (SIMULADO) ---------- */
function saque(valor) {
    if (valor > user.saldo) {
        alert("Saldo insuficiente");
        return;
    }
    user.saldo -= valor;
    db.historico.saques.push({
        valor,
        data: new Date().toISOString()
    });
    salvar();
    updateDashboard();
    alert("Pedido de saque enviado");
}

/* ---------- VIP ---------- */
const VIPS = {
    VIP1: { preco: 5000, ganho: 600 },
    VIP2: { preco: 10000, ganho: 1000 },
    VIP3: { preco: 20000, ganho: 2500 }
};

function comprarVIP(nome) {
    const vip = VIPS[nome];
    if (!vip) return;

    if (user.saldo < vip.preco) {
        alert("Saldo insuficiente");
        return;
    }

    user.saldo -= vip.preco;
    user.vip = nome;

    salvar();
    updateDashboard();
    alert(`${nome} ativado com sucesso`);
}

/* ---------- TAREFA DIÁRIA ---------- */
function fazerTarefa() {
    if (!user.vip) {
        alert("Ative um VIP para fazer tarefas");
        return;
    }

    const ganho = VIPS[user.vip].ganho;
    user.saldo += ganho;
    user.ganhoHoje = ganho;
    user.totalGanho += ganho;

    db.historico.ganhos.push({
        valor: ganho,
        data: new Date().toISOString()
    });

    salvar();
    updateDashboard();
    alert(`Tarefa concluída: +${kz(ganho)}`);
}

/* ---------- CONVITE ---------- */
function copiarConvite() {
    const link = `${window.location.origin}?ref=${user.convite}`;
    navigator.clipboard.writeText(link);
    alert("Link de convite copiado");
}

/* ---------- LOGOUT ---------- */
function logout() {
    localStorage.removeItem("zynkora_db");
    location.reload();
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
    updateDashboard();
    showPage("home");
});


