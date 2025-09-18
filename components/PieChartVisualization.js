"use client";

import { useEffect, useRef } from "react";
import { useMode } from "@/context/ModeContext";
import Chart from "chart.js/auto";

/**
 * PieChartVisualization
 * - membaca CSS variables untuk warna chart (so tooltip + legend mengikuti theme)
 * - fallback ke warna eksplisit jika CSS var kosong
 */
export default function PieChartVisualization({ data = { needs: 50, wants: 30, savings: 20 } }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  useEffect(() => {
    // Destroy previous chart instance if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // Read CSS variables from :root / html
    // This must run client-side (inside useEffect) so document is available
    const rootStyles = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
    const css = {
      chartText: rootStyles?.getPropertyValue("--chart-text")?.trim() || (isDarkMode ? "#f0f0f0" : "#111827"),
      chartBg: rootStyles?.getPropertyValue("--chart-bg")?.trim() || (isDarkMode ? "#111827" : "#ffffff"),
      chartBorder: rootStyles?.getPropertyValue("--chart-border")?.trim() || (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"),
      primaryGradient: rootStyles?.getPropertyValue("--primary")?.trim() || (isDarkMode ? "linear-gradient(135deg, #8e24aa, #7b1fa2)" : "linear-gradient(135deg, #4CAF50, #43a047)"),
    };

    // Safe fallbacks for dataset colors (these are not from CSS vars to keep contrast consistent)
    const datasetColors = [
      "rgba(255, 99, 132, 0.85)",
      "rgba(54, 162, 235, 0.85)",
      "rgba(255, 206, 86, 0.85)",
    ];

    const ctx = chartRef.current.getContext("2d");

    // Optional: set defaults for text color so axis/labels (if any) follow theme
    Chart.defaults.color = css.chartText;
    Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial";

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          `📝 Needs (${data.needs}%)`,
          `🛍️ Wants (${data.wants}%)`,
          `💰 Savings (${data.savings}%)`
        ],
        datasets: [
          {
            data: [data.needs, data.wants, data.savings],
            backgroundColor: datasetColors,
            borderColor: css.chartBorder,
            borderWidth: 1,
            hoverOffset: 6,
          }
        ]
      },
      options: {
        cutout: "60%",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 14,
              boxWidth: 10,
              boxHeight: 10,
              font: {
                size: 12,
                family: "'Segoe UI', sans-serif",
              },
              color: css.chartText, // legend text color from CSS var
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: css.chartBg,   // tooltip background follows CSS var
            titleColor: css.chartText,
            bodyColor: css.chartText,
            borderColor: css.chartBorder,
            borderWidth: 1,
            borderRadius: 8,
            displayColors: true,
            padding: 10,
            boxPadding: 6,
            // caret padding/size left as default, can be customized if desired
          }
        }
      }
    });

    // cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [isDarkMode, data.needs, data.wants, data.savings]);

  return (
    <div className="chart-container">
      <h2 style={{ color: isDarkMode ? "#e0e0e0" : "", marginBottom: "15px", fontSize: "1.5rem" }}>
        Expense Distribution <span role="img" aria-label="chart">📊</span>
      </h2>
      <div className="chart-wrapper">
        <canvas ref={chartRef} height="220" />
      </div>
    </div>
  );
}
