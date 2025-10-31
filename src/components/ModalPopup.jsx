import { useState, useEffect } from "react";
import LoadingButton from "./LoadingButton";

const ModalPopup = ({
  isOpen,
  title,
  children, // For custom content like forms or the ConfirmPopup message
  confirmText, // Optional: for confirmation modals
  cancelText = "Cancel", // Optional: default to "Cancel"
  onConfirm, // Optional: for confirmation modals
  onCancel, // Optional: for closing the modal
  countdownSeconds, // Optional: for countdown functionality
  loading = false, // Optional: parent-provided loading state
  isClosable = true, // Controls if modal can be closed by clicking outside or close button
  onClose, // Optional: callback when modal is closed
  resetForm, // Optional: function to reset form data when modal closes
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

  // Reset countdown and form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      setIsConfirmEnabled(false);
    }
  }, [isOpen, countdownSeconds]);

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen || !countdownSeconds || countdown <= 0) return;

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
  }, [isOpen, countdownSeconds]);

  // Handle closing the modal
  const handleClose = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
    if (resetForm) resetForm(); // Reset form data when closing
  };

  // Handle clicking outside the modal
  const handleOverlayClick = (e) => {
    if (isClosable && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      aria-labelledby="popupTitle"
      aria-modal="true"
      role="dialog"
      style={{ backgroundColor: "#00000038" }}
      onClick={handleOverlayClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="popupTitle">
              {title}
            </h5>

            {isClosable && (
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleClose}
              ></button>
            )}
          </div>

          <div className="modal-body">{children}</div>

          {(onConfirm || onCancel) && (
            <div className="modal-footer">
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  {cancelText}
                </button>
              )}

              {onConfirm && (
                <LoadingButton
                  type="button"
                  className="btn btn-danger"
                  onClick={onConfirm}
                  loading={loading}
                  disabled={countdownSeconds && (!isConfirmEnabled || loading)}
                >
                  {countdownSeconds && !isConfirmEnabled && !loading
                    ? `${confirmText} (${countdown})`
                    : confirmText}
                </LoadingButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPopup;
