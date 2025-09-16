// src/app/api/debug-mode/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Cari theme_mode dan site_mode cookie
    const themeModeObj = cookieStore.get("theme_mode");
    const siteModeObj = cookieStore.get("site_mode");
    
    const themeMode = themeModeObj ? themeModeObj.value : null;
    const siteMode = siteModeObj ? siteModeObj.value : null;
    
    return NextResponse.json({
      message: "Mode debug info",
      themeModeCookie: themeMode,
      siteModeCookie: siteMode,
      allCookies: allCookies.map(c => ({ 
        name: c.name, 
        value: c.value,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to debug mode", message: err.message },
      { status: 500 }
    );
  }
}