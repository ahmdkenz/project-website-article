"use client";

import { useState } from "react";
import { useMode } from "@/context/ModeContext";

export default function ExpenseForm({ onCalculate }) {
  const [income, setIncome] = useState('');
  const [needs, setNeeds] = useState('');
  const [wants, setWants] = useState('');
  const { mode } = useMode();
  const isDarkMode = mode === "dark";
  
  // Format angka dengan pemisah ribuan
  function formatNumber(value) {
    if (!value && value !== 0) return "";
    // Pastikan value adalah string dan hapus semua titik yang ada
    const cleanValue = value.toString().replace(/\./g, "");
    // Format ulang dengan pemisah ribuan
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  // Parse string menjadi number
  function parseNumber(value) {
    if (typeof value === 'number') return value;
    // Hapus semua pemisah ribuan dan konversi ke number
    const parsed = (value || "").replace(/\./g, "");
    return parsed ? parseFloat(parsed) : 0;
  }

  // Handler untuk memformat input
  function handleNumberInput(value, setter) {
    // Hapus karakter non-digit dan titik
    const cleaned = value.replace(/[^\d.]/g, "");
    // Hapus semua titik
    const numberOnly = cleaned.replace(/\./g, "");
    // Set nilai baru
    setter(numberOnly);
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse semua nilai input
    const parsedIncome = parseNumber(income);
    const parsedNeeds = parseNumber(needs);
    const parsedWants = parseNumber(wants);
    
    // Validate inputs
    if (!income || !needs || !wants) {
      alert("Please fill in all fields");
      return;
    }
    
    if (parsedIncome <= 0 || parsedNeeds < 0 || parsedWants < 0) {
      alert("Please enter valid amounts (Income must be positive)");
      return;
    }
    
    if (parsedNeeds + parsedWants > parsedIncome) {
      alert("Your expenses exceed your income!");
      return;
    }
    
    // Call the parent component's calculation function dengan nilai yang sudah di-parse
    onCalculate(parsedIncome, parsedNeeds, parsedWants);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2 className={`expense-title ${isDarkMode ? "dark" : "light"}`}>
        <span role="img" aria-label="Input">📝</span> Input Your Expenses
      </h2>
      
      <div className="form-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">💵</span>
          <input 
            type="text" 
            id="income" 
            value={formatNumber(income)}
            onChange={(e) => handleNumberInput(e.target.value, setIncome)}
            placeholder="Monthly Income (Rp)" 
            className="modern-input"
            required
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
              border: isDarkMode ? "1px solid #555" : "1px solid #ccc"
            }}
          />
        </div>
      </div>
      
      <div className="form-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">🏠</span>
          <input 
            type="text" 
            id="needs" 
            value={formatNumber(needs)}
            onChange={(e) => handleNumberInput(e.target.value, setNeeds)}
            placeholder="Essential Expenses (Rp)" 
            className="modern-input"
            required
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
              border: isDarkMode ? "1px solid #555" : "1px solid #ccc"
            }}
          />
        </div>
      </div>
      
      <div className="form-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">🛍️</span>
          <input 
            type="text" 
            id="wants" 
            value={formatNumber(wants)}
            onChange={(e) => handleNumberInput(e.target.value, setWants)}
            placeholder="Lifestyle Expenses (Rp)" 
            className="modern-input"
            required
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
              border: isDarkMode ? "1px solid #555" : "1px solid #ccc"
            }}
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