// 1. CONFIGURACIÓ I CONSTANTS
const STORAGE_KEY = 'tasquesKanban';
let llistaTasques = [];

const taskForm = document.getElementById('task-form');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const editIdInput = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');
const controls = document.getElementById('controls');
const taulerContainer = document.getElementById('tauler-container');

// 2. FUNCIONS D'INTERFÍCIE
function obrirFormulari() {
    controls.style.display = 'block';
    taulerContainer.classList.add('tauler-bloquejat');
    document.getElementById('task-title').focus();
}

function tancarFormulari() {
    controls.style.display = 'none';
    taulerContainer.classList.remove('tauler-bloquejat');
    resetFormulari();
}

// 3. PERSISTÈNCIA
function carregarTasques() {
    const dades = localStorage.getItem(STORAGE_KEY);
    return dades ? JSON.parse(dades) : [];
}

function guardarTasques(tasques) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// 4. RENDERITZACIÓ, FILTRES I ESTADÍSTIQUES (Issue 4)
function renderTauler() {
    const columnes = {
        perFer: document.querySelector('#per-fer .contenidor-tasques'),
        enCurs: document.querySelector('#en-curs .contenidor-tasques'),
        fet: document.querySelector('#fet .contenidor-tasques')
    };

    Object.values(columnes).forEach(c => c.innerHTML = '');

    const textCerca = document.getElementById('filtre-text').value.toLowerCase();
    const prioritatCerca = document.getElementById('filtre-prioritat').value;
    const estatCerca = document.getElementById('filtre-estat').value;

    const tasquesFiltrades = llistaTasques.filter(tasca => {
        const compleixText = tasca.titol.toLowerCase().includes(textCerca) ||
            tasca.descripcio.toLowerCase().includes(textCerca);
        const compleixPrioritat = prioritatCerca === 'totes' || tasca.prioritat === prioritatCerca;
        const compleixEstat = estatCerca === 'tots' || tasca.estat === estatCerca;

        return compleixText && compleixPrioritat && compleixEstat;
    });

    actualitzarEstadistiques(tasquesFiltrades);

    const icones = { alta: '🔥', mitjana: '⚡', baixa: '🍀' };

    tasquesFiltrades.forEach(tasca => {
        const div = document.createElement('div');
        div.className = `targeta-tasca ${tasca.prioritat}`;

        // --- DRAG & DROP (Issue 5) ---
        div.draggable = true;
        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', tasca.id);
            div.style.opacity = "0.5";
        };
        div.ondragend = () => div.style.opacity = "1";
        // -----------------------------

        const dataV = tasca.dataVenciment ? new Date(tasca.dataVenciment).toLocaleDateString() : '---';

        let botonsEstat = '';
        if (tasca.estat === 'perFer') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'enCurs')" title="Començar">➔</button>`;
        if (tasca.estat === 'enCurs') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'fet')" title="Finalitzar">➔</button>`;

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h3 style="margin:0;">${tasca.titol}</h3>
                <span class="badge-prioritat ${tasca.prioritat}">${icones[tasca.prioritat]} ${tasca.prioritat.toUpperCase()}</span>
            </div>
            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 0.9rem;">${tasca.descripcio || ''}</p>
            <div class="meta" style="font-size:0.8rem; color:#64748b; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                <span>📅 Vence: <strong>${dataV}</strong></span>
            </div>
            <div class="accions" style="display: flex; gap: 8px; margin-top: 12px;">
                ${botonsEstat}
                <button onclick="prepararEdicio(${tasca.id})">✏️ Editar</button>
                <button onclick="eliminarTasca(${tasca.id})">🗑️ Esborrar</button>
            </div>
        `;
        columnes[tasca.estat].appendChild(div);
    });
}

function actualitzarEstadistiques(tasquesFiltrades) {
    const total = llistaTasques.length;
    const fets = llistaTasques.filter(t => t.estat === 'fet').length;
    const perFer = llistaTasques.filter(t => t.estat === 'perFer').length;
    const enCurs = llistaTasques.filter(t => t.estat === 'enCurs').length;
    const proc = total === 0 ? 0 : Math.round((fets / total) * 100);

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-per-fer').textContent = perFer;
    document.getElementById('stat-en-curs').textContent = enCurs;
    document.getElementById('stat-fet').textContent = fets;
    document.getElementById('stat-progres').textContent = `${proc}%`;

    const contenidorFiltrat = document.getElementById('stats-filtrades');
    const hiHaFiltre = document.getElementById('filtre-text').value !== "" ||
        document.getElementById('filtre-estat').value !== "tots" ||
        document.getElementById('filtre-prioritat').value !== "totes";

    if (hiHaFiltre) {
        contenidorFiltrat.style.display = "";
        const fTotal = tasquesFiltrades.length;
        const fFets = tasquesFiltrades.filter(t => t.estat === 'fet').length;
        const fPerFer = tasquesFiltrades.filter(t => t.estat === 'perFer').length;
        const fEnCurs = tasquesFiltrades.filter(t => t.estat === 'enCurs').length;
        const fProc = fTotal === 0 ? 0 : Math.round((fFets / fTotal) * 100);

        document.getElementById('f-stat-total').textContent = fTotal;
        document.getElementById('f-stat-per-fer').textContent = fPerFer;
        document.getElementById('f-stat-en-curs').textContent = fEnCurs;
        document.getElementById('f-stat-fet').textContent = fFets;
        document.getElementById('f-stat-progres').textContent = `${fProc}%`;
    } else {
        contenidorFiltrat.style.display = "none";
    }
}

// 5. LÒGICA DE NEGOCI (CRUD)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const novaTasca = {
        id: id ? parseInt(id) : Date.now(),
        titol: document.getElementById('task-title').value,
        descripcio: document.getElementById('task-desc').value,
        dataVenciment: document.getElementById('task-date').value,
        prioritat: document.getElementById('task-priority').value,
        estat: document.getElementById('task-status').value,
        creatEl: id ? llistaTasques.find(t => t.id === parseInt(id)).creatEl : new Date().toISOString()
    };

    if (id) {
        llistaTasques = llistaTasques.map(t => t.id === parseInt(id) ? novaTasca : t);
    } else {
        llistaTasques.push(novaTasca);
    }

    guardarTasques(llistaTasques);
    tancarFormulari();
    renderTauler();
});

function moureTasca(id, nouEstat) {
    llistaTasques = llistaTasques.map(t => t.id === id ? { ...t, estat: nouEstat } : t);
    guardarTasques(llistaTasques);
    renderTauler();
}

function eliminarTasca(id) {
    if (confirm('Segur que vols eliminar aquesta tasca?')) {
        llistaTasques = llistaTasques.filter(t => t.id !== id);
        guardarTasques(llistaTasques);
        renderTauler();
    }
}

function prepararEdicio(id) {
    const tasca = llistaTasques.find(t => t.id === id);
    document.getElementById('task-title').value = tasca.titol;
    document.getElementById('task-desc').value = tasca.descripcio;
    document.getElementById('task-date').value = tasca.dataVenciment;
    document.getElementById('task-priority').value = tasca.prioritat;
    document.getElementById('task-status').value = tasca.estat;
    editIdInput.value = tasca.id;
    obrirFormulari();
    formTitle.textContent = "Editant Tasca";
    btnSave.textContent = "Guardar canvis";
}

function resetFormulari() {
    taskForm.reset();
    editIdInput.value = '';
    formTitle.textContent = "Nova Tasca";
    btnSave.textContent = "Afegir Tasca";
}

// 6. FUNCIONS DRAG & DROP (Issue 5)
function permetreSoltar(e) {
    e.preventDefault();
}

function soltarTasca(e, nouEstat) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    moureTasca(parseInt(id), nouEstat);
}

function inicialitzarApp() {
    llistaTasques = carregarTasques();
    renderTauler();
}

// EVENTS
document.addEventListener('DOMContentLoaded', inicialitzarApp);
btnCancel.addEventListener('click', tancarFormulari);
