import { useState, useEffect } from "react";
import LoadingButton from "./LoadingButton";

const ConfirmPopup = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  countdownSeconds,
  loading, // Use parent-provided loading state
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      setIsConfirmEnabled(false);
    }
  }, [isOpen, countdownSeconds]);

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;

        if (newCount === 0) {
          setIsConfirmEnabled(true); // Enable Confirm button when countdown reaches 0
        }
        return newCount;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer on unmount or when modal closes
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      aria-labelledby="popupTitle"
      aria-modal="true"
      role="dialog"
      style={{ backgroundColor: "#00000038" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="popupTitle">
              {title}
            </h5>
          </div>

          <div className="modal-body">
            <p>{message}</p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>

            <LoadingButton
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              loading={loading} // Use parent loading state
              disabled={!isConfirmEnabled || loading}
            >
              {isConfirmEnabled && !loading
                ? confirmText
                : `${confirmText} (${countdown})`}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
