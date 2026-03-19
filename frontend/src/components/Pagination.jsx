import { GrFormPrevious, GrFormNext } from "react-icons/gr";

export default function Pagination({ currentPage, totalPages, onPageChange, alignment = "center" }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 2; // How many pages to show around current
    for (let i = Math.max(1, currentPage - windowSize); i <= Math.min(totalPages, currentPage + windowSize); i++) {
      pages.push(i);
    }
    return pages;
  };

  if (alignment === "left") {
    alignment = "justify-content-start"
  }
  else if (alignment === "right") (
    alignment = "justify-content-end"
  )
  else {
    alignment = "justify-content-center";
  }

  return (
    <nav className="mt-5" aria-label="Product navigation">
      <ul className={`pagination ${alignment}`}>
        {/* First & Previous */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}><GrFormPrevious /></button>
        </li>

        {getPageNumbers().map(num => (
          <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(num)}>{num}</button>
          </li>
        ))}

        {/* Next & Last */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}><GrFormNext /></button>
        </li>
      </ul>
    </nav>
  );
}
