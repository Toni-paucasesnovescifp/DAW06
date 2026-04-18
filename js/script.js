// 1. Configuració i Constants
const STORAGE_KEY = 'tasquesKanban';
let llistaTasques = [];

// Selecció d'elements del DOM
const taskForm = document.getElementById('task-form');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const editIdInput = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');

// 2. Funcions de Persistència
function carregarTasques() {
    const dades = localStorage.getItem(STORAGE_KEY);
    return dades ? JSON.parse(dades) : [];
}

function guardarTasques(tasques) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// 3. Funció de Renderització (CORREGIDA)
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

        // Data de venciment formatada
        const venciment = tasca.dataVenciment ? new Date(tasca.dataVenciment).toLocaleDateString() : 'Sense data';

        // Lògica del botó per moure d'estat
        let botonsEstat = '';
        if (tasca.estat === 'perFer') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'enCurs')">Començar ➔</button>`;
        if (tasca.estat === 'enCurs') botonsEstat = `<button onclick="moureTasca(${tasca.id}, 'fet')">Finalitzar ➔</button>`;

        div.innerHTML = `
            <h3>${tasca.titol}</h3>
            <p>${tasca.descripcio || ''}</p>
            <div class="meta">
                <span>Prioritat: <strong>${tasca.prioritat}</strong></span> | 
                <span>Vence: ${venciment}</span>
            </div>
            <div class="accions">
                ${botonsEstat}
                <button onclick="prepararEdicio(${tasca.id})">Editar</button>
                <button onclick="eliminarTasca(${tasca.id})">Eliminar</button>
            </div>
        `;

        if (columnes[tasca.estat]) {
            columnes[tasca.estat].appendChild(div);
        }
    });
}

// 4. Lògica del Formulari (ACTUALITZADA AMB DATA)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = editIdInput.value;
    const novaTasca = {
        id: id ? parseInt(id) : Date.now(),
        titol: document.getElementById('task-title').value,
        descripcio: document.getElementById('task-desc').value,
        dataVenciment: document.getElementById('task-date').value, // LLegim la data
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
    resetFormulari();
    renderTauler();
});

// 5. Funcions d'Acció
function eliminarTasca(id) {
    if (confirm('Segur que vols eliminar aquesta tasca?')) {
        llistaTasques = llistaTasques.filter(t => t.id !== id);
        guardarTasques(llistaTasques);
        renderTauler();
    }
}

// Funció per moure ràpidament de columna (NOVA)
function moureTasca(id, nouEstat) {
    llistaTasques = llistaTasques.map(t => t.id === id ? { ...t, estat: nouEstat } : t);
    guardarTasques(llistaTasques);
    renderTauler();
}

function prepararEdicio(id) {
    const tasca = llistaTasques.find(t => t.id === id);
    if (!tasca) return;

    document.getElementById('task-title').value = tasca.titol;
    document.getElementById('task-desc').value = tasca.descripcio;
    document.getElementById('task-date').value = tasca.dataVenciment || ''; // Posem la data
    document.getElementById('task-priority').value = tasca.prioritat;
    document.getElementById('task-status').value = tasca.estat;

    editIdInput.value = tasca.id;
    formTitle.textContent = "Editant Tasca";
    btnSave.textContent = "Guardar canvis";
    btnCancel.style.display = "inline";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormulari() {
    taskForm.reset();
    editIdInput.value = '';
    formTitle.textContent = "Nova Tasca";
    btnSave.textContent = "Afegir Tasca";
    btnCancel.style.display = "none";
}

// 6. Inicialització
function inicialitzarApp() {
    llistaTasques = carregarTasques();

    if (llistaTasques.length === 0) {
        llistaTasques = [
            {
                id: 1,
                titol: 'Benvingut al Kanban',
                descripcio: 'Tasca de prova inicial.',
                dataVenciment: '',
                prioritat: 'mitjana',
                estat: 'perFer',
                creatEl: new Date().toISOString()
            }
        ];
        guardarTasques(llistaTasques);
    }

    renderTauler();
}

document.addEventListener('DOMContentLoaded', inicialitzarApp);
btnCancel.addEventListener('click', resetFormulari);
