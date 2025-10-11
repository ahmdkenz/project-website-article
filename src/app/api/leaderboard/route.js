// src/app/api/leaderboard/route.js
import { NextResponse } from "next/server";
import { db, serverTimestamp } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  where,
  limit as limitFn,
} from "firebase/firestore";

export const runtime = "nodejs";

// Helper to calculate badge based on score
function calculateBadge(score, maxScore) {
  const pct = maxScore ? Math.floor((score / maxScore) * 100) : 0;
  if (pct >= 80) return "Master";
  if (pct >= 50) return "Ahli";
  if (pct > 0) return "Pemula";
  return "Coba Lagi";
}

// GET /api/leaderboard?quizId=...&limit=50
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = (searchParams.get("quizId") || "").trim();
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    if (!quizId) {
      return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    }

    let items = [];
    
    // Coba ambil data dari Firestore
    try {
      const entriesRef = collection(db, "leaderboards", quizId, "entries");
      
      try {
        const q = query(entriesRef, orderBy("score", "desc"), orderBy("createdAt", "asc"), limitFn(limit));
        const snap = await getDocs(q);
        items = snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            name: String(data.name || "Anon"),
            score: Number(data.score || 0),
            badge: data.badge || "",
            level: data.level || "Unknown",
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
          };
        });
        
        // Hapus duplikat nama+level dari hasil (ambil hanya skor tertinggi)
        const seen = new Map();
        
        items.forEach(item => {
          const key = `${item.name}-${item.level}`;
          if (!seen.has(key) || item.score > seen.get(key).score) {
            seen.set(key, item);
          }
        });
        
        // Konversi map ke array dan urutkan berdasarkan skor
        items = Array.from(seen.values()).sort((a, b) => b.score - a.score);
        
      } catch (err) {
        // Fallback jika index komposit belum dibuat
        if (err?.code === "failed-precondition") {
          const q2 = query(entriesRef, orderBy("score", "desc"), limitFn(limit));
          const snap2 = await getDocs(q2);
          items = snap2.docs.map((d) => {
            const data = d.data() || {};
            return {
              id: d.id,
              name: String(data.name || "Anon"),
              score: Number(data.score || 0),
              badge: data.badge || "",
              level: data.level || "Unknown",
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
            };
          });
          
          // Hapus duplikat di sini juga
          const seen = new Map();
          
          items.forEach(item => {
            const key = `${item.name}-${item.level}`;
            if (!seen.has(key) || item.score > seen.get(key).score) {
              seen.set(key, item);
            }
          });
          
          items = Array.from(seen.values()).sort((a, b) => b.score - a.score);
        } else if (err?.code === "permission-denied") {
          console.warn("[Leaderboard][GET] Firebase permission denied. Using empty leaderboard.");
          return withCache(NextResponse.json({ quizId, total: 0, items: [] }));
        } else {
          throw err;
        }
      }
    } catch (outerErr) {
      console.error("[Leaderboard][GET] Outer error:", outerErr);
      if (outerErr?.code === "permission-denied") {
        return withCache(NextResponse.json({ quizId, total: 0, items: [] }));
      }
      throw outerErr;
    }
    
    return withCache(NextResponse.json({ quizId, total: items.length, items }));
  } catch (e) {
    console.error("[Leaderboard][GET]", e);
    // Jika error disebabkan oleh masalah izin Firebase, berikan respons kosong sebagai fallback
    if (e?.code === "permission-denied") {
      console.warn("[Leaderboard][GET] Firebase permission denied. Returning empty leaderboard.");
      return withCache(NextResponse.json({ quizId, total: 0, items: [] }));
    }
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}

// POST /api/leaderboard  body: { quizId, name, score, maxScore, level }
export async function POST(req) {
  try {
    const body = await req.json();
    const quizId = String(body?.quizId || "").trim();
    const nameRaw = String(body?.name || "").trim();
    const score = Number(body?.score || 0);
    const maxScore = Number(body?.maxScore || 100); // Default maxScore to 100
    const level = String(body?.level || "").trim(); // Get level from request

    if (!quizId) return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    if (!Number.isFinite(score) || score < 0) return NextResponse.json({ error: "invalid score" }, { status: 400 });

    const name = nameRaw || "Anon";
    const badge = calculateBadge(score, maxScore); // Calculate badge with floor
    
    // Jika Firebase tidak tersedia atau error izin, kirim respons simulasi
    try {
      // Coba akses Firestore untuk memeriksa izin
      await getDocs(query(collection(db, "leaderboards"), limitFn(1)));
    } catch (permError) {
      if (permError?.code === "permission-denied") {
        console.warn("[Leaderboard][POST] Firebase permission denied. Returning simulated success response.");
        return NextResponse.json({ 
          ok: true, 
          simulated: true,
          message: "Skor berhasil disimpan (mode simulasi)!"
        });
      }
    }
    
    // Cari apakah user dengan nama ini sudah pernah submit skor sebelumnya
    // untuk quiz level yang sama
    const entriesRef = collection(db, "leaderboards", quizId, "entries");
    let existingEntries = [];
    let highestScore = 0;
    let existingEntryId = null;
    
    try {
      // Query untuk mencari entri dengan nama dan level yang sama
      const nameQuery = query(
        entriesRef,
        where("name", "==", name.slice(0, 50)),
        where("level", "==", level || "Unknown")
      );
      
      const querySnapshot = await getDocs(nameQuery);
      
      if (!querySnapshot.empty) {
        // Kumpulkan semua entri yang ada dan temukan skor tertinggi
        querySnapshot.forEach(doc => {
          const data = doc.data();
          existingEntries.push({ 
            id: doc.id, 
            score: data.score,
            badge: data.badge 
          });
          
          if (data.score > highestScore) {
            highestScore = data.score;
            existingEntryId = doc.id;
          }
        });
      }
    } catch (queryError) {
      console.warn("[Leaderboard][POST] Query existing entries failed:", queryError);
    }
    
    // Tentukan apakah perlu update
    const shouldUpdate = score > highestScore;
    
    try {
      // Jika skor baru lebih tinggi dari skor tertinggi sebelumnya
      if (shouldUpdate) {
        // 1. Import modul yang diperlukan
        const { doc, updateDoc, deleteDoc } = await import("firebase/firestore");
        
        // 2. Jika entri sebelumnya ada, update entri dengan skor tertinggi
        if (existingEntryId) {
          // Update entri dengan skor tertinggi
          await updateDoc(doc(entriesRef, existingEntryId), {
            score,
            badge,
            updatedAt: serverTimestamp(),
          });
          
          // 3. Hapus semua entri lain untuk nama dan level yang sama
          // (kecuali entri yang baru kita update)
          for (const entry of existingEntries) {
            if (entry.id !== existingEntryId) {
              await deleteDoc(doc(entriesRef, entry.id));
            }
          }
          
          return NextResponse.json({ 
            ok: true, 
            updated: true,
            message: `Skor tertinggi diperbarui dari ${highestScore} menjadi ${score}!`
          });
        } else {
          // Jika tidak ada entri sebelumnya, buat entri baru
          await addDoc(entriesRef, {
            name: name.slice(0, 50),
            score,
            badge,
            level: level || "Unknown",
            createdAt: serverTimestamp(),
          });
          
          return NextResponse.json({ 
            ok: true, 
            message: "Skor berhasil disimpan!"
          });
        }
      } else {
        // Jika skor tidak lebih tinggi, kirim pesan ke user
        return NextResponse.json({ 
          ok: true, 
          noUpdate: true,
          message: `Skor sebelumnya (${highestScore}) lebih tinggi. Coba lagi!` 
        });
      }
    } catch (e) {
      console.error("[Leaderboard][POST] Error updating entries:", e);
      return NextResponse.json({ error: "Failed to update leaderboard entries" }, { status: 500 });
    }
  } catch (e) {
    console.error("[Leaderboard][POST]", e);
    // Jika error disebabkan oleh masalah izin Firebase, kirim respons simulasi sebagai fallback
    if (e?.code === "permission-denied") {
      console.warn("[Leaderboard][POST] Firebase permission denied. Returning simulated success response.");
      return NextResponse.json({ 
        ok: true, 
        simulated: true,
        message: "Skor berhasil disimpan (mode simulasi)!"
      });
    }
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 });
  }
}

function withCache(res) {
  res.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
  return res;
}