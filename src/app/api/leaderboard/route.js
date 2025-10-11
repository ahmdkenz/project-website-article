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
    const debug = searchParams.get("debug") === "1"; // Parameter untuk debugging

    if (!quizId) {
      return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    }

    console.log(`[Leaderboard][GET] Fetching leaderboard for quizId: ${quizId}`);
    
    let items = [];
    let debugInfo = {};
    
    // Coba ambil data dari Firestore
    try {
      // Tambahkan log untuk path yang dicari
      console.log(`[Leaderboard][GET] Path: leaderboards/${quizId}/entries`);
      
      const entriesRef = collection(db, "leaderboards", quizId, "entries");
      
      try {
        console.log("[Leaderboard][GET] Querying with composite index...");
        const q = query(entriesRef, orderBy("score", "desc"), orderBy("createdAt", "asc"), limitFn(limit));
        const snap = await getDocs(q);
        
        console.log(`[Leaderboard][GET] Found ${snap.size} documents`);
        
        if (snap.empty) {
          console.warn(`[Leaderboard][GET] No entries found for ${quizId}`);
          debugInfo.entriesFound = 0;
        }
        
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
        debugInfo.entriesAfterDeduplication = items.length;
        
      } catch (err) {
        console.warn(`[Leaderboard][GET] Query error: ${err.code}`);
        debugInfo.queryError = err.code;
        
        // Fallback jika index komposit belum dibuat
        if (err?.code === "failed-precondition") {
          console.log("[Leaderboard][GET] Falling back to simple query...");
          const q2 = query(entriesRef, orderBy("score", "desc"), limitFn(limit));
          const snap2 = await getDocs(q2);
          
          console.log(`[Leaderboard][GET] Found ${snap2.size} documents with simple query`);
          debugInfo.entriesFoundSimpleQuery = snap2.size;
          
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
          debugInfo.entriesAfterDeduplicationSimple = items.length;
        } else if (err?.code === "permission-denied") {
          console.warn("[Leaderboard][GET] Firebase permission denied. Using empty leaderboard.");
          debugInfo.error = "permission-denied";
          return withCache(NextResponse.json({ 
            quizId, 
            total: 0, 
            items: [],
            debug: debug ? debugInfo : undefined,
            errorCode: "permission-denied"
          }));
        } else {
          debugInfo.error = err.message || err.toString();
          throw err;
        }
      }
    } catch (outerErr) {
      console.error("[Leaderboard][GET] Outer error:", outerErr);
      debugInfo.outerError = outerErr.message || outerErr.toString();
      
      if (outerErr?.code === "permission-denied") {
        return withCache(NextResponse.json({ 
          quizId, 
          total: 0, 
          items: [],
          debug: debug ? debugInfo : undefined,
          errorCode: "permission-denied"
        }));
      }
      throw outerErr;
    }
    
    console.log(`[Leaderboard][GET] Returning ${items.length} entries for ${quizId}`);
    return withCache(NextResponse.json({ 
      quizId, 
      total: items.length, 
      items,
      debug: debug ? debugInfo : undefined
    }));
  } catch (e) {
    console.error("[Leaderboard][GET]", e);
    // Jika error disebabkan oleh masalah izin Firebase, berikan respons kosong sebagai fallback
    if (e?.code === "permission-denied") {
      console.warn("[Leaderboard][GET] Firebase permission denied. Returning empty leaderboard.");
      return withCache(NextResponse.json({ 
        quizId, 
        total: 0, 
        items: [],
        errorCode: "permission-denied"
      }));
    }
    
    // Log detail error untuk debugging
    console.error(`[Leaderboard][GET] Error type: ${e.constructor.name}, Message: ${e.message}`);
    if (e.stack) console.error(`[Leaderboard][GET] Stack: ${e.stack}`);
    
    return NextResponse.json({ 
      error: "Failed to load leaderboard",
      errorDetail: process.env.NODE_ENV !== 'production' ? e.message : undefined
    }, { status: 500 });
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
    const debug = req.url.includes("debug=1"); // Parameter untuk debugging
    
    console.log(`[Leaderboard][POST] Processing score submission: quizId=${quizId}, name=${nameRaw}, score=${score}, level=${level}`);

    if (!quizId) return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    if (!Number.isFinite(score) || score < 0) return NextResponse.json({ error: "invalid score" }, { status: 400 });

    const name = nameRaw || "Anon";
    const badge = calculateBadge(score, maxScore); // Calculate badge with floor
    
    // Debug info untuk mendiagnosis masalah
    const debugInfo = {
      quizId,
      name,
      score,
      level,
      maxScore,
      badge,
      timestamp: new Date().toISOString()
    };
    
    // Jika Firebase tidak tersedia atau error izin, kirim respons simulasi
    try {
      // Coba akses Firestore untuk memeriksa izin
      console.log("[Leaderboard][POST] Testing Firebase permissions...");
      await getDocs(query(collection(db, "leaderboards"), limitFn(1)));
      console.log("[Leaderboard][POST] Firebase permissions OK");
    } catch (permError) {
      console.error(`[Leaderboard][POST] Permission check error: ${permError.code}`, permError);
      debugInfo.permissionError = permError.message;
      
      if (permError?.code === "permission-denied") {
        console.warn("[Leaderboard][POST] Firebase permission denied. Returning simulated success response.");
        return NextResponse.json({ 
          ok: true, 
          simulated: true,
          message: "Skor berhasil disimpan (mode simulasi)!",
          debug: debug ? debugInfo : undefined,
          errorCode: "permission-denied"
        });
      }
    }
    
    // Cari apakah user dengan nama ini sudah pernah submit skor sebelumnya
    // untuk quiz level yang sama
    const entriesRef = collection(db, "leaderboards", quizId, "entries");
    let existingEntries = [];
    let highestScore = 0;
    let existingEntryId = null;
    
    console.log(`[Leaderboard][POST] Path: leaderboards/${quizId}/entries`);
    console.log(`[Leaderboard][POST] Checking for existing entries with name=${name}, level=${level || "Unknown"}`);
    
    try {
      // Query untuk mencari entri dengan nama dan level yang sama
      const nameQuery = query(
        entriesRef,
        where("name", "==", name.slice(0, 50)),
        where("level", "==", level || "Unknown")
      );
      
      const querySnapshot = await getDocs(nameQuery);
      
      console.log(`[Leaderboard][POST] Found ${querySnapshot.size} existing entries for name=${name}, level=${level || "Unknown"}`);
      debugInfo.existingEntries = querySnapshot.size;
      
      if (!querySnapshot.empty) {
        // Kumpulkan semua entri yang ada dan temukan skor tertinggi
        querySnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`[Leaderboard][POST] Existing entry: id=${doc.id}, score=${data.score}, badge=${data.badge}`);
          
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
        
        console.log(`[Leaderboard][POST] Highest existing score: ${highestScore}, id=${existingEntryId}`);
        debugInfo.highestExistingScore = highestScore;
        debugInfo.existingEntryId = existingEntryId;
      }
    } catch (queryError) {
      console.warn("[Leaderboard][POST] Query existing entries failed:", queryError);
      debugInfo.queryError = queryError.message;
    }
    
    // Tentukan apakah perlu update
    const shouldUpdate = score > highestScore;
    debugInfo.shouldUpdate = shouldUpdate;
    
    console.log(`[Leaderboard][POST] Should update? ${shouldUpdate} (New score: ${score}, Highest existing: ${highestScore})`);
    
    try {
      // Jika skor baru lebih tinggi dari skor tertinggi sebelumnya
      if (shouldUpdate) {
        // 1. Import modul yang diperlukan
        const { doc, updateDoc, deleteDoc } = await import("firebase/firestore");
        
        // 2. Jika entri sebelumnya ada, update entri dengan skor tertinggi
        if (existingEntryId) {
          console.log(`[Leaderboard][POST] Updating existing entry: ${existingEntryId}`);
          // Update entri dengan skor tertinggi
          await updateDoc(doc(entriesRef, existingEntryId), {
            score,
            badge,
            updatedAt: serverTimestamp(),
          });
          debugInfo.action = "updated";
          
          // 3. Hapus semua entri lain untuk nama dan level yang sama
          // (kecuali entri yang baru kita update)
          for (const entry of existingEntries) {
            if (entry.id !== existingEntryId) {
              console.log(`[Leaderboard][POST] Deleting duplicate entry: ${entry.id}`);
              await deleteDoc(doc(entriesRef, entry.id));
            }
          }
          
          console.log(`[Leaderboard][POST] Successfully updated score from ${highestScore} to ${score}`);
          return NextResponse.json({ 
            ok: true, 
            updated: true,
            message: `Skor tertinggi diperbarui dari ${highestScore} menjadi ${score}!`,
            debug: debug ? debugInfo : undefined
          });
        } else {
          // Jika tidak ada entri sebelumnya, buat entri baru
          console.log(`[Leaderboard][POST] Creating new entry for ${name}, level=${level || "Unknown"}`);
          
          const newDoc = await addDoc(entriesRef, {
            name: name.slice(0, 50),
            score,
            badge,
            level: level || "Unknown",
            createdAt: serverTimestamp(),
          });
          
          console.log(`[Leaderboard][POST] Successfully created new entry with id: ${newDoc.id}`);
          debugInfo.action = "created";
          debugInfo.newEntryId = newDoc.id;
          
          return NextResponse.json({ 
            ok: true, 
            message: "Skor berhasil disimpan!",
            debug: debug ? debugInfo : undefined
          });
        }
      } else {
        // Jika skor tidak lebih tinggi, kirim pesan ke user
        console.log(`[Leaderboard][POST] No update needed, current score (${score}) is not higher than existing (${highestScore})`);
        debugInfo.action = "no-update";
        
        return NextResponse.json({ 
          ok: true, 
          noUpdate: true,
          message: `Skor sebelumnya (${highestScore}) lebih tinggi. Coba lagi!`,
          debug: debug ? debugInfo : undefined
        });
      }
    } catch (e) {
      console.error("[Leaderboard][POST] Error updating entries:", e);
      debugInfo.updateError = e.message;
      debugInfo.errorCode = e.code;
      
      if (e?.code === "permission-denied") {
        console.warn("[Leaderboard][POST] Firebase permission denied during update.");
        return NextResponse.json({ 
          ok: true, 
          simulated: true,
          message: "Skor berhasil disimpan (mode simulasi)!",
          debug: debug ? debugInfo : undefined,
          errorCode: "permission-denied"
        });
      }
      
      return NextResponse.json({ 
        error: "Failed to update leaderboard entries", 
        errorDetail: process.env.NODE_ENV !== 'production' ? e.message : undefined,
        debug: debug ? debugInfo : undefined
      }, { status: 500 });
    }
  } catch (e) {
    console.error("[Leaderboard][POST]", e);
    
    // Log detail error untuk debugging
    console.error(`[Leaderboard][POST] Error type: ${e.constructor.name}, Message: ${e.message}`);
    if (e.stack) console.error(`[Leaderboard][POST] Stack: ${e.stack}`);
    
    // Jika error disebabkan oleh masalah izin Firebase, kirim respons simulasi sebagai fallback
    if (e?.code === "permission-denied") {
      console.warn("[Leaderboard][POST] Firebase permission denied. Returning simulated success response.");
      return NextResponse.json({ 
        ok: true, 
        simulated: true,
        message: "Skor berhasil disimpan (mode simulasi)!",
        errorCode: "permission-denied"
      });
    }
    return NextResponse.json({ 
      error: "Failed to submit score",
      errorDetail: process.env.NODE_ENV !== 'production' ? e.message : undefined
    }, { status: 500 });
  }
}

function withCache(res) {
  res.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
  return res;
}