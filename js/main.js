let transactions = [];
const API_URL = './transacciones.json'; // Ruta del archivo JSON
let miGrafico; // Variable global para almacenar el gráfico

// Cargar transacciones desde el archivo JSON cuando la página se carga
document.addEventListener("DOMContentLoaded", loadTransactions);
document.getElementById("agregar-transaccion").addEventListener("click", addTransaction);
document.getElementById("Descripción").addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        addTransaction();
    }
});

// Cargar transacciones desde el archivo JSON
async function loadTransactions() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        transactions = data.transactions;
        updateSummary();
        updateTransactionList();
    } catch (error) {
        console.error('Error al cargar las transacciones:', error);
    }
}

// Agregar una nueva transacción
async function addTransaction() {
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
        
        await saveTransactions();
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
        type: 'pie', // Puedes cambiar a 'bar' si prefieres un gráfico de barras
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
async function removeTransaction(index) {
    transactions.splice(index, 1);
    await saveTransactions();
    updateSummary();
    updateTransactionList();
}

// Guarda las transacciones en el archivo JSON
async function saveTransactions() {
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transactions })
        });
    } catch (error) {
        console.error('Error al guardar las transacciones:', error);
    }
}
