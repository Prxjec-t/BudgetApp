// @ts-nocheck

import "./style.css";

class BudgetTracker {
  constructor() {
    this.transactions = this.loadTransactions();
    this.form = document.getElementById("transactionForm");
    this.transactionList = document.getElementById("transactionList");
    this.balanceElement = document.getElementById("balance");

    this.initEventListeners();
    this.renderTransactions();
    this.updateBalance();
  }

  loadTransactions() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  }

  saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  initEventListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addTransaction();
    });
  }

  clearForm() {
    document.getElementById("select").value = "";
    document.getElementById("amount").value = "";
  }

  addTransaction() {
    const select = document.getElementById("expenses").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    // const type = document.getElementById("type").value;

    if (!select || isNaN(amount)) {
      alert("Var snäll och lägg till en kategori och summa.");
      return;
    }

    const transaction = {
      id: Date.now(),
      description,
      amount: type === "expense" ? -amount : amount,
      type,
    };

    this.transactions.push(transaction);
    this.saveTransactions();
    this.renderTransactions();
    this.updateBalance();
    this.clearForm();
  }

  renderTransactions() {
    this.transactionList.innerHTML = "";
    this.transactions
      .slice()
      .sort((a, b) => b.id - a.id)
      .forEach((transaction) => {
        const transactionDiv = document.createElement("div");
        transactionDiv.classList.add("transaction", transaction.type);
        transactionDiv.innerHTML = `
            <span>${transaction.description}</span>
            <span class="transaction-amount-container">
            ${Math.abs(transaction.amount).toFixed(2)} kr 
            <button class="delete-btn" data-id="${transaction.id}">Delete</button></span>`;
        this.transactionList.appendChild(transactionDiv);
      });
    this.attachDeleteEventListeners();
  }

  attachDeleteEventListeners() {
    this.transactionList.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", () => {
        this.deleteTransactions(Number(button.dataset.id));
      });
    });
  }

  deleteTransactions(id) {
    this.transactions = this.transactions.filter(
      (transaction) => transaction.id !== id,
    );

    this.saveTransactions();
    this.renderTransactions();
    this.updateBalance();
  }

  updateBalance() {}
}

const budgetTracker = new BudgetTracker();

// const registerBtn = document.querySelector("#register");
// registerBtn.addEventListener("click", registerExpense);

// function registerExpense(e) {
//   e.preventDefault();

//   console.log("registrera belopp");
// }
