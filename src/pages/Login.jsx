import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider, db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, Mail, Lock, User, AlertCircle } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Icons                                    */
/* -------------------------------------------------------------------------- */
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.35 11.1h-9.18v2.92h5.3c-.23 1.43-1.69 4.2-5.3 4.2-3.19 0-5.8-2.64-5.8-5.9s2.61-5.9 5.8-5.9c1.82 0 3.04.78 3.74 1.45l2.56-2.47C16.64 3.65 14.64 3 12.17 3 7.28 3 3.33 6.94 3.33 11.82s3.95 8.82 8.84 8.82c5.1 0 8.48-3.58 8.48-8.63 0-.58-.07-1.02-.3-1.91z"/>
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */
const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                            After Auth (Firestore)                          */
  /* -------------------------------------------------------------------------- */
  const afterAuth = async (user) => {
    const ref = doc(db, "users", user.uid);
    
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      fullName: user.displayName || fullName || "User",
      role: "tailor",
      lastLogin: new Date().toISOString()
    }, { merge: true });

    const snap = await getDoc(ref);
    
    if (snap.data()?.onboardingCompleted) {
      navigate("/");
    } else {
      navigate("/onboarding");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                Google Login                                */
  /* -------------------------------------------------------------------------- */
  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await afterAuth(result.user);
    } catch  {
      setError("Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                Email Login                                 */
  /* -------------------------------------------------------------------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await afterAuth(result.user);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Signup                                    */
  /* -------------------------------------------------------------------------- */
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await afterAuth(result.user);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use");
      } else {
        setError("Account creation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              Password Reset                                */
  /* -------------------------------------------------------------------------- */
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
      setTimeout(() => setForgotPassword(false), 3000);
    } catch {
      setError("Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              Forgot Password View                          */
  /* -------------------------------------------------------------------------- */
  if (forgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header with Back Button */}
          <button
            onClick={() => setForgotPassword(false)}
            className="text-gray-400 flex items-center gap-2 mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to login</span>
          </button>

          {/* Main Card */}
          <div className="bg-gray-950/90 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                  {success}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Send Reset Email"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              Main Login/Signup View                        */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Hero Image/Logo Section */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa3e1?w=128&h=128&fit=crop&auto=format"
              alt="TapeSure Logo"
              className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-blue-500/20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TapeSure</h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Welcome back! Sign in to continue" : "Create an account to get started"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-950/90 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 shadow-xl">
          {/* Toggle Switch */}
          <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-950 text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {isLogin && (
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Terms and Privacy */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our{" "}
            <button className="text-blue-400 hover:text-blue-300">Terms of Service</button>
            {" "}and{" "}
            <button className="text-blue-400 hover:text-blue-300">Privacy Policy</button>
          </p>
        </div>

        {/* Bottom Image/Pattern */}
        <div className="mt-8 text-center">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd0b2e9b3e9b?w=400&h=100&fit=crop&auto=format"
            alt="Tailoring pattern"
            className="w-full h-20 object-cover rounded-xl opacity-30"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;