// 1. CONFIGURACIÓ I CONSTANTS
const STORAGE_KEY = 'tasquesKanban';
let llistaTasques = [];

// Selecció d'elements del DOM
const taskForm = document.getElementById('task-form');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const editIdInput = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');
const controls = document.getElementById('controls');
const taulerContainer = document.getElementById('tauler-container');

// 2. FUNCIONS D'INTERFÍCIE (MODAL I BLOQUEIG)
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

// 3. PERSISTÈNCIA (LOCALSTORAGE)
function carregarTasques() {
    const dades = localStorage.getItem(STORAGE_KEY);
    return dades ? JSON.parse(dades) : [];
}

function guardarTasques(tasques) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// 4. RENDERITZACIÓ DEL TAULER
function renderTauler() {
    const columnes = {
        perFer: document.querySelector('#per-fer .contenidor-tasques'),
        enCurs: document.querySelector('#en-curs .contenidor-tasques'),
        fet: document.querySelector('#fet .contenidor-tasques')
    };

    // Netejar columnes
    Object.values(columnes).forEach(c => c.innerHTML = '');

    // Icones per a la diferenciació visual (Issue 3)
    const icones = { alta: '🔥', mitjana: '⚡', baixa: '🍀' };

    llistaTasques.forEach(tasca => {
        const div = document.createElement('div');
        div.className = `targeta-tasca ${tasca.prioritat}`;

        // Format de data segur
        const dataV = (tasca.dataVenciment && tasca.dataVenciment !== "")
            ? new Date(tasca.dataVenciment).toLocaleDateString()
            : '---';

        // Lògica de botons de moviment ràpid
        let botonsEstat = '';
        if (tasca.estat === 'perFer') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'enCurs')" title="Començar">➔</button>`;
        if (tasca.estat === 'enCurs') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'fet')" title="Finalitzar">➔</button>`;

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h3 style="margin:0;">${tasca.titol}</h3>
                <span class="badge-prioritat ${tasca.prioritat}">
                    ${icones[tasca.prioritat]} ${tasca.prioritat.toUpperCase()}
                </span>
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

        if (columnes[tasca.estat]) {
            columnes[tasca.estat].appendChild(div);
        }
    });
}

// 5. LÒGICA DE NEGOCI (CRUD)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = editIdInput.value;
    const novaTasca = {
        id: id ? parseInt(id) : Date.now(),
        titol: document.getElementById('task-title').value,
        descripcio: document.getElementById('task-desc').value,
        dataVenciment: document.getElementById('task-date').value, // Obligatòria per HTML required
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
    if (!tasca) return;

    document.getElementById('task-title').value = tasca.titol;
    document.getElementById('task-desc').value = tasca.descripcio;
    document.getElementById('task-date').value = tasca.dataVenciment || '';
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

// 6. INICIALITZACIÓ
function inicialitzarApp() {
    llistaTasques = carregarTasques();

    // Dades inicials amb data per evitar camps buits
    if (llistaTasques.length === 0) {
        llistaTasques = [{
            id: 1,
            titol: 'Benvingut al Kanban',
            descripcio: 'Fes clic a + Nova Tasca per començar.',
            prioritat: 'baixa',
            estat: 'perFer',
            dataVenciment: new Date().toISOString().split('T')[0],
            creatEl: new Date().toISOString()
        }];
        guardarTasques(llistaTasques);
    }

    renderTauler();
}

// EVENTS
document.addEventListener('DOMContentLoaded', inicialitzarApp);
btnCancel.addEventListener('click', tancarFormulari);
