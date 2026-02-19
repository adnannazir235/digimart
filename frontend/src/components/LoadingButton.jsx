export default function LoadingButton({
  loading,
  isDisabled,
  children,
  showText = true,
  className = "btn btn-primary",
  ...props
}) {
  return (
    <button
      className={className}
      disabled={isDisabled}
      aria-busy={loading}
      aria-label={loading ? "Loading, please wait" : undefined}
      {...props}
    >
      {loading && <span className={`spinner-border spinner-border-sm ${showText === true ? "me-2" : ""}`} />}
      {loading ? showText && "Loading..." : children}
    </button>
  );
}
