"use client";

import { useState } from "react";
import { useMode } from "@/context/ModeContext";

export default function ExpenseForm({ onCalculate }) {
  const [income, setIncome] = useState('');
  const [needs, setNeeds] = useState('');
  const [wants, setWants] = useState('');
  const { mode } = useMode();
  const isDarkMode = mode === "dark";
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!income || !needs || !wants) {
      alert("Please fill in all fields");
      return;
    }
    
    if (parseFloat(income) <= 0 || parseFloat(needs) < 0 || parseFloat(wants) < 0) {
      alert("Please enter valid amounts (Income must be positive)");
      return;
    }
    
    if (parseFloat(needs) + parseFloat(wants) > parseFloat(income)) {
      alert("Your expenses exceed your income!");
      return;
    }
    
    // Call the parent component's calculation function
    onCalculate(income, needs, wants);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2 style={{ color: "#000" }}>
        <span role="img" aria-label="Input">📝</span> Input Your Expenses
      </h2>
      
      <div className="form-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">💵</span>
          <input 
            type="number" 
            id="income" 
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Monthly Income (Rp)" 
            className="modern-input"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">🏠</span>
          <input 
            type="number" 
            id="needs" 
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            placeholder="Essential Expenses (Rp)" 
            className="modern-input"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">🛍️</span>
          <input 
            type="number" 
            id="wants" 
            value={wants}
            onChange={(e) => setWants(e.target.value)}
            placeholder="Lifestyle Expenses (Rp)" 
            className="modern-input"
            required
          />
        </div>
      </div>
      
      <button type="submit" className="modern-button">
        <span className="button-icon">✨</span>
        Calculate
      </button>
    </form>
  );
}