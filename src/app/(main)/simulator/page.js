"use client";

import { useState } from "react";
import { useMode } from "@/context/ModeContext";
import TabunganSimulator from "@/components/TabunganSimulator";
import LoanSimulator from "@/components/LoanSimulator";
import ExpenseForm from "@/components/ExpenseForm";
import PieChartVisualization from "@/components/PieChartVisualization";
import FriendlyReminder from "@/components/FriendlyReminder";
import "@/styles/simulator.css";

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState("tabungan");
  const [expenseData, setExpenseData] = useState({
    needs: 50,
    wants: 30,
    savings: 20
  });
  const [calculationResults, setCalculationResults] = useState(null);
  
  const { mode } = useMode();
  const isDarkMode = mode === "dark";
  
  // Function to handle expense calculation from the form
  const handleExpenseCalculation = (income, needs, wants) => {
    // Convert to numbers
    const incomeNum = parseFloat(income);
    const needsNum = parseFloat(needs);
    const wantsNum = parseFloat(wants);
    
    if (isNaN(incomeNum) || isNaN(needsNum) || isNaN(wantsNum)) {
      alert("Please enter valid numbers");
      return;
    }
    
    // Calculate percentages
    const totalExpenses = needsNum + wantsNum;
    const needsPercent = Math.round((needsNum / incomeNum) * 100);
    const wantsPercent = Math.round((wantsNum / incomeNum) * 100);
    const savingsPercent = 100 - needsPercent - wantsPercent;
    
    // Update state
    setExpenseData({
      needs: needsPercent,
      wants: wantsPercent,
      savings: savingsPercent
    });
    
    // Calculate savings amount
    const savingsAmount = incomeNum - totalExpenses;
    
    // Update calculation results
    setCalculationResults({
      income: incomeNum,
      needs: needsNum,
      wants: wantsNum,
      savings: savingsAmount,
      needsPercent,
      wantsPercent,
      savingsPercent
    });
  };
  
  return (
    <div className="main-container" style={{
      backgroundColor: isDarkMode ? "transparent" : "", // Set transparent background for dark mode
      color: isDarkMode ? "#e0e0e0" : "#333", // Adjusted text color for better contrast
      boxShadow: "none", // Removed box shadow
      border: "none" // Removed border
    }}>
      <div className="simulator-container" style={{
        backgroundColor: "transparent", // Ensure transparent background
        boxShadow: "none", // Removed box shadow
        border: "none" // Removed border
      }}>
        <h1 className="simulator-title" style={{ color: isDarkMode ? "#e0e0e0" : "#333" }}>Simulator Keuangan</h1>
        
        <div className="simulator-tabs">
          <button 
            className={`simulator-tab ${activeTab === "tabungan" ? "active" : ""}`}
            onClick={() => setActiveTab("tabungan")}
          >
            💰 Tabungan
          </button>
          <button 
            className={`simulator-tab ${activeTab === "pinjaman" ? "active" : ""}`}
            onClick={() => setActiveTab("pinjaman")}
          >
            💵 Pinjaman
          </button>
          <button 
            className={`simulator-tab ${activeTab === "pengeluaran" ? "active" : ""}`}
            onClick={() => setActiveTab("pengeluaran")}
          >
            📊 Expense Tracker
          </button>
        </div>
        
        <div className="simulator-content">
          {activeTab === "tabungan" && (
            <div className="simulator-section" style={{
              backgroundColor: "transparent", // Removed background color for sections
              boxShadow: "none", // Removed box shadow
              border: "none" // Removed border
            }}>
              <TabunganSimulator />
            </div>
          )}

          {activeTab === "pinjaman" && (
            <div className="simulator-section" style={{
              backgroundColor: "transparent", // Removed background color for sections
              boxShadow: "none", // Removed box shadow
              border: "none" // Removed border
            }}>
              <LoanSimulator />
            </div>
          )}

          {activeTab === "pengeluaran" && (
            <div className="simulator-section" style={{
              backgroundColor: "transparent", // Removed background color for sections
              boxShadow: "none", // Removed box shadow
              border: "none" // Removed border
            }}>
              <h2 style={{ color: isDarkMode ? "#e0e0e0" : "" }}>Digital Expense Tracker</h2>
              <ExpenseForm onCalculate={handleExpenseCalculation} />
              {calculationResults && (
                <div className="calculation-results" style={{
                  backgroundColor: "transparent", // Removed background color
                  boxShadow: "none", // Removed box shadow
                  border: "none" // Removed border
                }}>
                  <h3 style={{ color: isDarkMode ? "#e0e0e0" : "#333" }}>Results:</h3>
                  <div className="results-container">
                    <div className="result-item" style={{ 
                      backgroundColor: isDarkMode ? "transparent" : "#ffffff",
                      color: isDarkMode ? "#e0e0e0" : "#333"
                    }}>
                      <span className="result-label">Income:</span>
                      <span className="result-value">Rp {calculationResults.income.toLocaleString()}</span>
                    </div>
                    <div className="result-item" style={{ 
                      backgroundColor: isDarkMode ? "transparent" : "#ffffff",
                      color: isDarkMode ? "#e0e0e0" : "#333"
                    }}>
                      <span className="result-label">Needs:</span>
                      <span className="result-value">Rp {calculationResults.needs.toLocaleString()} ({calculationResults.needsPercent}%)</span>
                    </div>
                    <div className="result-item" style={{ 
                      backgroundColor: isDarkMode ? "transparent" : "#ffffff",
                      color: isDarkMode ? "#e0e0e0" : "#333"
                    }}>
                      <span className="result-label">Wants:</span>
                      <span className="result-value">Rp {calculationResults.wants.toLocaleString()} ({calculationResults.wantsPercent}%)</span>
                    </div>
                    <div className="result-item" style={{ 
                      backgroundColor: isDarkMode ? "transparent" : "#ffffff",
                      color: isDarkMode ? "#e0e0e0" : "#333"
                    }}>
                      <span className="result-label">Savings:</span>
                      <span className="result-value">Rp {calculationResults.savings.toLocaleString()} ({calculationResults.savingsPercent}%)</span>
                    </div>
                  </div>
                </div>
              )}
              <PieChartVisualization data={expenseData} />
              <FriendlyReminder />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}