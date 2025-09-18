"use client";

import { useEffect, useRef } from "react";
import { useMode } from "@/context/ModeContext";
import Chart from "chart.js/auto";

export default function PieChartVisualization({ data = { needs: 50, wants: 30, savings: 20 } }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  useEffect(() => {
    // Clean up any existing chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "doughnut", // Changed from pie to doughnut for a more modern look
      data: {
        labels: [
          `📝 Needs (${data.needs}%)`, 
          `🛍️ Wants (${data.wants}%)`, 
          `💰 Savings (${data.savings}%)`
        ],
        datasets: [
          {
            data: [data.needs, data.wants, data.savings],
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",  // More modern, slightly transparent colors
              "rgba(54, 162, 235, 0.8)", 
              "rgba(255, 206, 86, 0.8)"
            ],
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        cutout: '60%',  // Make the doughnut hole larger
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                family: "'Segoe UI', sans-serif"
              },
              color: isDarkMode ? '#fff' : '#333'
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            titleColor: isDarkMode ? '#fff' : '#333',
            bodyColor: isDarkMode ? '#eee' : '#666',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            boxPadding: 5
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
    
    // Clean up when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isDarkMode, data.needs, data.wants, data.savings]);

  return (
    <div className="chart-container">
      <h2 style={{ color: "#000", marginBottom: '15px', fontSize: '1.5rem' }}>
        Expense Distribution <span role="img" aria-label="chart">📊</span>
      </h2>
      <div className="chart-wrapper">
        <canvas ref={chartRef} height="220"></canvas>
      </div>
    </div>
  );
}