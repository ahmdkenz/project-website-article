// src/app/api/leaderboard/route.js
import { NextResponse } from "next/server";
import { db, serverTimestamp } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
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

    const entriesRef = collection(db, "leaderboards", quizId, "entries");
    let items = [];
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
          level: data.level || "Unknown", // Include level in response
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
        };
      });
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
            level: data.level || "Unknown", // Include level in response
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
          };
        });
      } else {
        throw err;
      }
    }

    return withCache(NextResponse.json({ quizId, total: items.length, items }));
  } catch (e) {
    console.error("[Leaderboard][GET]", e);
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

    const entriesRef = collection(db, "leaderboards", quizId, "entries");
    await addDoc(entriesRef, {
      name: name.slice(0, 50),
      score,
      badge, // Save badge
      level: level || "Unknown", // Save level
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Leaderboard][POST]", e);
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 });
  }
}

function withCache(res) {
  res.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
  return res;
}
