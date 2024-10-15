let transactions = [];
const LOCAL_STORAGE_KEY = 'transactions'; // Usar localStorage para almacenar transacciones
let miGrafico; // Variable global para almacenar el gráfico

// Cargar transacciones desde localStorage cuando la página se carga
document.addEventListener("DOMContentLoaded", loadTransactions);
document.getElementById("agregar-transaccion").addEventListener("click", addTransaction);
document.getElementById("Descripción").addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        addTransaction();
    }
});

// Cargar transacciones desde localStorage
function loadTransactions() {
    const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
    transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    updateSummary();
    updateTransactionList();
}

// Agregar una nueva transacción
function addTransaction() {
    const descriptionInput = document.getElementById("Descripción");
    const amountInput = document.getElementById("monto");
    const typeInput = document.getElementById("caja-eleccion");
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;

    if (description !== "" && !isNaN(amount) && amount > 0) {
        const newTransaction = { description, amount, type };
        transactions.push(newTransaction);
        descriptionInput.value = "";
        amountInput.value = "";
        
        saveTransactions();
        updateSummary();
        updateTransactionList();
    }
}

// Actualiza el resumen de ingresos y gastos
function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'Ingreso') {
            totalIncome += transaction.amount;
        } else if (transaction.type === 'Gasto') {
            totalExpenses += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    document.getElementById("ingreso-total").textContent = totalIncome.toFixed(2);
    document.getElementById("gasto-total").textContent = totalExpenses.toFixed(2);
    document.getElementById("balance").textContent = balance.toFixed(2);

    // Llamar a la función para crear el gráfico
    crearGrafico();
}

// Crea el gráfico de ingresos y gastos
function crearGrafico() {
    const ctx = document.getElementById('miGrafico').getContext('2d');
    const totalIncome = transactions.reduce((acc, transaction) => transaction.type === 'Ingreso' ? acc + transaction.amount : acc, 0);
    const totalExpenses = transactions.reduce((acc, transaction) => transaction.type === 'Gasto' ? acc + transaction.amount : acc, 0);

    // Destruir el gráfico anterior si existe
    if (miGrafico) {
        miGrafico.destroy();
    }

    // Crear un nuevo gráfico
    miGrafico = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                label: 'Total',
                data: [totalIncome, totalExpenses],
                backgroundColor: ['#4CAF50', '#F44336'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Gráfico de Ingresos y Gastos'
                }
            }
        }
    });
}

// Actualiza la lista de transacciones
function updateTransactionList() {
    const transactionList = document.getElementById("lista-transacciones");
    transactionList.innerHTML = "";

    transactions.forEach((transaction, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${transaction.description} - $${transaction.amount.toFixed(2)}`;
        listItem.classList.add(transaction.type);

        const removeButton = document.createElement("button");
        removeButton.textContent = "Eliminar";
        removeButton.classList.add("remove");
        removeButton.addEventListener("click", () => removeTransaction(index));

        listItem.appendChild(removeButton);
        transactionList.appendChild(listItem);
    });
}

// Elimina una transacción
function removeTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    updateSummary();
    updateTransactionList();
}

// Guarda las transacciones en localStorage
function saveTransactions() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
}

