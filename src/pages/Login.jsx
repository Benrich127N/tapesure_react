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
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";



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

  const [view, setView] = useState("main");

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [fullName,setFullName] = useState("");

  const [showPassword,setShowPassword] = useState(false);
  // const [showConfirm,setShowConfirm] = useState(false);

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");


/* -------------------------------------------------------------------------- */
/*                            After Auth (Firestore)                          */
/* -------------------------------------------------------------------------- */

const afterAuth = async (user) => {

  const ref = doc(db,"users",user.uid);

  await setDoc(ref,{
    uid:user.uid,
    email:user.email,
    fullName:user.displayName || fullName,
    role:"tailor",
    lastLogin:serverTimestamp()
  },{merge:true});

  const snap = await getDoc(ref);

  if(snap.data()?.onboardingCompleted){
    navigate("/");
  }else{
    navigate("/onboarding");
  }

};



/* -------------------------------------------------------------------------- */
/*                                Google Login                                */
/* -------------------------------------------------------------------------- */

const handleGoogle = async () => {

  setLoading(true);
  setError("");

  try{

    const result = await signInWithPopup(auth,googleProvider);

    await afterAuth(result.user);

  }catch{

    setError("Google sign in failed");

  }

  setLoading(false);

};



/* -------------------------------------------------------------------------- */
/*                                Email Login                                 */
/* -------------------------------------------------------------------------- */

const handleLogin = async (e) => {

  e.preventDefault();

  setLoading(true);
  setError("");

  try{

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await afterAuth(result.user);

  }catch{

    setError("Invalid email or password");

  }

  setLoading(false);

};



/* -------------------------------------------------------------------------- */
/*                                  Signup                                    */
/* -------------------------------------------------------------------------- */

const handleSignup = async (e) => {

  e.preventDefault();

  if(password !== confirmPassword){
    setError("Passwords do not match");
    return;
  }

  if(password.length < 6){
    setError("Password must be at least 6 characters");
    return;
  }

  setLoading(true);
  setError("");

  try{

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await afterAuth(result.user);

  }catch{

    setError("Account creation failed");

  }

  setLoading(false);

};



/* -------------------------------------------------------------------------- */
/*                              Password Reset                                */
/* -------------------------------------------------------------------------- */

const handleReset = async (e) => {

  e.preventDefault();

  setLoading(true);
  setError("");

  try{

    await sendPasswordResetEmail(auth,email);

    setSuccess("Password reset email sent");

  }catch{

    setError("Unable to send reset email");

  }

  setLoading(false);

};



/* -------------------------------------------------------------------------- */
/*                                   Views                                    */
/* -------------------------------------------------------------------------- */

if(view === "main"){
return(

<Screen>

<h1 className="text-white text-xl font-bold text-center mb-6">
TapeSure
</h1>

<button
onClick={handleGoogle}
className="btn-primary"
>
<GoogleIcon/>
Continue with Google
</button>

<button
onClick={()=>setView("signup")}
className="btn-secondary"
>
Create Account
</button>

<button
onClick={()=>setView("login")}
className="btn-secondary"
>
Sign in with Email
</button>

</Screen>

)
}



/* ------------------------------ LOGIN VIEW ------------------------------ */

if(view === "login"){
return(

<Screen>

<Back setView={setView} to="main"/>

<form onSubmit={handleLogin} className="space-y-4">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="input"
/>

<div className="relative">

<input
type={showPassword?"text":"password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="input"
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="eye"
>
{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>

</div>

{error && <p className="error">{error}</p>}

<button
type="submit"
className="btn-primary"
>
{loading ? <Loader2 className="animate-spin"/> : "Sign In"}
</button>

</form>

<button
onClick={()=>setView("forgot")}
className="text-blue-400 text-sm mt-4"
>
Forgot password?
</button>

</Screen>

)
}



/* ------------------------------ SIGNUP VIEW ------------------------------ */

if(view === "signup"){
return(

<Screen>

<Back setView={setView} to="main"/>

<form onSubmit={handleSignup} className="space-y-4">

<input
placeholder="Full Name"
value={fullName}
onChange={(e)=>setFullName(e.target.value)}
className="input"
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="input"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="input"
/>

<input
type="password"
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
className="input"
/>

{error && <p className="error">{error}</p>}

<button
type="submit"
className="btn-primary"
>
{loading ? <Loader2 className="animate-spin"/> : "Create Account"}
</button>

</form>

</Screen>

)
}



/* ------------------------------ RESET VIEW ------------------------------ */

if(view === "forgot"){
return(

<Screen>

<Back setView={setView} to="login"/>

<form onSubmit={handleReset} className="space-y-4">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="input"
/>

{error && <p className="error">{error}</p>}
{success && <p className="text-green-400">{success}</p>}

<button className="btn-primary">
Send Reset Email
</button>

</form>

</Screen>

)
}

};



/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

const Back = ({setView,to}) => (
<button
onClick={()=>setView(to)}
className="text-gray-400 flex items-center gap-1 mb-6"
>
<ArrowLeft size={16}/>
Back
</button>
);


const Screen = ({children}) => (

<div className="min-h-screen flex items-center justify-center bg-black">

<div className="w-full max-w-sm bg-gray-950 p-8 rounded-xl border border-gray-800">

{children}

</div>

</div>

);



export default Login;
