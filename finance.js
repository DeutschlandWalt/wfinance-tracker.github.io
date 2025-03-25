let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// DOM-элементы
const modal = document.getElementById('transactionModal');
const addBtn = document.getElementById('addTransactionBtn');
const form = document.getElementById('transactionForm');
const tbody = document.querySelector('#transactionsTable tbody');
const balanceElement = document.getElementById('totalBalance');
const incomeElement = document.getElementById('totalIncome');
const expenseElement = document.getElementById('totalExpense');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

// Инициализация
function init() {
  renderTransactions();
  updateBalance();
  initChart();
  renderTodos();
  
  // Открытие модального окна
  addBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    document.getElementById('date').valueAsDate = new Date();
  });

  // Закрытие модального окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Добавление транзакции
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaction = {
      id: Date.now(),
      type: document.getElementById('type').value,
      amount: +document.getElementById('amount').value,
      category: document.getElementById('category').value,
      date: document.getElementById('date').value
    };
    
    transactions.push(transaction);
    saveTransactions();
    renderTransactions();
    updateBalance();
    updateChart();
    modal.style.display = 'none';
    form.reset();
  });

  // Добавление задачи
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const todo = {
      id: Date.now(),
      text: todoInput.value,
      completed: false
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
  });

  // Экспорт в CSV
  document.getElementById('exportBtn').addEventListener('click', () => {
    const csv = [
      ['Дата', 'Категория', 'Тип', 'Сумма'],
      ...transactions.map(t => [
        formatDate(t.date),
        t.category,
        t.type === 'income' ? 'Доход' : 'Расход',
        t.amount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  });
}

// Сохранение транзакций
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Сохранение задач
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Отрисовка транзакций
function renderTransactions() {
  tbody.innerHTML = transactions.map(transaction => `
    <tr>
      <td>${formatDate(transaction.date)}</td>
      <td>${transaction.category}</td>
      <td>
        <span class="${transaction.type}-badge">
          ${transaction.type === 'income' ? 'Доход' : 'Расход'}
        </span>
      </td>
      <td>${transaction.amount} $</td>
      <td>
        <button class="delete-btn" data-id="${transaction.id}">✕</button>
      </td>
    </tr>
  `).join('');

  // Удаление транзакций
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      transactions = transactions.filter(t => t.id !== +e.target.dataset.id);
      saveTransactions();
      renderTransactions();
      updateBalance();
      updateChart();
    });
  });
}

// Отрисовка задач
function renderTodos() {
  todoList.innerHTML = todos.map(todo => `
    <li class="todo-item">
      <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
      <span class="todo-text" style="${todo.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${todo.text}</span>
      <button class="todo-delete" data-id="${todo.id}">✕</button>
    </li>
  `).join('');

  // Удаление задач
  document.querySelectorAll('.todo-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      todos = todos.filter(t => t.id !== +e.target.dataset.id);
      saveTodos();
      renderTodos();
    });
  });

  // Переключение статуса задачи
  document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const todo = todos.find(t => t.id === +e.target.dataset.id);
      if (todo) {
        todo.completed = e.target.checked;
        saveTodos();
        renderTodos();
      }
    });
  });
}

// Обновление баланса
function updateBalance() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expense;
  
  incomeElement.textContent = `${income} $`;
  expenseElement.textContent = `${expense} $`;
  balanceElement.textContent = `${balance} $`;
}

// Форматирование даты
function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// График
let financeChart;

function initChart() {
  const ctx = document.getElementById('financeChart').getContext('2d');
  
  financeChart = new Chart(ctx, {
    type: 'bar',
    data: getChartData(),
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: {
          labels: {
            font: { family: 'Cinzel' }
          }
        }
      }
    }
  });
}

function getChartData() {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return {
    labels: last7Days.map(date => formatDate(date)),
    datasets: [
      {
        label: 'Доходы',
        data: last7Days.map(date => 
          transactions
            .filter(t => t.date === date && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: '#2a5a2a',
        borderColor: '#2a5a2a',
        borderWidth: 1
      },
      {
        label: 'Расходы',
        data: last7Days.map(date => 
          transactions
            .filter(t => t.date === date && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: '#800020',
        borderColor: '#800020',
        borderWidth: 1
      }
    ]
  };
}

function updateChart() {
  financeChart.data = getChartData();
  financeChart.update();
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);


