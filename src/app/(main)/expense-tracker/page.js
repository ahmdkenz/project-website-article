"use client";

import "@/styles/expense-tracker.css";
import { useMode } from "@/context/ModeContext";

import ExpenseForm from "@/components/ExpenseForm";
import PieChartVisualization from "@/components/PieChartVisualization";
import FriendlyReminder from "@/components/FriendlyReminder";

export default function ExpenseTrackerPage() {
  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  return (
    <main
      style={{
        backgroundColor: isDarkMode ? "#333" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <h1>Digital Expense Tracker</h1>
      <ExpenseForm />
      <PieChartVisualization />
      <FriendlyReminder />
    </main>
  );
}