import { IoIosArrowBack } from "react-icons/io";

export default function BackButton({ onClick, children }) {
  return (
    <button
      className="btn btn-outline-primary btn-sm p-2 d-flex align-items-center gap-2 border"
      onClick={onClick}
    >
      <IoIosArrowBack size={20} />
      <span className="fw-medium">{children}</span>
    </button>
  );
}
