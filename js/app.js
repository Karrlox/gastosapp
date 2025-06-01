// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, 
    onSnapshot, collection, query, where, getDocs, Timestamp, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// ¡¡¡REEMPLAZA ESTO CON TU CONFIGURACIÓN REAL DE FIREBASE!!!
const firebaseConfig = {
    apiKey: "AIzaSyCDBg8qM50VpW59IBQ94ZhLceq2sCwf1rc",
    authDomain: "gastosinmobiliaria.firebaseapp.com",
    projectId: "gastosinmobiliaria",
    storageBucket: "gastosinmobiliaria.firebasestorage.app",
    messagingSenderId: "690296047200",
    appId: "1:690296047200:web:b37efc46d3ae0dfe03e505",
};

// Global variables for Firebase
let app;
let db;
let auth;
let currentUserId = null; 
const appId = firebaseConfig.projectId;

// DOM Elements - Auth Section
const authSection = document.getElementById('authSection');
const mainAppContent = document.getElementById('mainAppContent');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const authEmailInput = document.getElementById('authEmail');
const authPasswordInput = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authMessage = document.getElementById('authMessage');
// const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn'); // Comentado para deshabilitar registro
let isLoginMode = true; 

// DOM Elements - Main App (Se inicializarán después del login)
let userEmailDisplay;
let logoutBtn;
let expenseForm, incomeForm, projectForm, budgetForm;
let expenseDescriptionInput, expenseAmountInput, expenseDateInput, expenseCategorySelect, expenseFrequencySelect, expenseProjectSelect;
let incomeDescriptionInput, incomeAmountInput, incomeDateInput, incomeCategorySelect, incomeFrequencySelect, incomeProjectSelect;
let projectNameInput, projectBudgetInput;
let budgetCategorySelectInput, budgetAmountInput;
let expensesList, incomeList, projectsList, budgetsList;
let totalExpensesDisplay, totalIncomeDisplay, balanceDisplay;
let noExpensesMessage, noIncomeMessage, noProjectsMessage, noBudgetsMessage;
let upcomingItemsList, noUpcomingMessage;
let filterExpenseCategory, filterExpenseDate, searchExpense;
let filterIncomeCategory, filterIncomeDate, searchIncome;
let tabTransactions, tabProjects, tabBudgets;
let transactionsSection, projectsSection, budgetsSection;
let subTabExpenses, subTabIncome;
let expenseContent, incomeContent;
let confirmationModal, closeConfirmationModal, confirmDeleteBtn, cancelDeleteBtn;
let editModal, closeEditModal, editForm, editModalTitle;
let editIdInput, editTypeInput, editDescriptionInput, editAmountInput, editDateInput, editCategorySelect, editFrequencySelect, editProjectSelect;
let editDescriptionContainer, editAmountContainer, editDateContainer, editCategoryContainer, editFrequencyContainer, editProjectContainer;
let categoryAnalysisModal, closeCategoryAnalysisModal, closeCategoryAnalysisModalBtn, categoryAnalysisContent;
let monthlyAnalysisModal, closeMonthlyAnalysisModal, closeMonthlyAnalysisModalBtn, monthlyAnalysisContentElement;
let itemToDelete = null;
let allExpenses = [];
let allIncomes = [];
let allProjects = [];
let allBudgets = [];

// --- Firebase Initialization and Authentication ---
const initializeFirebase = () => {
    try {
        if (!app) {
            app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
        }
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserId = user.uid;
                initializeMainAppDOMElements();
                userEmailDisplay.textContent = user.email || user.uid; 
                authSection.classList.add('hidden');
                mainAppContent.classList.remove('hidden');
                attachEventListeners();
                listenForExpenses();
                listenForIncomes();
                listenForProjects();
                listenForBudgets();
                switchMainTab('transactions');
                switchSubTab('expenses');
                if(expenseDateInput) expenseDateInput.valueAsDate = new Date();
                if(incomeDateInput) incomeDateInput.valueAsDate = new Date();
            } else {
                currentUserId = null;
                authSection.classList.remove('hidden');
                mainAppContent.classList.add('hidden');
                clearAppData();
            }
        });
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        if(authMessage) { 
            authMessage.textContent = `Error de Firebase: ${error.message}`;
            authMessage.classList.remove('hidden');
        }
    }
};

const initializeMainAppDOMElements = () => {
    userEmailDisplay = document.getElementById('userEmailDisplay');
    logoutBtn = document.getElementById('logoutBtn');
    expenseForm = document.getElementById('expenseForm');
    expenseDescriptionInput = document.getElementById('expenseDescription');
    expenseAmountInput = document.getElementById('expenseAmount');
    expenseDateInput = document.getElementById('expenseDate');
    expenseCategorySelect = document.getElementById('expenseCategory');
    expenseFrequencySelect = document.getElementById('expenseFrequency');
    expenseProjectSelect = document.getElementById('expenseProject');
    incomeForm = document.getElementById('incomeForm');
    incomeDescriptionInput = document.getElementById('incomeDescription');
    incomeAmountInput = document.getElementById('incomeAmount');
    incomeDateInput = document.getElementById('incomeDate');
    incomeCategorySelect = document.getElementById('incomeCategory');
    incomeFrequencySelect = document.getElementById('incomeFrequency');
    incomeProjectSelect = document.getElementById('incomeProject');
    projectForm = document.getElementById('projectForm');
    projectNameInput = document.getElementById('projectName');
    projectBudgetInput = document.getElementById('projectBudget');
    budgetForm = document.getElementById('budgetForm');
    budgetCategorySelectInput = document.getElementById('budgetCategory');
    budgetAmountInput = document.getElementById('budgetAmount');
    expensesList = document.getElementById('expensesList');
    incomeList = document.getElementById('incomeList');
    projectsList = document.getElementById('projectsList');
    budgetsList = document.getElementById('budgetsList');
    totalExpensesDisplay = document.getElementById('totalExpenses');
    totalIncomeDisplay = document.getElementById('totalIncome');
    balanceDisplay = document.getElementById('balance');
    noExpensesMessage = document.getElementById('noExpensesMessage');
    noIncomeMessage = document.getElementById('noIncomeMessage');
    noProjectsMessage = document.getElementById('noProjectsMessage');
    noBudgetsMessage = document.getElementById('noBudgetsMessage');
    upcomingItemsList = document.getElementById('upcomingItemsList');
    noUpcomingMessage = document.getElementById('noUpcomingMessage');
    filterExpenseCategory = document.getElementById('filterExpenseCategory');
    filterExpenseDate = document.getElementById('filterExpenseDate');
    searchExpense = document.getElementById('searchExpense');
    filterIncomeCategory = document.getElementById('filterIncomeCategory');
    filterIncomeDate = document.getElementById('filterIncomeDate');
    searchIncome = document.getElementById('searchIncome');
    tabTransactions = document.getElementById('tabTransactions');
    tabProjects = document.getElementById('tabProjects');
    tabBudgets = document.getElementById('tabBudgets');
    transactionsSection = document.getElementById('transactionsSection');
    projectsSection = document.getElementById('projectsSection');
    budgetsSection = document.getElementById('budgetsSection');
    subTabExpenses = document.getElementById('subTabExpenses');
    subTabIncome = document.getElementById('subTabIncome');
    expenseContent = document.getElementById('expenseContent');
    incomeContent = document.getElementById('incomeContent');
    confirmationModal = document.getElementById('confirmationModal');
    closeConfirmationModal = document.getElementById('closeConfirmationModal');
    confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    editModal = document.getElementById('editModal');
    editModalTitle = document.getElementById('editModalTitle');
    closeEditModal = document.getElementById('closeEditModal');
    editForm = document.getElementById('editForm');
    editIdInput = document.getElementById('editId');
    editTypeInput = document.getElementById('editType');
    editDescriptionInput = document.getElementById('editDescription');
    editAmountInput = document.getElementById('editAmount');
    editDateInput = document.getElementById('editDate');
    editCategorySelect = document.getElementById('editCategory');
    editFrequencySelect = document.getElementById('editFrequency');
    editProjectSelect = document.getElementById('editProject');
    editDescriptionContainer = document.getElementById('editDescriptionContainer');
    editAmountContainer = document.getElementById('editAmountContainer');
    editDateContainer = document.getElementById('editDateContainer');
    editCategoryContainer = document.getElementById('editCategoryContainer');
    editFrequencyContainer = document.getElementById('editFrequencyContainer');
    editProjectContainer = document.getElementById('editProjectContainer');
    categoryAnalysisModal = document.getElementById('categoryAnalysisModal');
    closeCategoryAnalysisModal = document.getElementById('closeCategoryAnalysisModal');
    closeCategoryAnalysisModalBtn = document.getElementById('closeCategoryAnalysisModalBtn');
    categoryAnalysisContent = document.getElementById('categoryAnalysisContent');
    monthlyAnalysisModal = document.getElementById('monthlyAnalysisModal');
    closeMonthlyAnalysisModal = document.getElementById('closeMonthlyAnalysisModal');
    closeMonthlyAnalysisModalBtn = document.getElementById('closeMonthlyAnalysisModalBtn');
    monthlyAnalysisContentElement = document.getElementById('monthlyAnalysisContentElement');
    document.getElementById('currentYear').textContent = new Date().getFullYear();
};

const clearAppData = () => {
    if(userEmailDisplay) userEmailDisplay.textContent = 'No autenticado';
    if (expensesList) expensesList.innerHTML = '<p class="text-gray-500 text-center">Inicia sesión para ver tus gastos.</p>';
    if (incomeList) incomeList.innerHTML = '<p class="text-gray-500 text-center">Inicia sesión para ver tus ingresos.</p>';
    if (projectsList) projectsList.innerHTML = '<p class="text-gray-500 text-center">Inicia sesión para ver tus proyectos.</p>';
    if (budgetsList) budgetsList.innerHTML = '<p class="text-gray-500 text-center">Inicia sesión para ver tus presupuestos.</p>';
    if (totalExpensesDisplay) totalExpensesDisplay.textContent = '€0.00';
    if (totalIncomeDisplay) totalIncomeDisplay.textContent = '€0.00';
    if (balanceDisplay) balanceDisplay.textContent = '€0.00';
    if (upcomingItemsList) upcomingItemsList.innerHTML = '<p class="text-gray-500 text-center">Inicia sesión para ver tus próximos pagos/cobros.</p>';
    allExpenses = []; allIncomes = []; allProjects = []; allBudgets = [];
};

// --- Authentication Functions ---
if (authForm) { // Check if authForm exists before adding listener
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        authMessage.classList.add('hidden'); 
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Auth error:", error.code, error.message);
            let userFriendlyMessage = "Ha ocurrido un error. Por favor, inténtalo de nuevo.";
            if (error.code === 'auth/invalid-email') {
                userFriendlyMessage = "Formato de email inválido.";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                userFriendlyMessage = "Email o contraseña incorrectos. Por favor, verifica tus credenciales.";
            } else if (error.code === 'auth/too-many-requests') {
                userFriendlyMessage = "Demasiados intentos fallidos. Por favor, inténtalo más tarde o restablece tu contraseña.";
            }
            authMessage.textContent = userFriendlyMessage;
            authMessage.classList.remove('hidden');
        }
    });
}

// const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn'); // Already declared earlier
// if (toggleAuthModeBtn) {
//     toggleAuthModeBtn.addEventListener('click', () => { // This logic is disabled as per requirements
//         isLoginMode = !isLoginMode;
//         authTitle.textContent = isLoginMode ? "Iniciar Sesión" : "Registrarse";
//         authSubmitBtn.textContent = isLoginMode ? "Iniciar Sesión" : "Registrarse";
//         toggleAuthModeBtn.textContent = isLoginMode ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión aquí";
//         authMessage.classList.add('hidden');
//         if(authForm) authForm.reset();
//     });
// }

// --- Generic Data Handling Functions (Firestore) ---
const getCollectionRef = (collectionName) => {
    if (!currentUserId) { console.error("No user authenticated for collection ref."); throw new Error("Usuario no autenticado"); }
    return collection(db, `artifacts/${appId}/users/${currentUserId}/${collectionName}`);
};
const getDocumentRef = (collectionName, id) => {
    if (!currentUserId) { console.error("No user authenticated for doc ref."); throw new Error("Usuario no autenticado"); }
    return doc(db, `artifacts/${appId}/users/${currentUserId}/${collectionName}`, id);
};
const addDocument = async (collectionName, data) => {
    try {
        const collRef = getCollectionRef(collectionName);
        await addDoc(collRef, { ...data, createdAt: serverTimestamp() });
        console.log(`${collectionName} añadido con éxito.`); return true;
    } catch (e) { console.error(`Error al añadir ${collectionName}: `, e); alert(`Error al añadir: ${e.message}`); return false; }
};
const deleteDocumentFromDb = async (collectionName, id) => {
    try {
        const docRef = getDocumentRef(collectionName, id);
        await deleteDoc(docRef);
        console.log(`${collectionName} con ID ${id} eliminado con éxito.`); return true;
    } catch (e) { console.error(`Error al eliminar ${collectionName}: `, e); alert(`Error al eliminar: ${e.message}`); return false; }
};
const updateDocumentInDb = async (collectionName, id, updatedData) => {
    try {
        const docRef = getDocumentRef(collectionName, id);
        await updateDoc(docRef, { ...updatedData, updatedAt: serverTimestamp() });
        console.log(`${collectionName} actualizado con éxito.`); return true;
    } catch (e) { console.error(`Error al actualizar ${collectionName}: `, e); alert(`Error al actualizar: ${e.message}`); return false; }
};

// --- Balance Update Function ---
const updateBalance = () => {
    if(!totalExpensesDisplay || !totalIncomeDisplay || !balanceDisplay) return;
    const totalExp = parseFloat(totalExpensesDisplay.textContent.replace('€', '')) || 0;
    const totalInc = parseFloat(totalIncomeDisplay.textContent.replace('€', '')) || 0;
    const currentBalance = totalInc - totalExp;
    balanceDisplay.textContent = `€${currentBalance.toFixed(2)}`;
    balanceDisplay.classList.toggle('text-red-700', currentBalance < 0);
    balanceDisplay.classList.toggle('text-green-700', currentBalance >= 0);
};

// --- Data Listeners and Renderers ---
const listenForExpenses = () => {
    if (!currentUserId) return;
    const q = query(getCollectionRef('expenses'), orderBy('date', 'desc'));
    onSnapshot(q, (snapshot) => {
        allExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderExpenses(allExpenses); updateUpcomingItems(); renderBudgets(); 
    }, (error) => { console.error("Error al escuchar gastos:", error); });
};
const listenForIncomes = () => {
    if (!currentUserId) return;
    const q = query(getCollectionRef('incomes'), orderBy('date', 'desc'));
    onSnapshot(q, (snapshot) => {
        allIncomes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderIncomes(allIncomes); updateUpcomingItems();
    }, (error) => { console.error("Error al escuchar ingresos:", error); });
};
const listenForProjects = () => {
    if (!currentUserId) return;
    const q = query(getCollectionRef('projects'), orderBy('name', 'asc'));
    onSnapshot(q, (snapshot) => {
        allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProjects(); populateProjectSelects();
    }, (error) => { console.error("Error al escuchar proyectos:", error); });
};
const listenForBudgets = () => {
    if (!currentUserId) return;
    const q = query(getCollectionRef('budgets'), orderBy('category', 'asc'));
    onSnapshot(q, (snapshot) => {
        allBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderBudgets();
    }, (error) => { console.error("Error al escuchar presupuestos:", error); });
};

// --- Rendering Functions ---
const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    if (dateString && dateString.toDate) return dateString.toDate().toLocaleDateString('es-ES'); // Check for toDate method
    const [year, month, day] = String(dateString).split('-'); // Ensure dateString is a string
    if(year && month && day) return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-ES');
    return String(dateString); // Fallback for other string formats or already formatted dates
};
const renderExpenses = (expensesToRender) => {
    if (!expensesList || !noExpensesMessage || !totalExpensesDisplay) return;
    let filteredExpenses = [...expensesToRender];
    if (filterExpenseCategory && filterExpenseCategory.value) filteredExpenses = filteredExpenses.filter(exp => exp.category === filterExpenseCategory.value);
    if (filterExpenseDate && filterExpenseDate.value) filteredExpenses = filteredExpenses.filter(exp => exp.date === filterExpenseDate.value);
    if (searchExpense && searchExpense.value) {
        const searchQuery = searchExpense.value.toLowerCase();
        filteredExpenses = filteredExpenses.filter(exp => exp.description.toLowerCase().includes(searchQuery) || exp.category.toLowerCase().includes(searchQuery));
    }
    expensesList.innerHTML = ''; let total = 0;
    if (filteredExpenses.length === 0) noExpensesMessage.classList.remove('hidden');
    else {
        noExpensesMessage.classList.add('hidden');
        filteredExpenses.forEach(expense => {
            total += parseFloat(expense.amount) || 0;
            const projectName = expense.project ? (allProjects.find(p => p.id === expense.project)?.name || 'Asignado (Proyecto eliminado)') : 'N/A';
            const item = document.createElement('div'); item.className = 'bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm';
            item.innerHTML = `<div class="flex-grow mb-2 sm:mb-0"><p class="text-lg font-semibold text-gray-800">${expense.description}</p><p class="text-sm text-gray-600">Categoría: <span class="font-medium">${expense.category}</span> | Fecha: <span class="font-medium">${formatDateForDisplay(expense.date)}</span></p><p class="text-xs text-gray-500">Frecuencia: ${expense.frequency || 'Momentáneo'} | Proyecto: ${projectName}</p></div><div class="flex items-center space-x-3 mt-2 sm:mt-0"><p class="text-xl font-bold text-red-600">€${(parseFloat(expense.amount) || 0).toFixed(2)}</p><button class="btn-secondary px-3 py-1 text-xs edit-btn" data-id="${expense.id}" data-type="expenses">Editar</button><button class="btn-danger px-3 py-1 text-xs delete-btn" data-id="${expense.id}" data-type="expenses">Eliminar</button></div>`;
            expensesList.appendChild(item);
        });
    }
    totalExpensesDisplay.textContent = `€${total.toFixed(2)}`; updateBalance();
};
const renderIncomes = (incomesToRender) => {
    if (!incomeList || !noIncomeMessage || !totalIncomeDisplay) return;
    let filteredIncomes = [...incomesToRender];
    if (filterIncomeCategory && filterIncomeCategory.value) filteredIncomes = filteredIncomes.filter(inc => inc.category === filterIncomeCategory.value);
    if (filterIncomeDate && filterIncomeDate.value) filteredIncomes = filteredIncomes.filter(inc => inc.date === filterIncomeDate.value);
    if (searchIncome && searchIncome.value) {
        const searchQuery = searchIncome.value.toLowerCase();
        filteredIncomes = filteredIncomes.filter(inc => inc.description.toLowerCase().includes(searchQuery) || inc.category.toLowerCase().includes(searchQuery));
    }
    incomeList.innerHTML = ''; let total = 0;
    if (filteredIncomes.length === 0) noIncomeMessage.classList.remove('hidden');
    else {
        noIncomeMessage.classList.add('hidden');
        filteredIncomes.forEach(income => {
            total += parseFloat(income.amount) || 0;
            const projectName = income.project ? (allProjects.find(p => p.id === income.project)?.name || 'Asignado (Proyecto eliminado)') : 'N/A';
            const item = document.createElement('div'); item.className = 'bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm';
            item.innerHTML = `<div class="flex-grow mb-2 sm:mb-0"><p class="text-lg font-semibold text-gray-800">${income.description}</p><p class="text-sm text-gray-600">Categoría: <span class="font-medium">${income.category}</span> | Fecha: <span class="font-medium">${formatDateForDisplay(income.date)}</span></p><p class="text-xs text-gray-500">Frecuencia: ${income.frequency || 'Momentáneo'} | Proyecto: ${projectName}</p></div><div class="flex items-center space-x-3 mt-2 sm:mt-0"><p class="text-xl font-bold text-green-600">€${(parseFloat(income.amount) || 0).toFixed(2)}</p><button class="btn-secondary px-3 py-1 text-xs edit-btn" data-id="${income.id}" data-type="incomes">Editar</button><button class="btn-danger px-3 py-1 text-xs delete-btn" data-id="${income.id}" data-type="incomes">Eliminar</button></div>`;
            incomeList.appendChild(item);
        });
    }
    totalIncomeDisplay.textContent = `€${total.toFixed(2)}`; updateBalance();
};
const renderProjects = () => {
    if (!projectsList || !noProjectsMessage) return;
    projectsList.innerHTML = '';
    if (allProjects.length === 0) noProjectsMessage.classList.remove('hidden');
    else {
        noProjectsMessage.classList.add('hidden');
        allProjects.forEach(project => {
            const projectExpenses = allExpenses.filter(exp => exp.project === project.id).reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
            const projectIncomes = allIncomes.filter(inc => inc.project === project.id).reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
            const projectBalance = projectIncomes - projectExpenses;
            const item = document.createElement('div'); item.className = 'bg-blue-50 p-4 rounded-lg shadow-sm';
            item.innerHTML = `<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2"><p class="text-lg font-semibold text-blue-800">${project.name}</p><div class="flex items-center space-x-2 mt-2 sm:mt-0"><button class="btn-secondary px-3 py-1 text-xs edit-btn" data-id="${project.id}" data-type="projects">Editar</button><button class="btn-danger px-3 py-1 text-xs delete-btn" data-id="${project.id}" data-type="projects">Eliminar</button></div></div><p class="text-sm text-blue-700">Presupuesto Estimado: €${project.budget ? (parseFloat(project.budget) || 0).toFixed(2) : 'N/A'}</p><p class="text-sm text-blue-700">Gastos Totales: <span class="font-bold text-red-600">€${projectExpenses.toFixed(2)}</span></p><p class="text-sm text-blue-700">Ingresos Totales: <span class="font-bold text-green-600">€${projectIncomes.toFixed(2)}</span></p><p class="text-sm text-blue-700">Balance: <span class="font-bold ${projectBalance < 0 ? 'text-red-600' : 'text-green-600'}">€${projectBalance.toFixed(2)}</span></p>`;
            projectsList.appendChild(item);
        });
    }
};
const renderBudgets = () => {
    if (!budgetsList || !noBudgetsMessage) return;
    budgetsList.innerHTML = '';
    if (allBudgets.length === 0) noBudgetsMessage.classList.remove('hidden');
    else {
        noBudgetsMessage.classList.add('hidden');
        const currentMonth = new Date().toISOString().slice(0, 7);
        const expensesThisMonthByCategory = {};
        allExpenses.forEach(exp => { if (exp.date && String(exp.date).startsWith(currentMonth)) expensesThisMonthByCategory[exp.category] = (expensesThisMonthByCategory[exp.category] || 0) + (parseFloat(exp.amount) || 0); });
        allBudgets.forEach(budget => {
            const spent = expensesThisMonthByCategory[budget.category] || 0;
            const budgetAmount = parseFloat(budget.amount) || 0;
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            const isOverBudget = spent > budgetAmount;
            const item = document.createElement('div'); item.className = 'bg-gray-50 p-4 rounded-lg shadow-sm';
            item.innerHTML = `<div class="flex justify-between items-center mb-2"><p class="text-lg font-semibold text-gray-800">${budget.category}</p><div class="flex items-center space-x-2"><p class="text-sm text-gray-600">Presupuesto: <span class="font-bold">€${budgetAmount.toFixed(2)}</span></p><button class="btn-secondary px-2 py-0.5 text-xs edit-btn" data-id="${budget.id}" data-type="budgets">Editar</button><button class="btn-danger px-2 py-0.5 text-xs delete-btn" data-id="${budget.id}" data-type="budgets">Eliminar</button></div></div><div class="budget-bar-container"><div class="budget-bar-fill ${isOverBudget ? 'over-budget' : ''}" style="width: ${Math.min(percentage, 100)}%;"></div></div><p class="budget-text text-gray-700">Gastado este mes: <span class="font-bold">€${spent.toFixed(2)}</span> (${percentage.toFixed(1)}%)</p>${isOverBudget ? '<p class="text-red-500 font-semibold text-sm mt-1">¡Presupuesto excedido!</p>' : ''}`;
            budgetsList.appendChild(item);
        });
    }
};

// --- Project Select Population ---
const populateProjectSelects = () => {
    const projectSelectElements = [expenseProjectSelect, incomeProjectSelect, editProjectSelect];
    projectSelectElements.forEach(select => {
        if (!select) return;
        const currentSelectedValue = select.value;
        select.innerHTML = '<option value="">Ninguno</option>'; 
        allProjects.forEach(project => { const option = document.createElement('option'); option.value = project.id; option.textContent = project.name; select.appendChild(option); });
        if (allProjects.some(p => p.id === currentSelectedValue)) select.value = currentSelectedValue;
        else select.value = "";
    });
};

// --- Upcoming Items Logic ---
const calculateNextDueDate = (lastDateStr, frequency) => {
    if (!lastDateStr) return null;
    const lastDate = new Date(String(lastDateStr) + 'T00:00:00Z'); 
    if (isNaN(lastDate.getTime())) return null;
    const nextDate = new Date(lastDate);
    switch (frequency) {
        case 'Semanal': nextDate.setDate(lastDate.getDate() + 7); break;
        case 'Mensual': nextDate.setMonth(lastDate.getMonth() + 1); break;
        case 'Anual': nextDate.setFullYear(lastDate.getFullYear() + 1); break;
        default: return null;
    }
    return nextDate;
};
const updateUpcomingItems = () => {
    if(!upcomingItemsList || !noUpcomingMessage) return;
    upcomingItemsList.innerHTML = '';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today); sevenDaysFromNow.setDate(today.getDate() + 7);
    let hasUpcoming = false; const upcomingBuffer = [];
    const processItem = (item, type) => {
        if (item.frequency !== 'Momentáneo' && item.date) {
            let nextDueDate = calculateNextDueDate(item.date, item.frequency); if (!nextDueDate) return;
            while (nextDueDate && nextDueDate < today) { nextDueDate = calculateNextDueDate(nextDueDate.toISOString().split('T')[0], item.frequency); if(!nextDueDate) break; }
            if (nextDueDate && nextDueDate >= today && nextDueDate <= sevenDaysFromNow) { hasUpcoming = true; upcomingBuffer.push({ item, type, nextDueDate }); }
        }
    };
    allExpenses.forEach(exp => processItem(exp, 'expenses')); allIncomes.forEach(inc => processItem(inc, 'incomes'));
    upcomingBuffer.sort((a,b) => a.nextDueDate - b.nextDueDate);
    upcomingBuffer.forEach(({item, type, nextDueDate}) => {
        const itemElement = document.createElement('div');
        itemElement.className = `p-3 rounded-md flex justify-between items-center text-sm shadow-sm ${type === 'expenses' ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-green-50 hover:bg-green-100'}`;
        const textColor = type === 'expenses' ? 'text-yellow-700' : 'text-green-700'; const amountColor = type === 'expenses' ? 'text-red-600' : 'text-green-600';
        itemElement.innerHTML = `<p class="font-medium ${textColor}">${type === 'expenses' ? 'Gasto Próximo' : 'Ingreso Próximo'}: ${item.description} (${item.category})</p><p class="${textColor}">Vence: ${nextDueDate.toLocaleDateString('es-ES')} (${item.frequency}) - <span class="font-bold ${amountColor}">€${(parseFloat(item.amount) || 0).toFixed(2)}</span></p>`;
        upcomingItemsList.appendChild(itemElement);
    });
    if (!hasUpcoming) noUpcomingMessage.classList.remove('hidden'); else noUpcomingMessage.classList.add('hidden');
};

// --- Analysis Modals ---
const showCategoryAnalysis = () => {
    if (!categoryAnalysisModal || !categoryAnalysisContent) return;
    if (allExpenses.length === 0) { categoryAnalysisContent.innerHTML = "<p class='text-center text-gray-600'>No hay gastos para analizar.</p>"; categoryAnalysisModal.style.display = 'flex'; return; }
    const expensesByCategory = {};
    allExpenses.forEach(exp => { expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + (parseFloat(exp.amount) || 0); });
    let html = '<h3 class="text-xl font-semibold mb-4 text-center text-indigo-700">Gastos por Categoría</h3>'; html += '<div class="bar-chart-container">';
    const maxAmount = Math.max(0, ...Object.values(expensesByCategory));
    Object.keys(expensesByCategory).sort().forEach(category => {
        const amount = expensesByCategory[category]; const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
        html += `<div class="bar-item"><span class="bar-label">${category}:</span><div class="bar-fill bg-red-500" style="width: ${percentage.toFixed(1)}%;"></div><span class="bar-value">€${amount.toFixed(2)}</span></div>`;
    });
    html += '</div>'; categoryAnalysisContent.innerHTML = html; categoryAnalysisModal.style.display = 'flex';
};
const showMonthlyAnalysis = () => {
    if (!monthlyAnalysisModal || !monthlyAnalysisContentElement) return;
    if (allExpenses.length === 0) { monthlyAnalysisContentElement.innerHTML = "<p class='text-center text-gray-600'>No hay gastos para analizar.</p>"; monthlyAnalysisModal.style.display = 'flex'; return; }
    const expensesByMonth = {};
    allExpenses.forEach(exp => { if (!exp.date) return; const yearMonth = String(exp.date).slice(0, 7); expensesByMonth[yearMonth] = (expensesByMonth[yearMonth] || 0) + (parseFloat(exp.amount) || 0); });
    const sortedMonths = Object.keys(expensesByMonth).sort(); const maxAmount = Math.max(0, ...Object.values(expensesByMonth));
    let html = '<h3 class="text-xl font-semibold mb-4 text-center text-indigo-700">Gastos por Mes</h3>'; html += '<div class="bar-chart-container">';
    sortedMonths.forEach(month => {
        const amount = expensesByMonth[month]; const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
        html += `<div class="bar-item"><span class="bar-label">${month}:</span><div class="bar-fill bg-red-500" style="width: ${percentage.toFixed(1)}%;"></div><span class="bar-value">€${amount.toFixed(2)}</span></div>`;
    });
    html += '</div>'; monthlyAnalysisContentElement.innerHTML = html; monthlyAnalysisModal.style.display = 'flex';
};

// --- Tab Switching ---
const switchMainTab = (activeTabId) => {
    const tabs = { transactions: transactionsSection, projects: projectsSection, budgets: budgetsSection };
    const buttons = { transactions: tabTransactions, projects: tabProjects, budgets: tabBudgets };
    for (const id in tabs) { if (!tabs[id] || !buttons[id]) continue; const isActive = id === activeTabId; tabs[id].classList.toggle('hidden', !isActive); buttons[id].classList.toggle('bg-indigo-600', isActive); buttons[id].classList.toggle('text-white', isActive); buttons[id].classList.toggle('bg-gray-200', !isActive); buttons[id].classList.toggle('text-gray-700', !isActive); }
};
const switchSubTab = (activeSubTabId) => {
    const contents = { expenses: expenseContent, income: incomeContent };
    const buttons = { expenses: subTabExpenses, income: subTabIncome };
    for (const id in contents) { if (!contents[id] || !buttons[id]) continue; const isActive = id === activeSubTabId; contents[id].classList.toggle('hidden', !isActive); buttons[id].classList.toggle('bg-indigo-600', isActive); buttons[id].classList.toggle('text-white', isActive); buttons[id].classList.toggle('bg-gray-200', !isActive); buttons[id].classList.toggle('text-gray-700', !isActive); }
};

// --- Edit Modal Population ---
async function openEditModal(itemId, itemType) {
    if (!currentUserId || !editModal || !editForm) return;
    try {
        const docRef = getDocumentRef(itemType, itemId); const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const itemData = docSnap.data(); editIdInput.value = itemId; editTypeInput.value = itemType; editModalTitle.textContent = `Editar ${itemType === 'projects' ? 'Proyecto/Propiedad' : itemType === 'budgets' ? 'Presupuesto' : itemType.slice(0, -1)}`;
            [editDescriptionContainer, editAmountContainer, editDateContainer, editCategoryContainer, editFrequencyContainer, editProjectContainer].forEach(el => { if(el) el.style.display = 'block';}); 
            if(editCategorySelect) editCategorySelect.innerHTML = ''; if(editCategorySelect) editCategorySelect.disabled = false;

            if (itemType === 'expenses' || itemType === 'incomes') {
                if(editDescriptionInput) editDescriptionInput.value = itemData.description || ''; 
                if(editAmountInput) editAmountInput.value = (parseFloat(itemData.amount) || 0).toString(); 
                if(editDateInput) editDateInput.value = itemData.date || '';
                const categorySource = itemType === 'expenses' ? expenseCategorySelect : incomeCategorySelect;
                if(categorySource && editCategorySelect) Array.from(categorySource.options).forEach(opt => { if(opt.value) editCategorySelect.add(new Option(opt.text, opt.value)); });
                if(editCategorySelect) editCategorySelect.value = itemData.category || ''; 
                if(editFrequencySelect) editFrequencySelect.value = itemData.frequency || 'Momentáneo';
                populateProjectSelects(); 
                if(editProjectSelect) editProjectSelect.value = itemData.project || "";
            } else if (itemType === 'projects') {
                if(editDescriptionInput) editDescriptionInput.value = itemData.name || ''; 
                if(editAmountInput) editAmountInput.value = (parseFloat(itemData.budget) || 0).toString();
                [editDateContainer, editCategoryContainer, editFrequencyContainer, editProjectContainer].forEach(el => {if(el) el.style.display = 'none';});
            } else if (itemType === 'budgets') {
                if(expenseCategorySelect && editCategorySelect) Array.from(expenseCategorySelect.options).forEach(opt => { if(opt.value) editCategorySelect.add(new Option(opt.text, opt.value)); });
                if(editCategorySelect) editCategorySelect.value = itemData.category || ''; 
                if(editCategorySelect) editCategorySelect.disabled = true;
                if(editAmountInput) editAmountInput.value = (parseFloat(itemData.amount) || 0).toString();
                [editDescriptionContainer, editDateContainer, editFrequencyContainer, editProjectContainer].forEach(el => {if(el) el.style.display = 'none';});
            }
            editModal.style.display = 'flex';
        } else { console.error("Documento no encontrado para editar."); alert("No se pudo cargar el ítem."); }
    } catch (error) { console.error("Error al abrir modal de edición: ", error); alert("Error al cargar datos para edición."); }
}

// --- Event Listeners Attachment ---
const attachEventListeners = () => {
    if (!logoutBtn || !mainAppContent) { console.warn("Main app DOM not fully initialized for event listeners."); return; }
    
    // Clone and replace logoutBtn to ensure only one listener is attached
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    logoutBtn = newLogoutBtn; 
    logoutBtn.addEventListener('click', async () => { try { await signOut(auth); console.log("Sesión cerrada."); } catch (error) { console.error("Error al cerrar sesión:", error); }});
    
    if(tabTransactions) tabTransactions.addEventListener('click', () => switchMainTab('transactions')); 
    if(tabProjects) tabProjects.addEventListener('click', () => switchMainTab('projects')); 
    if(tabBudgets) tabBudgets.addEventListener('click', () => switchMainTab('budgets'));
    if(subTabExpenses) subTabExpenses.addEventListener('click', () => switchSubTab('expenses')); 
    if(subTabIncome) subTabIncome.addEventListener('click', () => switchSubTab('income'));
    
    if(expenseForm) expenseForm.addEventListener('submit', async (e) => { e.preventDefault(); if (await addDocument('expenses', { description: expenseDescriptionInput.value, amount: parseFloat(expenseAmountInput.value), date: expenseDateInput.value, category: expenseCategorySelect.value, frequency: expenseFrequencySelect.value, project: expenseProjectSelect.value || null })) expenseForm.reset(); });
    if(incomeForm) incomeForm.addEventListener('submit', async (e) => { e.preventDefault(); if (await addDocument('incomes', { description: incomeDescriptionInput.value, amount: parseFloat(incomeAmountInput.value), date: incomeDateInput.value, category: incomeCategorySelect.value, frequency: incomeFrequencySelect.value, project: incomeProjectSelect.value || null })) incomeForm.reset(); });
    if(projectForm) projectForm.addEventListener('submit', async (e) => { e.preventDefault(); if (projectNameInput.value && await addDocument('projects', { name: projectNameInput.value, budget: parseFloat(projectBudgetInput.value) || 0 })) projectForm.reset(); });
    if(budgetForm) budgetForm.addEventListener('submit', async (e) => { e.preventDefault(); const category = budgetCategorySelectInput.value; const amount = parseFloat(budgetAmountInput.value); if (category && !isNaN(amount)) { const existingBudget = allBudgets.find(b => b.category === category); if (existingBudget) { if (await updateDocumentInDb('budgets', existingBudget.id, { amount })) budgetForm.reset(); } else { if (await addDocument('budgets', { category, amount })) budgetForm.reset(); } } });
    
    if(filterExpenseCategory) filterExpenseCategory.addEventListener('change', () => renderExpenses(allExpenses)); // Use 'change' for select
    if(filterExpenseDate) filterExpenseDate.addEventListener('change', () => renderExpenses(allExpenses)); // Use 'change' for date
    if(searchExpense) searchExpense.addEventListener('input', () => renderExpenses(allExpenses));
    if(filterIncomeCategory) filterIncomeCategory.addEventListener('change', () => renderIncomes(allIncomes));
    if(filterIncomeDate) filterIncomeDate.addEventListener('change', () => renderIncomes(allIncomes));
    if(searchIncome) searchIncome.addEventListener('input', () => renderIncomes(allIncomes));
    
    if(closeConfirmationModal) closeConfirmationModal.addEventListener('click', () => { confirmationModal.style.display = 'none'; itemToDelete = null; });
    if(cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => { confirmationModal.style.display = 'none'; itemToDelete = null; });
    if(confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', async () => { if (itemToDelete) { await deleteDocumentFromDb(itemToDelete.type, itemToDelete.id); confirmationModal.style.display = 'none'; itemToDelete = null; } });
    
    if(closeEditModal) closeEditModal.addEventListener('click', () => { editModal.style.display = 'none'; if(editCategorySelect) editCategorySelect.disabled = false; });
    if(editForm) editForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const id = editIdInput.value; const type = editTypeInput.value; let updatedData = {};
        if (type === 'expenses' || type === 'incomes') updatedData = { description: editDescriptionInput.value, amount: parseFloat(editAmountInput.value), date: editDateInput.value, category: editCategorySelect.value, frequency: editFrequencySelect.value, project: editProjectSelect.value || null };
        else if (type === 'projects') updatedData = { name: editDescriptionInput.value, budget: parseFloat(editAmountInput.value) || 0 };
        else if (type === 'budgets') updatedData = { category: editCategorySelect.value, amount: parseFloat(editAmountInput.value) }; 
        if (await updateDocumentInDb(type, id, updatedData)) { editModal.style.display = 'none'; if(editCategorySelect) editCategorySelect.disabled = false; }
    });
    
    const showCatAnalysisBtn = document.getElementById('showCategoryAnalysisBtn');
    if(showCatAnalysisBtn) showCatAnalysisBtn.addEventListener('click', showCategoryAnalysis);
    if(closeCategoryAnalysisModal) closeCategoryAnalysisModal.addEventListener('click', () => { categoryAnalysisModal.style.display = 'none'; });
    if(closeCategoryAnalysisModalBtn) closeCategoryAnalysisModalBtn.addEventListener('click', () => { categoryAnalysisModal.style.display = 'none'; });
    
    const showMonthAnalysisBtn = document.getElementById('showMonthlyAnalysisBtn');
    if(showMonthAnalysisBtn) showMonthAnalysisBtn.addEventListener('click', showMonthlyAnalysis);
    if(closeMonthlyAnalysisModal) closeMonthlyAnalysisModal.addEventListener('click', () => { monthlyAnalysisModal.style.display = 'none'; });
    if(closeMonthlyAnalysisModalBtn) closeMonthlyAnalysisModalBtn.addEventListener('click', () => { monthlyAnalysisModal.style.display = 'none'; });
    
    mainAppContent.addEventListener('click', (e) => {
        const target = e.target.closest('button'); if (!target) return;
        if (target.classList.contains('delete-btn')) { const id = target.dataset.id; const type = target.dataset.type; if (id && type) { itemToDelete = { id, type }; confirmationModal.style.display = 'flex'; }}
        else if (target.classList.contains('edit-btn')) { const id = target.dataset.id; const type = target.dataset.type; if (id && type) { openEditModal(id, type); }}
    });
};

// Initialize Firebase on window load
window.onload = initializeFirebase;