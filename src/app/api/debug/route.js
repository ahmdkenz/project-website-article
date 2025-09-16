// src/app/api/debug/route.js
import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/data";

export async function GET(req) {
  try {
    const articles = await getAllArticles();
    
    // Hitung jumlah per mode
    const countByMode = {};
    articles.forEach(a => {
      const mode = (a.mode || "moderate").toLowerCase().trim();
      countByMode[mode] = (countByMode[mode] || 0) + 1;
    });
    
    // Buat sampel artikel untuk setiap mode
    const friendlyArticles = articles
      .filter(a => (a.mode || "moderate").toLowerCase().trim() === "friendly")
      .slice(0, 5)
      .map(a => ({ slug: a.slug, title: a.title, mode: a.mode }));
      
    const moderateArticles = articles
      .filter(a => (a.mode || "moderate").toLowerCase().trim() === "moderate")
      .slice(0, 5)
      .map(a => ({ slug: a.slug, title: a.title, mode: a.mode }));
    
    return NextResponse.json({
      total: articles.length,
      countByMode,
      friendlyCount: friendlyArticles.length,
      moderateCount: moderateArticles.length,
      friendlySamples: friendlyArticles,
      moderateSamples: moderateArticles
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to debug articles" },
      { status: 500 }
    );
  }
}