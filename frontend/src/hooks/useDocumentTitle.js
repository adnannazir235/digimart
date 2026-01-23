import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useDocumentTitle() {
  const location = useLocation();
  const siteName = "DigiMart | ";

  useEffect(() => {
    const titleMap = {
      "/": siteName + "Home",
      "/products": siteName + "Browse Products",
      "/products/:id": siteName + "Product Details",   // ← base fallback for /products/*
      "/contact": siteName + "Contact",
      "/about": siteName + "About",
      "/signup": siteName + "Create Account",
      "/check-email": siteName + "Check Your Email",
      "/login": siteName + "Log In",
      "/forgot-password": siteName + "Reset Password",
      "/reset-password": siteName + "Set New Password",
      "/cart": siteName + "Shopping Cart",
      "/settings": siteName + "Account Settings",

      // Seller dashboard & nested routes
      "/seller/dashboard": siteName + "Seller Dashboard",
      "/seller/dashboard/products": siteName + "My Products",
      "/seller/dashboard/orders-and-sales": siteName + "Orders & Sales",
      "/seller/dashboard/shop": siteName + "My Shop",

      // Buyer dashboard & nested routes
      "/buyer/dashboard": siteName + "Buyer Dashboard",
      "/buyer/dashboard/orders": siteName + "My Orders",
      "/buyer/create-shop": siteName + "Create Your Shop",

      // Special / callback pages
      "/stripe/callback": siteName + "Connecting Stripe…",
    };

    let title = "DigiMart"; // ultimate fallback

    // 1. Try exact match first
    if (location.pathname in titleMap) {
      title = titleMap[location.pathname];
    }
    // 2. Dynamic product detail page
    else if (location.pathname.startsWith("/products/")) {
      title = siteName + "Product Details";
      // Optional: if you later have product name in context/params → you can make it dynamic
      // title = siteName + productName || "Product Details";
    }
    // 3. Seller order / sale detail pages
    else if (location.pathname.startsWith("/seller/dashboard/orders-and-sales/orders/")) {
      title = siteName + "Order Details";
    }
    else if (location.pathname.startsWith("/seller/dashboard/orders-and-sales/sales/")) {
      title = siteName + "Sale Details";
    }
    // 4. Buyer order detail
    else if (location.pathname.startsWith("/buyer/dashboard/orders/")) {
      title = siteName + "Order Details";
    }
    // 5. 404 & unknown routes → keep default or use something short
    // (already handled by fallback "DigiMart")

    document.title = title;
  }, [location.pathname]); // ← only pathname is enough in most cases

  return null; // This is a side-effect-only hook
};