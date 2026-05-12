const STORAGE_KEY = 'tasquesKanban';
let llistaTasques = [];

const taskForm = document.getElementById('task-form');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const editIdInput = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');
const controls = document.getElementById('controls');
const taulerContainer = document.getElementById('tauler-container');

// Funcions Interfície
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

// Persistència
function carregarTasques() {
    const dades = localStorage.getItem(STORAGE_KEY);
    return dades ? JSON.parse(dades) : [];
}

function guardarTasques(tasques) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// Renderització
function renderTauler() {
    const columnes = {
        perFer: document.querySelector('#per-fer .contenidor-tasques'),
        enCurs: document.querySelector('#en-curs .contenidor-tasques'),
        fet: document.querySelector('#fet .contenidor-tasques')
    };

    Object.values(columnes).forEach(c => c.innerHTML = '');

    llistaTasques.forEach(tasca => {
        const div = document.createElement('div');
        div.className = `targeta-tasca ${tasca.prioritat}`;
        const dataV = tasca.dataVenciment ? new Date(tasca.dataVenciment).toLocaleDateString() : '---';

        let botonsEstat = '';
        if (tasca.estat === 'perFer') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'enCurs')">➔</button>`;
        if (tasca.estat === 'enCurs') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'fet')">➔</button>`;

        div.innerHTML = `
            <h3>${tasca.titol}</h3>
            <p>${tasca.descripcio || ''}</p>
            <div class="meta" style="font-size:0.8rem; color:#888;">
                Vence: ${dataV} | Prio: ${tasca.prioritat}
            </div>
            <div class="accions">
                ${botonsEstat}
                <button onclick="prepararEdicio(${tasca.id})">Editar</button>
                <button onclick="eliminarTasca(${tasca.id})">Esborrar</button>
            </div>
        `;
        columnes[tasca.estat].appendChild(div);
    });
}

// Lògica
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
    if (confirm('Eliminar tasca?')) {
        llistaTasques = llistaTasques.filter(t => t.id !== id);
        guardarTasques(llistaTasques);
        renderTauler();
    }
}

function prepararEdicio(id) {
    const tasca = llistaTasques.find(t => t.id === id);
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

function inicialitzarApp() {
    llistaTasques = carregarTasques();
    if (llistaTasques.length === 0) {
        llistaTasques = [{
            id: 1,
            titol: 'Benvingut',
            descripcio: 'Proba el sistema',
            prioritat: 'baixa',
            estat: 'perFer',
            dataVenciment: '2026-12-31', // <--- Afegeix aquesta línia
            creatEl: new Date().toISOString()
        }];
        guardarTasques(llistaTasques);
    }
    renderTauler();
}


document.addEventListener('DOMContentLoaded', inicialitzarApp);
btnCancel.addEventListener('click', tancarFormulari);

