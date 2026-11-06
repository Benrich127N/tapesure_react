import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function useShopCollection(name) {
  const [state, setState] = useState({ data: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!auth.currentUser) return;
    setState({ data: [], loading: true, error: false });
    return onSnapshot(
      query(collection(db, name), where("userId", "==", auth.currentUser.uid)),
      (snapshot) => setState({ data: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })), loading: false, error: false }),
      () => setState({ data: [], loading: false, error: true }),
    );
  }, [name, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
