let transactions;
const data = localStorage.getItem("data");
  if(data){
     transactions = JSON.parse(data);
  }
  else{
  transactions = [
  { date: "2026-04-04", amount: 500, category: "Food", type: "expense" },
  { date: "2026-04-05", amount: 2000, category: "Salary", type: "income" }
];
}

let pieChart = null;
let lineChart = null;
let role = "viewer";


document.getElementById("role").addEventListener("change", (e) => {
  role = e.target.value;
  document.getElementById("adminPanel").style.display =
    role === "admin" ? "block" : "none";
});


const addBtn = document.getElementById("addButton");
   addBtn.addEventListener("click", addTransaction);
   
function addTransaction() {
  const txn = {
    date: document.getElementById("date").value,
    amount: Number(document.getElementById("amount").value) || 0,
    category: document.getElementById("category").value,
    type: document.getElementById("type").value
  };

  transactions.push(txn);
  localStorage.setItem("data", JSON.stringify(transactions));
  refreshAll();
}


function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("data", JSON.stringify(transactions));
  refreshAll();
}


function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(txn => {
    if (txn.type === "income") {
      income += txn.amount;
    } else {
      expense += txn.amount;
    }
  });

  document.getElementById("income").textContent = "₹" + income;
  document.getElementById("expense").textContent = "₹" + expense;
  document.getElementById("balance").textContent = "₹" + (income - expense);
}


function showTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  const search = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filter").value;

  let found = false;

  transactions.forEach((txn, index) => {
    const matchType = (filter === "all" || txn.type === filter);
    const matchSearch = txn.category.toLowerCase().includes(search);

    if (matchType && matchSearch) {
      found = true;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${txn.date}</td>
        <td>${txn.amount}</td>
        <td>${txn.category}</td>
        <td>${txn.type}</td>
        <td><button onclick="deleteTransaction(${index})">Delete</button></td>
      `;

      tbody.appendChild(row);
    }
  });

  if (!found) {
    tbody.innerHTML = "<tr><td colspan='5'>No Data</td></tr>";
  }
}


function showCharts() {
  if (pieChart) pieChart.destroy();
  if (lineChart) lineChart.destroy();

  const categoryMap = {};
  transactions.forEach(txn => {
  if (txn.type === "expense") {
    if (categoryMap[txn.category]) {
      categoryMap[txn.category] += txn.amount;
    } else {
      categoryMap[txn.category] = txn.amount;
    }
  }
});

  pieChart = new Chart(document.querySelector("#pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: ["#cb7286","#64abdb","#ffce56","#4caf50"],
        borderWidth : 2,
        borderColor : "#fff"
      }]
    }
  });

 const incomeData = transactions
  .filter(t => t.type === "income")
  .map(t => t.amount);

 const expenseData = transactions
  .filter(t => t.type === "expense")
  .map(t => t.amount);

 lineChart = new Chart(document.getElementById("lineChart"), {
  type: "line",
  data: {
    labels: transactions.map(t => t.date),
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "#4caf50",
        fill: false
      },
      {
        label: "Expense",
        data: expenseData,
        borderColor: "#e85f5f",
        fill: false
      }
    ]
  }
});

}


function showInsights() {
  const income = transactions
    .filter(txn => txn.type === "income")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const expense = transactions
    .filter(txn => txn.type === "expense")
    .reduce((sum, txn) => sum + txn.amount, 0);

  document.getElementById("insights").textContent =
    "Balance: ₹" + (income - expense);
}


document.querySelector("#search").addEventListener("input", showTable);
document.querySelector("#filter").addEventListener("change", showTable);


function  refreshAll() {
  updateSummary();
  showTable();
  showCharts();
  showInsights();
}

 refreshAll();
