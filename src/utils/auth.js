export function validateAuth(mode, email, password) {
  const errors = {};
  const address = email.trim();
  if (!address) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  else if (mode === "signup" && password.length < 6) errors.password = "Use at least 6 characters for your password.";
  return errors;
}

export function authErrorMessage(error, context = "login") {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return context === "reset" ? "Check your email for reset instructions if an account exists." : "The email or password is incorrect. Try again or reset your password.";
    case "auth/email-already-in-use": return "This email is already registered. Sign in instead, or reset your password.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements": return "Choose a stronger password and try again.";
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/too-many-requests": return "Too many attempts. Wait a little before trying again.";
    case "auth/network-request-failed": return "Could not connect. Check your connection and try again.";
    case "auth/popup-blocked": return "Your browser blocked Google sign-in. Allow pop-ups for this site, or sign in with email.";
    case "auth/account-exists-with-different-credential": return "This email uses another sign-in method. Use the method you originally registered with.";
    case "auth/user-disabled": return "This account is unavailable. Try another account or contact support.";
    case "auth/operation-not-allowed": return "This sign-in method is currently unavailable. Try another method.";
    default: return context === "reset" ? "Could not request a reset link. Check your connection and try again." : context === "signup" ? "Could not create your account. Please try again." : "Could not sign in. Please try again.";
  }
}
export const googleCancelled = error => ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(error?.code);
