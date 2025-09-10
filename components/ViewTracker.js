"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";

export default function ViewTracker({ slug }) {
  useEffect(() => {
    const incrementView = async () => {
      const ref = doc(db, "articles", slug);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { views: 1 });
      } else {
        await updateDoc(ref, { views: increment(1) });
      }
    };
    incrementView();
  }, [slug]);

  return null; // tidak render apa-apa
}
