export default function LoadingButton({
  loading,
  children,
  className = "btn btn-primary",
  ...props
}) {
  return (
    <button
      className={className}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? "Loading, please wait" : undefined}
      {...props}
    >
      {loading && <span className="spinner-border spinner-border-sm me-2" />}
      {loading ? "Loading..." : children}
    </button>
  );
}
