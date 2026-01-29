import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../../firebase"; 
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions
import { LogIn } from "lucide-react";

const Login = () => {
  const handleLogin = async () => {
    try {
      // 1. Trigger the Google Login
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Reference the document in the 'users' collection using the UID
      const userRef = doc(db, "users", user.uid);

      // 3. Create or Update the user document
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(), // Records when they logged in
        role: "tailor" // Default role for your Tapsure app
      }, { merge: true }); // Merge: true prevents overwriting existing data

      console.log("User synced to Firestore successfully!");
      
    } catch (error) {
      console.error("Login/Sync Error:", error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
          <LogIn className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Tapsure</h1>
        <p className="text-gray-400 mb-8">
          Sign in to manage your tailoring projects and client measurements.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all duration-200 transform active:scale-95 shadow-lg"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-xs text-gray-600 uppercase tracking-widest font-semibold">
          Tapsure
        </p>
      </div>
    </div>
  );
};

export default Login;