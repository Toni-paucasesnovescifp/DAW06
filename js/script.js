// 1. Configuració i Constants
const STORAGE_KEY = 'tasquesKanban';

// 2. Model de dades (Exemple d'estructura d'una tasca)
/*
{
    id: Date.now(),
    titol: 'Exemple de tasca',
    descripcio: 'Descripció detallada',
    prioritat: 'mitjana', // baixa, mitjana, alta
    dataVenciment: '2024-12-31',
    estat: 'perFer', // perFer, enCurs, fet
    creatEl: new Date().toISOString()
}
*/

// 3. Funcions de Persistència (localStorage)
function carregarTasques() {
    const dades = localStorage.getItem(STORAGE_KEY);
    // Si hi ha dades, les convertim d'String a Objecte, si no, retornem un array buit
    return dades ? JSON.parse(dades) : [];
}

function guardarTasques(tasques) {
    // Convertim l'objecte a String per poder guardar-lo a localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// 4. Inicialització de l'App
let llistaTasques = [];

function inicialitzarApp() {
    llistaTasques = carregarTasques();

    // Afegir dades de prova si el localStorage està buit (opcional)
    if (llistaTasques.length === 0) {
        llistaTasques = [
            {
                id: 1,
                titol: 'Benvingut al Kanban',
                descripcio: 'Crea la teva primera tasca usant el formulari.',
                prioritat: 'baixa',
                dataVenciment: '2024-12-31',
                estat: 'perFer',
                creatEl: new Date().toISOString()
            }
        ];
        guardarTasques(llistaTasques);
    }

    console.log('Tasques carregades:', llistaTasques);
    // En la Issue 3 cridarem aquí a la funció de "renderitzar"
}

// Executar en carregar la pàgina
document.addEventListener('DOMContentLoaded', inicialitzarApp);
