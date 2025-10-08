import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="text-center text-lg-start bg-light">
      <div className="text-center p-4">
        © 2025 Copyright:{" "}
        <Link aria-current="page" to="/">
          DigiMart
        </Link>
      </div>
    </footer>
  );
}
