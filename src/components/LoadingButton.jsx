export default function LoadingButton({
  loading,
  children,
  className = "btn btn-primary",
  ...props
}) {
  return (
    <button
      className={`${className} ${loading ? "disabled" : ""}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
