// @ts-nocheck

import './style.css';
import categories from './categories.json';
import type { ITransaction, ITransactionList } from './models';

class BudgetTracker {
    private transactions: ITransactionList;
    private form: HTMLFormElement;
    private transactionList: HTMLElement;
    private balanceElement: HTMLElement;

    constructor() {
        this.transactions = this.loadTransactions();
        this.form = document.getElementById(
            'transactionForm',
        ) as HTMLFormElement;
        this.transactionList = document.getElementById(
            'transactionList',
        ) as HTMLDivElement;
        this.balanceElement = document.getElementById(
            'balance',
        ) as HTMLDivElement;

        this.initEventListeners();
        this.populateCategories();
        this.renderTransactions();
        this.updateBalance();
    }

    loadTransactions(): ITransactionList {
        const data = localStorage.getItem('transactions');
        return data ? JSON.parse(data) : [];
        // return JSON.parse(localStorage.getItem("transactions")) || [];
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

        (document.getElementById('comment') as HTMLInputElement).value = '';
        document.getElementById('expenseCategoryWrap').style.display = 'none';
        document.getElementById('incomeCategoryWrap').style.display = 'none';
    }

    addTransaction() {
        const typeElement = document.querySelector(
            'input[name="type"]:checked',
        ) as HTMLInputElement;
        const type = typeElement
            ? (typeElement.value as 'income' | 'expenses')
            : null;
        const amountInput = document.getElementById('amount') as HTMLDivElement;
        const amount = parseFloat(amountInput.value);

        const commentInput = document.getElementById(
            'comment',
        ) as HTMLInputElement;
        const comment = commentInput.value.trim();

        let category = '';
        if (type === 'expenses') {
            const select = document.getElementById(
                'expenses',
            ) as HTMLSelectElement;
            category = select.options[select.selectedIndex].text;
        } else if (type === 'income') {
            const select = document.getElementById(
                'income',
            ) as HTMLSelectElement;
            category = select.options[select.selectedIndex].text;
        }

        if (!type || category === '' || isNaN(amount)) {
            alert('Var snäll och lägg till en kategori och summa.');
            return;
        }

        const transaction = {
            id: Date.now(),
            description: category,
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
                const transactionDiv = document.createElement('div');
                transactionDiv.classList.add('transaction', transaction.type);
                transactionDiv.innerHTML = `
            <span class="transaction-date">${transaction.date}</span>
            <strong>${transaction.description}</strong>
            ${transaction.comment ? `<i>${transaction.comment}</i>` : ''}
            <span class="transaction-amount-container">
            ${Math.abs(transaction.amount).toFixed(2)} kr 
            <button class="delete-btn" data-id="${transaction.id}">Delete</button></span>`;
                this.transactionList.appendChild(transactionDiv);
            });
        this.attachDeleteEventListeners();
    }

    attachDeleteEventListeners() {
        this.transactionList
            .querySelectorAll('.delete-btn')
            .forEach((button) => {
                button.addEventListener('click', () => {
                    this.deleteTransactions(Number(button.dataset.id));
                });
            });
    }

    deleteTransactions(id: number): void {
        this.transactions = this.transactions.filter(
            (transaction) => transaction.id !== id,
        );

        this.saveTransactions();
        this.renderTransactions();
        this.updateBalance();
    }

    updateBalance() {
        const total = this.transactions.reduce(
            (acc, item) => acc + item.amount,
            0,
        );
        const expensesOnly = this.transactions
            .filter((item) => item.type === 'expenses')
            .reduce((acc, item) => acc + item.amount, 0);

        let balanceColor = 'inherit';

        if (total > 0) {
            balanceColor = 'var(--secondary-color)';
        } else if (total < 0) {
            balanceColor = 'var(--danger-color)';
        }

        this.balanceElement.innerHTML = `
    <p style="color: ${balanceColor};">Saldo: ${total.toFixed(2)} kr </p>
    <p>Utgifter: ${Math.abs(expensesOnly).toFixed(2)} kr</p>
    `;
    }

    populateCategories() {
        const expenseSelect = document.getElementById('expenses');
        const incomeSelect = document.getElementById('income');

        categories.expenses.forEach((cat) => {
            const option = new Option(cat, cat.toLowerCase());
            expenseSelect.add(option);
        });

        categories.income.forEach((cat) => {
            const option = new Option(cat, cat.toLowerCase());
            incomeSelect.add(option);
        });
    }
}

const budgetTracker = new BudgetTracker();

const typeRadios = document.querySelectorAll('input[name="type"]');
const expenseWrap = document.querySelector('#expenseCategoryWrap');
const incomeWrap = document.querySelector('#incomeCategoryWrap');

typeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        const selectedType = (e.target as HTMLInputElement).value;

        if (selectedType === 'expenses') {
            expenseWrap.style.display = 'block';
            incomeWrap.style.display = 'none';
        } else {
            expenseWrap.style.display = 'none';
            incomeWrap.style.display = 'block';
        }
    });
});
