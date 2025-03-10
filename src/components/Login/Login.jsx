import React from "react";
import { toast } from "react-toastify";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
function Login({ setUser }) {
  const [loading, setLoading] = React.useState(false);
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      // Add these provider settings for better UX
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Update parent component state
      setUser({
        uid: user.uid,
        name: user.displayName,
        nameLowercase: user.displayName.toLowerCase(),
        email: user.email,
        avatar: user.photoURL,
        emailVerified: user.emailVerified,
      });

      // Add user to Firestore

      const userRef = doc(db, "users", user.uid);
      const userChatRef = doc(db, "userChats", user.uid);

      await setDoc(userRef, {
        name: user.displayName,
        nameLowercase: user.displayName.toLowerCase(),
        email: user.email,
        avatar: user.photoURL,
        emailVerified: user.emailVerified,
        id: user.uid,
        blocked: [],
      });

      await setDoc(userChatRef, {
        chats: [],
      });
      toast.success(`Welcome ${user.displayName}!`);
      window.location.href = "/";
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(`Sign-in failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white p-10">
      <div className="flex flex-col items-center gap-5 bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Welcome to Chat App</h1>
        <h2 className="text-xl font-semibold mb-6">Sign in to continue</h2>
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all 
          duration-300 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {/* Google logo SVG path */}
            <path
              fill="currentColor"
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.835 0 3.456.705 4.691 1.942l3.099-3.099A9.97 9.97 0 0012.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.936 9.936 0 00-1.855-5.714l-5.432 5.432z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-sm text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Login;
