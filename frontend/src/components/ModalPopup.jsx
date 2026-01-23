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
    // FIX: Do NOT check 'countdown' state here. It is stale on open.
    // Only check if the prop exists and modal is open.
    if (!isOpen || !countdownSeconds) return;

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
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Slightly darker overlay
      onClick={handleOverlayClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div 
          className="modal-content"
        >
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold" id="popupTitle">
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
            <div className="modal-footer border-top-0 pt-0">
              {onCancel && (
                <button
                  type="button"
                  className="btn rounded-pill px-4" // Modern secondary button
                  onClick={handleClose}
                >
                  {cancelText}
                </button>
              )}

              {onConfirm && (
                <LoadingButton
                  type="button"
                  className="btn btn-danger rounded-pill px-4 shadow-sm" // Modern primary button
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