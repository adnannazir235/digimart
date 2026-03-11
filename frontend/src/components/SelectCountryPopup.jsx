import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setIsCountrySelected } from "../features/auth/authSlice";
import { userAPI } from "../services/api";
import { limitations } from "../../config/validation";
import { toastOptions } from "../../config/styles";
import ModalPopup from "./ModalPopup";

export default function SelectCountryPopup({ isOpen }) {
  const dispatch = useDispatch();
  const [show, setShow] = useState(isOpen);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCountry) {
      toast.error("Please select your country", toastOptions());
      return;
    }

    setLoading(true);

    try {
      await userAPI.addCountry({ country: selectedCountry });
      toast.success("Country added successfully!", toastOptions());

      // ── This is the key line ──
      dispatch(setIsCountrySelected(false)); // ← updates user.isCountrySelected → popup vanishes
      handleClose(); // safe to call now
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to save country. Please try again.",
        toastOptions(),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <ModalPopup
      isOpen={show}
      title="Your Country"
      onClose={handleSkip}
      isClosable={false}
      cancelText="Skip for now"
      onCancel={handleSkip}
      confirmText="Save Country"
      onConfirm={handleSubmit}
      loading={loading}
    >
      <p className="text-muted mb-4">
        To give you the best experience, we recommend selecting your country.
      </p>

      <form className="mb-4">
        <label className="form-label fw-bold">Country</label>
        <select
          className="form-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          disabled={loading}
        >
          <option value="">Select your country</option>
          {limitations.user.allowedCountries.map((country) => (
            <option key={country.name.toLowerCase()} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </form>
    </ModalPopup>
  );
}
