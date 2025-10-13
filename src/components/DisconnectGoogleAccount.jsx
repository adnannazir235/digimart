import { useState } from "react";
import LoadingButton from "./LoadingButton";
import GoogleLogo from "../assets/google/logo.png";

export default function DisconnectGoogleAccount() {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingButton loading={loading} className="btn btn-sm btn-outline-danger">
      Disconnect Google Account
      <img
        src={GoogleLogo}
        height="20"
        className="ms-2"
        alt="Google's Logo - PNG"
      />
    </LoadingButton>
  );
}
