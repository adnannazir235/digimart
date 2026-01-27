import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { BsStripe } from "react-icons/bs";
import { IoLogoVercel } from "react-icons/io5";
import { SiMongodb, SiRender } from "react-icons/si";
import {
  FaCode,
  FaDatabase,
  FaServer,
  FaShoppingBag,
  FaUserLock,
  FaPaintBrush,
  FaCreditCard,
  FaEnvelope,
  FaCheckCircle,
  FaVial,
  FaGithub,
} from "react-icons/fa";

const PLATFORM_FEE_PERCENT = parseFloat(
  import.meta.env.VITE_PLATFORM_FEE_PERCENT || "10",
);

export default function About() {
  return (
    <Container className="py-5 my-5">
      <Row className="justify-content-center mb-5">
        <Col lg={10} xl={8} className="text-center">
          <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">
            <FaVial className="me-2" />
            First Full MERN E-Commerce Project
          </Badge>

          <h1 className="display-4 fw-bold mb-4">
            About <span className="text-primary">DigiMart</span>
          </h1>

          <p className="lead text-secondary mb-4">
            A complete digital marketplace built from scratch to master
            full-stack development, secure payments, and real-world e-commerce
            flows.
          </p>
        </Col>
      </Row>

      <h3 className="fs-2 fw-bold text-center pt-5 mb-5">Core Features</h3>
      <Row className="g-4 pb-5 mb-5">
        <Col md={6} lg={3}>
          <FeatureCard
            icon={<FaUserLock size={28} />}
            title="Secure Auth"
            description="Email + Google OAuth, JWT access/refresh tokens, HTTP-only cookies."
          />
        </Col>

        <Col md={6} lg={3}>
          <FeatureCard
            icon={<FaShoppingBag size={28} />}
            title="Role-Based Flows"
            description="Separate buyer & seller dashboards, product CRUD, order management."
          />
        </Col>

        <Col md={6} lg={3}>
          <FeatureCard
            icon={<FaPaintBrush size={28} />}
            title="Digital Assets"
            description="Cloudinary storage, automatic watermarking, secure file delivery."
          />
        </Col>

        <Col md={6} lg={3}>
          <FeatureCard
            icon={<FaCreditCard size={28} />}
            title="Stripe Payments"
            description={`Hosted Checkout + Connect. Platform takes ${PLATFORM_FEE_PERCENT}% fee.`}
          />
        </Col>
      </Row>

      <h3 className="fs-2 fw-bold text-center pt-5 mb-5">Tech Stack</h3>
      <Row className="g-4 pb-5 mb-5">
        <Col lg={6}>
          <TechCard
            title="Frontend"
            icon={<FaCode size={28} />}
            items={[
              "React 19 + Vite",
              "Redux Toolkit",
              "React Router v7",
              "Formik & Yup",
              "Bootstrap 5",
              "React Toastify",
            ]}
            showBadge={false}
          />
        </Col>

        <Col lg={6}>
          <TechCard
            title="Backend"
            icon={<FaServer size={28} />}
            items={[
              "Node.js + Express",
              "MongoDB (Mongoose)",
              "JWT Authentication",
              "Multer + Cloudinary",
              "Nodemailer",
              "Stripe Connect",
            ]}
            showBadge={false}
          />
        </Col>
      </Row>

      <h3 className="fs-2 fw-bold text-center pt-5 mb-5">Key Highlights</h3>
      <Row className="g-4 pb-5 mb-5">
        <Col lg={6}>
          <SystemCard
            title="Database Structure"
            icon={<FaDatabase size={28} />}
          >
            <ul className="list-unstyled mb-0">
              <li className="mb-3">
                <strong className="text-primary">Users:</strong> Profiles, auth,
                roles/dashboards
              </li>
              <li className="mb-3">
                <strong className="text-primary">Shops:</strong> Seller
                storefronts linked to users
              </li>
              <li className="mb-3">
                <strong className="text-primary">Products:</strong> Digital
                files, metadata, stats
              </li>
              <li>
                <strong className="text-primary">Orders:</strong> Transactions,
                buyer-seller linking
              </li>
            </ul>
          </SystemCard>
        </Col>

        <Col lg={6}>
          <SystemCard
            title="Communication & Logic"
            icon={<FaEnvelope size={28} />}
          >
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <FaCheckCircle className="text-primary me-2" />
                Account Verification
              </li>
              <li className="mb-2">
                <FaCheckCircle className="text-primary me-2" />
                Password Reset & Change Alerts
              </li>
              <li className="mb-2">
                <FaCheckCircle className="text-primary me-2" />
                Shop Creation Confirmation
              </li>
              <li className="mb-2">
                <FaCheckCircle className="text-primary me-2" />
                Purchase Receipts
              </li>
            </ul>
          </SystemCard>
        </Col>
      </Row>

      <div className="text-center p-5 bg-body border rounded-4 shadow-sm">
        <h5 className="fs-4 fw-bold mb-5">Current Deployment</h5>
        <Row className="g-4 justify-content-center">
          <Col md={3}>
            <div className="p-4 rounded-3 bg-body border border-light-subtle">
              <h6 className="mb-4">Frontend</h6>
              <p className="fs-4 text-primary mb-0 d-flex flex-column align-items-center justify-content-center row-gap-1">
                <IoLogoVercel size={25} />
                <span>Vercel</span>
              </p>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="p-4 rounded-3 bg-body border border-light-subtle">
              <h6 className="mb-4">Backend</h6>
              <p className="fs-4 text-primary mb-0 d-flex flex-column align-items-center justify-content-center row-gap-1">
                <SiRender size={25} />
                <span>Render</span>
              </p>
            </div>
          </Col>

          <Col md={3}>
            <div className="p-4 rounded-3 bg-body border border-light-subtle">
              <h6 className="mb-4">Database</h6>
              <p className="fs-4 text-primary mb-0 d-flex flex-column align-items-center justify-content-center row-gap-1">
                <SiMongodb size={25} />
                <span>MongoDB Atlas</span>
              </p>
            </div>
          </Col>

          <Col md={3}>
            <div className="p-4 rounded-3 bg-body border border-light-subtle">
              <h6 className="mb-4">Payments</h6>
              <p className="fs-4 text-primary mb-0 d-flex flex-column align-items-center justify-content-center row-gap-1">
                <BsStripe size={25} />
                <span>Stripe</span>
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-100 border shadow-sm bg-body hover-lift transition-all">
      <Card.Body className="p-4 d-flex flex-column text-center">
        <div className="text-primary mb-3 fs-3">{icon}</div>
        <h5 className="fw-bold mb-3">{title}</h5>
        <p className="text-muted small mb-0 flex-grow-1">{description}</p>
      </Card.Body>
    </Card>
  );
}

function TechCard({ title, icon, items, badgeUrl, showBadge = false }) {
  return (
    <Card className="h-100 border shadow-sm bg-body hover-lift transition-all">
      <Card.Header className="bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="text-primary fs-4">{icon}</div>
          <h6 className="fw-bold mb-0">{title}</h6>
        </div>

        {showBadge && (
          <a
            href={badgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
          >
            <Badge
              bg="primary"
              pill
              className="px-3 py-2 d-flex align-items-center gap-2"
            >
              <FaGithub /> Open Source
            </Badge>
          </a>
        )}
      </Card.Header>

      <Card.Body className="p-4">
        <div className="d-flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge
              key={i}
              bg="outline-primary"
              text="primary"
              className="fw-medium px-3 py-2 border"
            >
              {item}
            </Badge>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

function SystemCard({ title, icon, children }) {
  return (
    <Card className="h-100 border shadow-sm bg-body hover-lift transition-all">
      <Card.Header className="bg-transparent border-bottom py-3 d-flex align-items-center gap-3">
        <div className="text-primary fs-4">{icon}</div>
        <h6 className="fw-bold mb-0">{title}</h6>
      </Card.Header>
      <Card.Body className="p-4">{children}</Card.Body>
    </Card>
  );
}
