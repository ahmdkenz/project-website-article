import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { revalidateTag, revalidatePath } from "next/cache";

function verifySignature(rawBody, signature, secret) {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature || ""));
  } catch {
    return false;
  }
}

export async function POST(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");
  const rawBody = await req.text();

  if (!verifySignature(rawBody, signature, secret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  if (event !== "push") {
    return NextResponse.json({ ok: true, msg: "ignored event" });
  }

  // Revalidate daftar & semua halaman ber-tag "articles"
  revalidateTag("articles");
  revalidatePath("/articles");

  return NextResponse.json({ ok: true });
}
