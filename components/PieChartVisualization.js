"use client";

import { useEffect, useRef } from "react";
import { useMode } from "@/context/ModeContext";
import Chart from "chart.js/auto";

export default function PieChartVisualization() {
  const chartRef = useRef(null);
  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Needs (50%)", "Wants (30%)", "Savings (20%)"],
        datasets: [
          {
            data: [50, 30, 20],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      },
    });
  }, []);

  return (
    <div>
      <h2 style={{ color: isDarkMode ? "#000" : "#000" }}>
        Expense Distribution
      </h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}