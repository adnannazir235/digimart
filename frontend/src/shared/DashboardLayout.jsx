import { Row, Col, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiDollarSign,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export default function DashboardLayout({ type = "seller" }) {
  const location = useLocation();

  // 1. GRAB CONTEXT FROM PARENT (SellerDashboard or BuyerDashboard)
  const parentContext = useOutletContext();

  const sellerLinks = [
    { to: "products", label: "Products", icon: <FiGrid /> },
    { to: "orders-and-sales", label: "Orders & Sales", icon: <FiDollarSign /> },
    { to: "shop", label: "Shop Settings", icon: <FaStore /> },
  ];

  const buyerLinks = [
    { to: "orders", label: "My Orders", icon: <FiShoppingBag /> },
  ];

  const links = type === "seller" ? sellerLinks : buyerLinks;

  return (
    <div>
      <Row>
          <Nav
            variant="pills"
            className="col-12 col-lg-2 col-sm-3 nav nav-pills row-gap-3 p-3 flex-row flex-sm-column"
            defaultActiveKey={location.pathname}
          >
            {links.map((link) => (
              <LinkContainer key={link.to} to={link.to}>
                <Nav.Link
                  className={`d-flex align-items-center gap-3 rounded-3 px-4 py-2 border ${location.pathname.endsWith(link.to) ? "hover-bg-light nav-link active"
                  : "bg-white text-secondary hover-bg-light"}`}
                >
                  {link.icon}
                  <span className="fw-medium">{link.label}</span>
                </Nav.Link>
              </LinkContainer>
            ))}
          </Nav>

        {/* Main Content */}
        <Col xs={12} lg={10} style={{ minHeight: "80dvh" }}>
          <div className="p-4 p-lg-5">
            <Outlet context={parentContext} />
          </div>
        </Col>
      </Row>
    </div>
  );
};
