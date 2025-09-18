import { useState } from "react";
import styles from "../styles/TabunganSimulator.module.css";
import { useMode } from "@/context/ModeContext";

function LoanSimulator() {
  const [pinjaman, setPinjaman] = useState("");
  const [bunga, setBunga] = useState(""); // Changed initial state to empty string
  const [tenor, setTenor] = useState(""); // Changed initial state to empty string
  const [hasilPinjaman, setHasilPinjaman] = useState(null);
  const [scenario, setScenario] = useState("default");

  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  function formatNumber(value) {
    if (!value && value !== 0) return "";
    const cleanValue = value.toString().replace(/\./g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function parseNumber(value) {
    if (typeof value === 'number') return value;
    const parsed = (value || "").replace(/\./g, "");
    return parsed ? parseFloat(parsed) : 0;
  }

  function handleNumberInput(value, setter) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const numberOnly = cleaned.replace(/^0+/, ""); // Remove leading zeros
    setter(numberOnly);
  }

  function handleLoanSubmit(e) {
    e.preventDefault();
    const parsedPinjaman = parseNumber(pinjaman);
    const monthlyRate = bunga / 100 / 12;
    const monthlyInstallment = Math.round(
      (parsedPinjaman * monthlyRate * Math.pow(1 + monthlyRate, tenor)) /
      (Math.pow(1 + monthlyRate, tenor) - 1)
    );
    const totalPayment = monthlyInstallment * tenor;

    let scenarioResult = null;
    if (scenario === "increase-interest") {
      const newRate = (bunga + 2) / 100 / 12;
      const newInstallment =
        (parsedPinjaman * newRate * Math.pow(1 + newRate, tenor)) /
        (Math.pow(1 + newRate, tenor) - 1);
      const newTotal = newInstallment * tenor;
      scenarioResult = {
        description: "Kenaikan bunga sebesar 2%",
        monthlyInstallment: newInstallment,
        totalPayment: newTotal,
      };
    } else if (scenario === "late-payment") {
      const penalty = parsedPinjaman * 0.01; // 1% penalty for late payment
      scenarioResult = {
        description: "Keterlambatan pembayaran 1 bulan",
        penalty,
        totalPayment: totalPayment + penalty,
      };
    } else if (scenario === "high-interest-loan") {
      const highRate = 20 / 100 / 12; // 20% per month for high-interest loans
      const highInstallment =
        (parsedPinjaman * highRate * Math.pow(1 + highRate, tenor)) /
        (Math.pow(1 + highRate, tenor) - 1);
      const highTotal = highInstallment * tenor;
      scenarioResult = {
        description: "Perbandingan dengan pinjaman online (bunga tinggi)",
        monthlyInstallment: highInstallment,
        totalPayment: highTotal,
      };
    }

    setHasilPinjaman({ monthlyInstallment, totalPayment, scenarioResult });
  }

  return (
    <div
      className={styles.simulatorCard}
      style={{
        background: isDarkMode ? "#333" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        boxShadow: isDarkMode
          ? "0 2px 16px rgba(0,0,0,0.5)"
          : "0 2px 16px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className={styles.simulatorTitle}
        style={{ color: isDarkMode ? "#ffcc00" : "#333" }}
      >
        <span
          role="img"
          aria-label="pinjaman"
          style={{ fontSize: "1.5em", verticalAlign: "middle", marginRight: 8 }}
        >
          💵
        </span>
        Simulator Pinjaman
      </div>
      <form
        onSubmit={handleLoanSubmit}
        className={styles.simulatorForm}
        autoComplete="off"
      >
        <div>
          <label className={styles.simulatorLabel} htmlFor="pinjaman">
            💵 Jumlah Pinjaman (Rp)
          </label>
          <input
            id="pinjaman"
            className={styles.simulatorInput}
            type="text"
            value={formatNumber(pinjaman)}
            onChange={(e) => handleNumberInput(e.target.value, setPinjaman)}
            required
            placeholder="Contoh: 10.000.000"
          />
        </div>
        <div>
          <label className={styles.simulatorLabel} htmlFor="bunga">
            📈 Suku Bunga (% per Tahun)
          </label>
          <input
            id="bunga"
            className={styles.simulatorInput}
            type="text" // Changed to text to apply formatting
            value={formatNumber(bunga)}
            onChange={(e) => handleNumberInput(e.target.value, setBunga)}
            min={0}
            required
            placeholder="Contoh: 12"
          />
        </div>
        <div>
          <label className={styles.simulatorLabel} htmlFor="tenor">
            ⏳ Tenor (bulan)
          </label>
          <input
            id="tenor"
            className={styles.simulatorInput}
            type="text" // Changed to text to apply formatting
            value={formatNumber(tenor)}
            onChange={(e) => handleNumberInput(e.target.value, setTenor)}
            min={1}
            required
            placeholder="Contoh: 24"
          />
        </div>
        <div>
          <label className={styles.simulatorLabel} htmlFor="scenario">
            🧪 Pilih Skenario
          </label>
          <select
            id="scenario"
            className={styles.simulatorInput}
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option value="default">Tanpa Skenario</option>
            <option value="increase-interest">Kenaikan Bunga 2%</option>
            <option value="late-payment">Keterlambatan 1 Bulan</option>
            <option value="high-interest-loan">Perbandingan dengan Pinjol</option>
          </select>
        </div>
        <button type="submit" className={styles.simulatorButton}>
          <span role="img" aria-label="hitung">
            🧮
          </span>{" "}
          Hitung Pinjaman
        </button>
      </form>
      {hasilPinjaman && (
        <div className={styles.simulatorResult}>
          <b>
            Cicilan Per Bulan: {" "}
            <span style={{ color: isDarkMode ? "#ffcc00" : "#333" }}>
              Rp{formatNumber(Math.round(hasilPinjaman.monthlyInstallment))}
            </span>
          </b>
          <div style={{ marginTop: 8 }}>
            <b>
              Total Pembayaran: {" "}
              <span style={{ color: isDarkMode ? "#ffcc00" : "#333" }}>
                Rp{formatNumber(Math.round(hasilPinjaman.totalPayment))}
              </span>
            </b>
          </div>
          {hasilPinjaman.scenarioResult && (
            <div style={{ marginTop: 16 }}>
              <b>{hasilPinjaman.scenarioResult.description}</b>
              <div>
                Cicilan Per Bulan: {" "}
                Rp{formatNumber(Math.round(hasilPinjaman.scenarioResult.monthlyInstallment)) || "-"}
              </div>
              <div>
                Total Pembayaran: {" "}
                Rp{formatNumber(Math.round(hasilPinjaman.scenarioResult.totalPayment)) || "-"}
              </div>
              {hasilPinjaman.scenarioResult.penalty && (
                <div>Denda: Rp{formatNumber(Math.round(hasilPinjaman.scenarioResult.penalty))}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoanSimulator;