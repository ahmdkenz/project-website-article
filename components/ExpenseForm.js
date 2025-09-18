"use client";

export default function ExpenseForm() {
  return (
    <form>
      <h2>Input Your Expenses</h2>
      <div>
        <label htmlFor="income">Monthly Income (Rp):</label>
        <input type="number" id="income" placeholder="e.g., 5000000" />
      </div>
      <div>
        <label htmlFor="needs">Essential Expenses (Rp):</label>
        <input type="number" id="needs" placeholder="e.g., 2000000" />
      </div>
      <div>
        <label htmlFor="wants">Lifestyle Expenses (Rp):</label>
        <input type="number" id="wants" placeholder="e.g., 1000000" />
      </div>
      <button type="submit">Calculate</button>
    </form>
  );
}