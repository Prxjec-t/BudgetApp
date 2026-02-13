//@ts-nocheck

import './style.css';
import categories from './categories.json';
import type { ITransaction, ITransactionList } from './models';

class BudgetTracker {
  private transactions: ITransactionList;
  private form: HTMLFormElement | null;
  private transactionList: HTMLElement | null;
  private balanceElement: HTMLElement | null;

  constructor() {
    this.transactions = this.loadTransactions();
    this.form = document.getElementById('transactionForm');
    this.transactionList = document.getElementById('transactionList');
    this.balanceElement = document.getElementById('balance');

    if (this.form) {
      this.initEventListeners();
      this.populateCategories();
      this.renderTransactions();
      this.updateBalance();
    }
  }

  loadTransactions(): ITransactionList {
    const data = localStorage.getItem('transactions');
    return data ? JSON.parse(data) : [];
  }

  saveTransactions(): void {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
  }

  initEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTransaction();
    });
  }

  clearForm() {
    this.form.reset();

    document.getElementById('comment').value = '';
    document.getElementById('expenseCategoryWrap').style.display = 'none';
    document.getElementById('incomeCategoryWrap').style.display = 'none';
  }

  addTransaction() {
    const typeElement = document.querySelector('input[name="type"]:checked');
    const type = typeElement ? typeElement.value : null;
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);

    const selectId = type === 'expenses' ? 'expenses' : 'income';
    const select = document.getElementById(selectId);

    const categoryValue = select ? select.value : '';
    const categoryText = select ? select.options[select.selectedIndex].text : '';

    const commentInput = document.getElementById('comment');
    const comment = commentInput.value.trim();

    let category = '';
    if (type === 'expenses') {
      const select = document.getElementById('expenses');
      category = select.options[select.selectedIndex].text;
    } else if (type === 'income') {
      const select = document.getElementById('income');
      category = select.options[select.selectedIndex].text;
    }

    if (!type || categoryValue === '' || isNaN(amount) || amount <= 0) {
      this.showToast('Vänligen välj en kategori och ange ett belopp.');
      return;
    }

    this.showToast('Transaktion tillagd!', 'success');

    const transaction = {
      id: Date.now(),
      description: categoryText,
      amount: type === 'expenses' ? -amount : amount,
      type: type,
      date: new Date().toLocaleDateString('sv-SE'),
      comment: comment !== '' ? comment : undefined,
    };

    this.transactions.push(transaction);
    this.saveTransactions();
    this.renderTransactions();
    this.updateBalance();
    this.clearForm();
  }

  renderTransactions() {
    this.transactionList.innerHTML = '';

    this.transactions
      .slice()
      .sort((a, b) => b.id - a.id)
      .forEach((transaction) => {
        const formattedAmount = Math.abs(transaction.amount).toLocaleString('sv-SE', {
          minimumFractionDigits: 2,
        });

        const transactionDiv = document.createElement('div');
        transactionDiv.classList.add('transaction', transaction.type);
        transactionDiv.innerHTML = `
            <span class="transaction-date">${transaction.date}</span>
            <strong>${transaction.description}</strong>
            ${transaction.comment ? `<i>${transaction.comment}</i>` : ''}
            <span class="transaction-amount-container">
            ${formattedAmount} kr 
            <button class="delete-btn" data-id="${transaction.id}">Delete</button></span>`;
        this.transactionList.appendChild(transactionDiv);
      });

    this.attachDeleteEventListeners();
  }

  attachDeleteEventListeners() {
    this.transactionList.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', () => {
        this.deleteTransactions(Number((button as HTMLElement).dataset.id));
      });
    });
  }

  deleteTransactions(id: number): void {
    this.transactions = this.transactions.filter((transaction) => transaction.id !== id);
    this.saveTransactions();
    this.renderTransactions();
    this.updateBalance();
  }

  updateBalance(): void {
    const total: number = this.transactions.reduce((acc, item) => acc + item.amount, 0);
    const expensesOnly: number = this.transactions
      .filter((item) => item.type === 'expenses')
      .reduce((acc, item) => acc + item.amount, 0);

    const formattedTotal: string = total.toLocaleString('sv-SE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let balanceColor: string = 'inherit';

    if (total > 0) {
      balanceColor = 'var(--secondary-color)';
    } else if (total < 0) {
      balanceColor = 'var(--danger-color)';
    }

    if (this.balanceElement) {
      this.balanceElement.innerHTML = `
      <p style="color: ${balanceColor};">Saldo: ${formattedTotal} kr </p>
      <p>Utgifter: ${Math.abs(expensesOnly).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</p>
      `;
    }
  }

  populateCategories() {
    const expenseSelect = document.getElementById('expenses');
    const incomeSelect = document.getElementById('income');

    if (expenseSelect) {
      categories.expenses.forEach((cat) => {
        expenseSelect.add(new Option(cat, cat.toLowerCase()));
      });
    }
    if (incomeSelect) {
      categories.income.forEach((cat) => {
        incomeSelect.add(new Option(cat, cat.toLowerCase()));
      });
    }
  }

  showToast(message, type = 'error') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
}

const budgetTracker = new BudgetTracker();

const typeRadios = document.querySelectorAll('input[name="type"]');
const expenseWrap = document.querySelector('#expenseCategoryWrap');
const incomeWrap = document.querySelector('#incomeCategoryWrap');

typeRadios.forEach((radio) => {
  radio.addEventListener('change', (e) => {
    const selectedType = e.target.value;

    if (selectedType === 'expenses') {
      expenseWrap.style.display = 'block';
      incomeWrap.style.display = 'none';
    } else {
      expenseWrap.style.display = 'none';
      incomeWrap.style.display = 'block';
    }
  });
});

let isDarkMode = false;
const toggleButton = document.getElementById('toggleButton');

toggleButton.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  toggleButton.classList.toggle('active', isDarkMode);
});
