// SellerDashboard.jsx
import { useSellerData } from "../hooks/useSellerData";

export default function SellerDashboard() {
  const { data, loading, error } = useSellerData();

  if (loading) return <div>Loading seller dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Not a seller</div>;

  return (
    <div>
      <h1>Seller Dashboard</h1>
      <p>Products: {data.products.length}</p>
      <p>Orders: {data.orders.length}</p>
    </div>
  );
}
