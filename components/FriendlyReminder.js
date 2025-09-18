"use client";

import { useMode } from "@/context/ModeContext";

export default function FriendlyReminder() {
  const { mode } = useMode();
  const isDarkMode = mode === "dark";
  
  return (
    <div className="friendly-reminder">
      <h2 className="friendly-reminder-title">
        <span role="img" aria-label="tip">💡</span> Friendly Reminder
      </h2>
      <div className="reminder-card">
        <div className="reminder-icon">✨</div>
        <p>Follow the 50/30/20 rule for better financial health!</p>
      </div>
      
      <div className="reminder-tips">
        <div className="tip-item">
          <span role="img" aria-label="needs">🏠</span>
          <p>50% for <strong>needs</strong> (housing, food, utilities)</p>
        </div>
        <div className="tip-item">
          <span role="img" aria-label="wants">🛍️</span>
          <p>30% for <strong>wants</strong> (entertainment, dining out)</p>
        </div>
        <div className="tip-item">
          <span role="img" aria-label="savings">💰</span>
          <p>20% for <strong>savings</strong> and debt payments</p>
        </div>
      </div>
    </div>
  );
}