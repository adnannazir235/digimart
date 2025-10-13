import { useState } from "react";
import LoadingButton from "./LoadingButton";

export default function DeleteAccount() {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingButton loading={loading} className="btn btn-sm btn-outline-danger">
      Delete Account
    </LoadingButton>
  );
}
