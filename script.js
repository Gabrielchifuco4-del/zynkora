// --- Inicialização de Dados Estruturados ---
if (!localStorage.getItem('zynkora_db')) {
    const initialDb = {
        users: {
            'user123': {
                id: 'user123',
                saldo: 0.00,
                pacote: null,
                ultimoAcesso: null,
                convidadoPor: null,
                membrosDiretos: [],
                codigoConvite: 'ZYNK' + Math.floor(Math.random() * 9000 + 1000)
            }
        },
        currentUser: 'user123'
    };
    localStorage.setItem('zynkora_db', JSON.stringify(initialDb));
}

let db = JSON.parse(localStorage.getItem('zynkora_db'));
let user = db.users[db.currentUser];

const pacotesConfig = {
    'VIP 1': { preco: 50.00, ganhoDiario: 5.00 },
    'VIP 2': { preco: 100.00, ganhoDiario: 12.00 },
    'VIP 3': { preco: 300.00, ganhoDiario: 40.00 }
};

// --- Injeção do Modal de Tarefas ---
const modalHtml = `
<div id="taskModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; justify-content:center; align-items:center;">
    <div style="background:white; padding:30px; border-radius:15px; text-align:center; max-width:80%; width:300px;">
        <h3 id="modalTitle" style="color:#0a192f">Tarefa Diária</h3>
        <p id="modalStatus" style="margin:20px 0; color:#333">Deseja iniciar o processamento?</p>
        <div id="modalButtons">
            <button id="btnConfirmTask" style="background:#28a745; margin-right:10px;">Confirmar</button>
            <button id="btnCancelTask" style="background:#dc3545;">Cancelar</button>
        </div>
    </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', modalHtml);

// --- Função para Atualizar a Interface ---
function updateUI() {
    const ganhoDiario = user.pacote ? pacotesConfig[user.pacote].ganhoDiario : 0;

    // Home
    const saldoEl = document.querySelector('#home .stat-card:nth-child(1)');
    const ganhoEl = document.querySelector('#home .stat-card:nth-child(2)');
    if (saldoEl) saldoEl.textContent = `Saldo: R$ ${user.saldo.toFixed(2)}`;
    if (ganhoEl) ganhoEl.textContent = `Ganho Diário: R$ ${ganhoDiario.toFixed(2)}`;

    // Equipe
    const conviteInput = document.querySelector('#equipe input[type="text"]');
    const totalMembrosEl = document.querySelector('#equipe .referral-box p');
    if (conviteInput) conviteInput.value = user.codigoConvite;
    if (totalMembrosEl) {
        totalMembrosEl.innerHTML = `
            Membros Diretos: <b>${user.membrosDiretos.length}</b><br>
            Total Equipe: <b>${user.membrosDiretos.length}</b>
        `;
    }

    localStorage.setItem('zynkora_db', JSON.stringify(db));
}

// --- Sistema de Navegação ---
window.showPage = (pageId) => {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    updateUI();
};

// --- Sistema de Convites ---
window.simularNovoConvidado = (codigoUsado) => {
    const novoId = 'user' + Math.floor(Math.random() * 10000);
    const convidadorId = Object.keys(db.users).find(id => db.users[id].codigoConvite === codigoUsado);

    db.users[novoId] = {
        id: novoId,
        saldo: 0.00,
        pacote: null,
        ultimoAcesso: null,
        convidadoPor: convidadorId || null,
        membrosDiretos: [],
        codigoConvite: 'ZYNK' + Math.floor(Math.random() * 9000 + 1000)
    };

    if (convidadorId) {
        db.users[convidadorId].membrosDiretos.push(novoId);
    }
    updateUI();
    alert("Novo membro registrado via convite!");
};

// --- Sistema de Pacotes & Comissão ---
function comprarPacote(nome) {
    const p = pacotesConfig[nome];
    if (user.saldo < p.preco) return alert("Saldo insuficiente!");

    user.saldo -= p.preco;
    user.pacote = nome;

    // Comissão 20% para o padrinho (nível 1)
    if (user.convidadoPor && db.users[user.convidadoPor]) {
        const comissao = p.preco * 0.20;
        db.users[user.convidadoPor].saldo += comissao;
        alert(`Pacote ${nome} ativado! Comissão de R$ ${comissao.toFixed(2)} creditada ao padrinho.`);
    } else {
        alert(`Pacote ${nome} ativado!`);
    }

    updateUI();
}

// --- Sistema de Tarefas com Modal ---
const modal = document.getElementById('taskModal');
const modalStatus = document.getElementById('modalStatus');
const btnConfirm = document.getElementById('btnConfirmTask');
const btnCancel = document.getElementById('btnCancelTask');

document.querySelectorAll('#tarefas button').forEach(btn => {
    btn.onclick = () => {
        if (!user.pacote) return alert("Ative um pacote para fazer tarefas!");
        const agora = new Date().getTime();
        const umDia = 24 * 60 * 60 * 1000;
        if (user.ultimoAcesso && (agora - user.ultimoAcesso < umDia)) {
            return alert("Tarefa bloqueada. Tente novamente em 24h.");
        }
        modal.style.display = 'flex';
        modalStatus.textContent = "Deseja processar sua tarefa diária?";
        document.getElementById('modalButtons').style.display = 'block';
    };
});

btnConfirm.onclick = () => {
    document.getElementById('modalButtons').style.display = 'none';
    modalStatus.textContent = "Processando... aguarde 3.5s";

    setTimeout(() => {
        const ganho = pacotesConfig[user.pacote].ganhoDiario;
        user.saldo += ganho;
        user.ultimoAcesso = new Date().getTime();
        modalStatus.textContent = `Sucesso! +R$ ${ganho.toFixed(2)}`;
        updateUI();

        setTimeout(() => modal.style.display = 'none', 1500);
    }, 3500);
};

btnCancel.onclick = () => modal.style.display = 'none';

// --- Ativação de Pacotes via Botões ---
document.querySelectorAll('.vip-card button').forEach(btn => {
    btn.onclick = () => {
        const nome = btn.parentElement.querySelector('h3').textContent;
        comprarPacote(nome);
    };
});

// --- Depósito e Saque ---
document.querySelector('#deposito form').onsubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(e.target.querySelector('input').value);
    if (val > 0) { user.saldo += val; updateUI(); alert("Depósito Simulado!"); e.target.reset(); }
};

document.querySelector('#saque form').onsubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(e.target.querySelector('input').value);
    if (val > 0 && user.saldo >= val) {
        user.saldo -= val;
        updateUI();
        alert("Saque Simulado!");
        e.target.reset();
    } else alert("Saldo insuficiente ou valor inválido.");
};

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    showPage('home');
});

