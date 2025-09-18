import { useState } from "react";
import styles from "../styles/TabunganSimulator.module.css";
import { useMode } from "@/context/ModeContext";

function TabunganSimulator() {
  const [target, setTarget] = useState(0);
  const [perBulan, setPerBulan] = useState(0);
  const [bulan, setBulan] = useState(0);
  const [hasil, setHasil] = useState(null);
  const { mode } = useMode();

  const isDarkMode = mode === "dark";

  function handleSubmit(e) {
    e.preventDefault();
    const total = perBulan * bulan;
    const realistis = total >= target;
    let saran = null;
    if (!realistis && bulan > 0) {
      const perluPerBulan = Math.ceil(target / bulan);
      const selisih = perluPerBulan - perBulan;
      const perluBulan = perBulan > 0 ? Math.ceil(target / perBulan) : 0;
      saran = `Agar target tercapai, kamu perlu menambah tabungan jadi Rp${perluPerBulan.toLocaleString()}/bulan (tambah Rp${selisih.toLocaleString()}/bulan), atau perpanjang waktu menabung jadi ${perluBulan} bulan.`;
    }
    setHasil({ total, realistis, saran });
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
          aria-label="tabungan"
          style={{ fontSize: "1.5em", verticalAlign: "middle", marginRight: 8 }}
        >
          💰
        </span>
        Simulator Tabungan
      </div>
      <form
        onSubmit={handleSubmit}
        className={styles.simulatorForm}
        autoComplete="off"
      >
        <div>
          <label className={styles.simulatorLabel} htmlFor="target">
            🎯 Target Tabungan (Rp)
          </label>
          <input
            id="target"
            className={styles.simulatorInput}
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            min={0}
            required
            placeholder="Contoh: 5.000.000"
          />
        </div>
        <div>
          <label className={styles.simulatorLabel} htmlFor="perbulan">
            💸 Tabungan per Bulan (Rp)
          </label>
          <input
            id="perbulan"
            className={styles.simulatorInput}
            type="number"
            value={perBulan}
            onChange={(e) => setPerBulan(Number(e.target.value))}
            min={0}
            required
            placeholder="Contoh: 500.000"
          />
        </div>
        <div>
          <label className={styles.simulatorLabel} htmlFor="bulan">
            ⏳ Waktu (bulan)
          </label>
          <input
            id="bulan"
            className={styles.simulatorInput}
            type="number"
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            min={1}
            required
            placeholder="Contoh: 12"
          />
        </div>
        <button type="submit" className={styles.simulatorButton}>
          <span role="img" aria-label="hitung">
            🧮
          </span>{" "}
          Hitung
        </button>
      </form>
      {hasil && (
        <div className={styles.simulatorResult}>
          <b>
            Total Terkumpul:{" "}
            <span style={{ color: isDarkMode ? "#ffcc00" : "#333" }}>
              Rp{hasil.total.toLocaleString()}
            </span>
          </b>
          <div style={{ marginTop: 8 }}>
            {hasil.realistis ? (
              <span
                className={styles.simulatorSuccess}
                style={{ color: isDarkMode ? "#66bb6a" : "#8e24aa" }}
              >
                <span role="img" aria-label="success">
                  ✅
                </span>{" "}
                Target tercapai!{" "}
                <span role="img" aria-label="party">
                  🎉
                </span>
              </span>
            ) : (
              <>
                <span
                  className={styles.simulatorFail}
                  style={{ color: isDarkMode ? "#e57373" : "#6d1b7b" }}
                >
                  <span role="img" aria-label="fail">
                    ⚠️
                  </span>{" "}
                  Target belum tercapai.
                </span>
                {hasil.saran && (
                  <div
                    className={styles.simulatorHint}
                    style={{ color: isDarkMode ? "#ffcc00" : "#8e24aa" }}
                  >
                    <span role="img" aria-label="hint">
                      💡
                    </span>{" "}
                    {hasil.saran}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TabunganSimulator;
