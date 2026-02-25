import { FaSearch } from "react-icons/fa";

export default function ProductSearchBar({
  filters,
  filteredProducts,
  handleChange,
}) {
      
  return (
    <div className="col-12 col-md-5 col-lg-8">
      <div className="input-group">
        <span className="input-group-text border-end-0">
          <FaSearch className="text-muted" />
        </span>

        <input
          type="search"
          id="searchValue"
          className="form-control border-start-0 rounded-end"
          placeholder="Search by product name..."
          name="searchValue"
          value={filters.searchValue || ""}
          onChange={handleChange}
          list="products"
          autoComplete="off"
        />

        <datalist id="products">
          {filteredProducts
            .filter((p) => p?._id && p?.title)
            .map((product) => (
              <option
                key={product._id}
                value={product.title}
                label={`${product.price / 100} ${product.currencyCode}`}
              />
            ))}
        </datalist>
      </div>
    </div>
  );
}
