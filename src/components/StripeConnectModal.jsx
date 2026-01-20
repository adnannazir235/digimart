import { useState } from "react";
import { toast } from "react-toastify";
import { toastOptions } from "../../config/styles";
import { paymentAPI } from "../services/api";
import ModalPopup from "./ModalPopup";

export default function StripeConnectModal({ isOpen, onCancel }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      const res = await paymentAPI.getStripeConnectUrl();
      //   console.log(res.data);
      window.location.href = res.data.data.url; // Redirect to Stripe OAuth
    } catch (err) {
      toast.error("Failed to initiate Stripe connection", toastOptions);
      setIsConnecting(false);
    }
  };

  return (
    <ModalPopup
      title="Connect Stripe Account"
      isOpen={isOpen}
      onCancel={onCancel}
      confirmText="Connect Stripe"
      onConfirm={handleConnectStripe}
      loading={isConnecting}
      isClosable={true}
    >
      <p>
        You need to connect a Stripe account to start adding/selling products.
        Click the "Connect Stripe" button below, to set up or connect your
        Stripe account.
      </p>
    </ModalPopup>
  );
}
