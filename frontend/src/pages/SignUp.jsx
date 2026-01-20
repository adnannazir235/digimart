import { useState } from "react";
import { authAPI } from "../services/api";
import SignUpForm from "../components/SignUpForm";

export default function SignUp() {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAuthRedirect = () => {
    setGoogleLoading(true);
    console.log("SignUp.jsx: Initiating Google auth redirect");
    authAPI.googleAuth("settings");
  };

  return (
    <section className="container-fluid py-5">
      <div className="container">
        <div
          className="row justify-content-center"
          style={{ minHeight: "69dvh" }}
        >
          <div className="col">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Create Account!
            </h1>

            <p className="text-gray-500 text-center mb-4">
              Create your account on digimart.
            </p>

            <SignUpForm
              handleGoogleAuth={handleGoogleAuthRedirect}
              googleLoading={googleLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
