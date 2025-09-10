import { db } from "@/lib/firebase";
import { getDocs, collection } from "firebase/firestore";

export async function getAllViews() {
  const snap = await getDocs(collection(db, "articles"));
  const viewsMap = {};
  snap.forEach((doc) => {
    viewsMap[doc.id] = doc.data().views || 0;
  });
  return viewsMap; // { slug1: 10, slug2: 5, ... }
}
