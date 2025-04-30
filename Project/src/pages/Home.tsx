import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
// import CountUp from 'react-countup';
import {
  ArrowRight,
  Battery,
  BarChart3,
  BarChart,
  Briefcase,
  Home as HomeIcon,
  Sun,
  Zap,
  Shield,
  Users,
  Car,
  CheckCircle2,
  Clock,
  Sparkles,
  Lightbulb,
  Droplets,
  Flame,
  Mountain,
  Leaf,
  Calendar,
  Wallet,
} from "lucide-react";

import { SiteVisitForm } from "../components/SiteVisitForm";
import { Button } from "../components/Button";
import { ImageCarousel } from "../components/ImageCarousel";
import { Link } from "react-router-dom"; // Fix the Link import to resolve the lint error
import { supabase } from "../lib/supabaseClient";

// Types for products
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  capacity_kw: number;
  price: number;
  image_url: string;
  description: string;
  warranty_years: number;
  installation_days: number;
  subsidy_amount: number;
}

// Fallback product data in case database is empty
const fallbackProducts: Product[] = [
  {
    id: "fallback-1",
    sku: "APN-OFFGRID-1KW",
    name: "1kW Off-Grid Solar System",
    category: "off-grid",
    capacity_kw: 1,
    price: 42000,
    image_url:
      "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/1kW%20off-grid%20solar%20system.png",
    description:
      "Complete 1kW off-grid solar system for homes and small offices",
    warranty_years: 25,
    installation_days: 3,
    subsidy_amount: 15600,
  },
  {
    id: "fallback-3",
    sku: "APN-OFFGRID-3KW",
    name: "3kW Off-Grid Solar System",
    category: "off-grid",
    capacity_kw: 3,
    price: 126000,
    image_url:
      "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/3kW%20off-grid%20solar%20system.png",
    description: "Complete 3kW off-grid solar system for medium-sized homes",
    warranty_years: 25,
    installation_days: 4,
    subsidy_amount: 46800,
  },
  {
    id: "fallback-5",
    sku: "APN-OFFGRID-5KW",
    name: "5kW Off-Grid Solar System",
    category: "off-grid",
    capacity_kw: 5,
    price: 210000,
    image_url:
      "https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/5kW%20off-grid%20solar%20system.png",
    description: "Complete 5kW off-grid solar system for large homes",
    warranty_years: 25,
    installation_days: 5,
    subsidy_amount: 78000,
  },
];

function Home() {
  const [roofSize, setRoofSize] = useState<number>(5);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(
    null
  );
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from database when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching products from Supabase...");
        const { data, error } = await supabase
          .from("product_skus")
          .select("*")
          .order("capacity_kw", { ascending: true });

        if (error) {
          console.error("Supabase Error:", error);
          setError("Failed to fetch products from database");
          // Use fallback data
          setProducts(fallbackProducts);
          return;
        }

        console.log("Supabase response:", data);

        if (data && data.length > 0) {
          setProducts(data as Product[]);
          console.log("Products loaded successfully:", data.length, "items");
        } else {
          console.warn("No products found in database, using fallback data");
          // Use fallback data if no products in database
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
        // Use fallback data in case of error
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update recommended product when roof size changes
  useEffect(() => {
    if (products.length === 0) {
      console.log("No products available to select from");
      return;
    }

    // Find the product with power closest to the selected roof size
    try {
      const closest = products.reduce((prev, curr) => {
        return Math.abs(curr.capacity_kw - roofSize) <
          Math.abs(prev.capacity_kw - roofSize)
          ? curr
          : prev;
      });

      console.log(
        "Selected recommended product:",
        closest.name,
        `(${closest.capacity_kw}kW)`
      );
      setRecommendedProduct(closest);
    } catch (err) {
      console.error("Error selecting recommended product:", err);
      // If unable to find closest match, use first product as fallback
      if (products.length > 0) {
        setRecommendedProduct(products[0]);
      }
    }
  }, [roofSize, products]);

  // Calculate all ROI values reactively using useMemo
  // This guarantees values update whenever any dependency changes
  const roiValues = useMemo(() => {
    console.log(`Calculating values with roofSize=${roofSize}`);

    // Solar installation ROI calculation
    const monthlyBill = roofSize * 1000;
    const yearlyBill = monthlyBill * 12;
    const monthlyWattage = roofSize * 140; // Approx 140 kWh per kW per month
    const area = Math.round(roofSize * 8 * 10.764);

    return {
      monthly: monthlyBill,
      yearly: yearlyBill,
      monthlyWattage,
      area,
      payback: 4,
    };
  }, [roofSize]);

  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Debug logging whenever roofSize changes
  useEffect(() => {
    console.log("roofSize changed to:", roofSize);

    const monthlyBill = roofSize * 1000;
    const yearlyBill = monthlyBill * 12;
    const monthlyWattage = roofSize * 140;
    const area = Math.round(roofSize * 8 * 10.764);

    console.log("Updating ROI values directly in useEffect:", {
      monthly: monthlyBill,
      yearly: yearlyBill,
      monthlyWattage,
      area,
      payback: 4,
    });
  }, [roofSize]);

  // Use roiValues instead of calling calculateROI directly in the render function
  return (
    <div className="min-h-screen">
      {/* Hero Section: Rooftop Solar */}
      <section className="relative min-h-[80vh] flex items-center py-8 md:py-12 lg:py-16">
        {/* Video Background with Enhanced Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Enhanced gradient overlay for better text contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, rgba(204, 255, 0, 0.2) 0%, rgba(0, 0, 0, 0) 60%)",
              animation: "pulse 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 70% 30%, rgba(0, 225, 255, 0.15) 0%, rgba(0, 0, 0, 0) 60%)",
              animation: "pulse 8s ease-in-out infinite alternate",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />

          {/* Premium background container - removed image */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Decorative circle accent like in service cards */}
            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary/10 transition-all duration-500" />
            <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-secondary/10 transition-all duration-500" />

            {/* Subtle border overlay for glass effect */}
            <div className="absolute inset-0 border-t border-white/5 bg-[#0A0A0A]" />

            {/* Replaced background image with modern gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #0A0A0A 0%, #121212 100%)",
                backgroundSize: "400% 400%",
              }}
            >
              {/* Grid pattern overlay for texture */}
              <div
                className="absolute inset-x-0 top-[15px] bottom-[10px]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
                  backgroundSize: "30px 30px",
                }}
              />
              {/* Subtle animated glow spots with native animation classes */}
              <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
              <div
                className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              />
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 -right-20 w-80 h-80 rounded-full border border-primary/20 opacity-20"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2], y: [0, 20, 0] }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-1/4 -left-40 w-96 h-96 rounded-full border border-secondary/20 opacity-20"
          />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-6 max-w-6xl pt-8 md:pt-16"
        >
          {/* ImageCarousel for mobile (top) */}
          <div className="block md:hidden mb-8 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-56 xs:h-72 sm:h-80 rounded-2xl overflow-hidden flex items-center"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-black/5">
                <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(45deg, rgba(204, 255, 0, 0.3) 0%, rgba(0, 225, 255, 0.15) 50%, rgba(204, 255, 0, 0.3) 100%)",
                      backgroundSize: "200% 200%",
                      animation: "gradientBorder 8s linear infinite",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />
                <div className="absolute inset-0 z-0">
                  <ImageCarousel />
                </div>
                <div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Left side content - Enhanced for mobile */}
                <div className="text-left">
                  {/* Mobile-optimized heading with better line height and letter spacing */}
                  <div className="mb-6">
                    <h1 className="text-[3.6rem] sm:text-[3.36rem] md:text-[3.6rem] lg:text-6xl font-extrabold text-primary mb-2 font-heading leading-[1.2] tracking-tight mt-[2.5vh] sm:mt-0">
                      अपनी छत को बनाएं कमाई का ज़रिया
                    </h1>
                    <p className="text-lg sm:text-lg md:text-xl text-light/90 mb-0 leading-[1.65] max-w-[95%]">
                      सोलर प्रोडक्ट्स से 90% तक बिजली बिल बचाएं और ग्रिड को
                      बिजली देकर पैसे कमाएँ
                    </p>
                  </div>

                  {/* Grouped content: feature cards, description, and CTA buttons */}
                  <div className="space-y-[calc(1.5rem+10px)] mt-[12%] sm:mt-[20%] md:mt-[10%]">
                    {/* Installation highlights - Enhanced for mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mobile-optimized feature cards with hover effects */}
                      <motion.div
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            imageRendering="optimizeQuality"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            viewBox="0 0 452 512.11"
                            className="h-6 w-6"
                            fill="white"
                          >
                            <path d="M336.47 255.21h64.36v-12.46c-3.68-13.63-9.54-22.87-17.13-28.49-7.59-5.61-17.43-8.01-28.98-7.93l-263.96.06c-6.5 0-11.76-5.27-11.76-11.76 0-6.5 5.26-11.76 11.76-11.76l263.65.03c16.59-.16 31.23 3.62 43.25 12.53 1.08.8 2.14 1.64 3.17 2.52v-7.07c0-10.98-4.53-21.02-11.82-28.31-7.23-7.29-17.25-11.8-28.29-11.8h-8.49l-1.09-.05-4.15 15.56h-28.52l16.92-63.47c-14.22-3.8-22.7-18.5-18.89-32.72l-94.11-25.21c-3.81 14.21-18.5 22.71-32.7 18.9l-27.63 102.5h-29.41L177.4 0l199.7 53.51-19.69 73.73h3.31c17.45 0 33.36 7.19 44.9 18.72 11.56 11.51 18.73 27.45 18.73 44.92v64.99c6.79 1.35 12.86 4.71 17.57 9.42 6.21 6.21 10.08 14.81 10.08 24.28v77.35c0 9.87-4.04 18.85-10.52 25.32-4.63 4.63-10.53 8.02-17.13 9.57v46.66c0 17.46-7.18 33.39-18.72 44.93l-.74.68c-11.5 11.13-27.11 18.03-44.17 18.03H63.63c-17.47 0-33.4-7.17-44.94-18.7C7.17 481.89 0 465.98 0 448.47V190.88c0-17.52 7.16-33.43 18.68-44.95 11.52-11.52 27.44-18.69 44.95-18.69h37.12l.16.01L130.46 17.5l28.19 7.55-38.73 141.23H90.4l4.18-15.51H63.63c-11.01 0-21.04 4.52-28.32 11.79-7.27 7.27-11.79 17.31-11.79 28.32v257.59c0 11.01 4.53 21.03 11.81 28.3 7.28 7.29 17.32 11.82 28.3 11.82h297.09c10.73 0 20.54-4.3 27.74-11.25l.54-.58c7.29-7.28 11.83-17.32 11.83-28.29v-45.71h-64.36c-19.88 0-37.96-8.14-51.02-21.2l-1.23-1.35c-12.36-13-19.98-30.52-19.98-49.68v-3.1c0-19.79 8.13-37.83 21.21-50.94l.13-.13c13.1-13.05 31.12-21.15 50.89-21.15zm-95.71-93.06c17.19 4.6 34.89-5.6 39.49-22.8 4.61-17.19-5.61-34.89-22.8-39.49-17.2-4.6-34.9 5.6-39.5 22.8-4.6 17.19 5.62 34.88 22.81 39.49zM362.3 309.07l.06.05c10.93 10.96 10.9 28.79-.02 39.74l-.05.06c-10.96 10.93-28.79 10.9-39.75-.02l-.05-.05c-10.93-10.96-10.9-28.79.02-39.75l.05-.05c10.96-10.93 28.79-10.91 39.74.02z" />
                          </svg>
                        </div>
                        <div className="text-base font-medium text-light/90">
                          15% तक सालाना रिटर्न्स
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                          <svg
                            version="1.1"
                            id="Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 122.88 121.86"
                            style={{}}
                            className="h-6 w-6"
                            fill="white"
                          >
                            <style>{`.st0{fill-rule:evenodd;clip-rule:evenodd;}`}</style>
                            <g>
                              <path
                                className="st0"
                                d="M61.44,0.01c3.27-0.14,5.85,1,8.45,2.65c3.3,2.09,7.02,6.23,11.61,8.85c6.45,3.69,18.41-1.4,24.53,7.7 c3.57,5.3,3.74,9.46,4,13.57c0.29,4.43,1.06,8.51,5.6,14.51c7.51,9.93,9.07,16.54,5.2,23.43c-2.64,4.7-8.19,7.31-9.48,10.28 c-2.73,6.33,0.29,11.1-3.45,18.48c-2.6,5.12-6.61,8.49-11.95,10.21c-4.5,1.45-9.03-0.65-12.63,0.87 c-6.34,2.66-11.01,8.85-16.06,10.42c-1.95,0.6-3.89,0.9-5.82,0.89c-1.94,0.01-3.88-0.28-5.82-0.89 c-5.04-1.57-9.72-7.75-16.06-10.42c-3.61-1.52-8.13,0.58-12.63-0.87c-5.34-1.72-9.35-5.09-11.95-10.21 C11.23,92.1,14.26,87.33,11.52,81c-1.29-2.97-6.84-5.58-9.48-10.28c-3.87-6.89-2.3-13.5,5.2-23.43c4.54-6,5.31-10.08,5.6-14.51 c0.27-4.11,0.43-8.27,4-13.57c6.12-9.1,18.08-4.01,24.53-7.7c4.59-2.62,8.3-6.76,11.61-8.85C55.59,1.01,58.17-0.13,61.44,0.01 L61.44,0.01z M50.83,53.9l7.86,7.48l13.53-13.75c1.34-1.36,2.18-2.45,3.83-0.75l5.36,5.49c1.76,1.74,1.67,2.76,0.01,4.38 L61.75,76.06c-3.5,3.43-2.89,3.64-6.44,0.12L41.81,62.75c-0.74-0.8-0.66-1.61,0.15-2.41l6.22-6.45 C49.11,52.91,49.86,52.97,50.83,53.9L50.83,53.9z M61.26,27.57c18.95,0,34.3,15.36,34.3,34.3c0,18.95-15.36,34.3-34.3,34.3 c-18.95,0-34.3-15.36-34.3-34.3C26.96,42.92,42.32,27.57,61.26,27.57L61.26,27.57z"
                              />
                            </g>
                          </svg>
                        </div>
                        <div className="text-base font-medium text-light/90">
                          {" "}
                          25+ साल की वारंटी
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                          <img src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons//emi.svg" alt="EMI Icon" className="h-6 w-6" style={{ filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <div className="text-base font-medium text-light/90">
                          {" "}
                          आसान मासिक EMI
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-dark-900/50 border border-white/5 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="text-base font-medium text-light/90">
                        ₹78,000 तक की सब्सिडी
                        </div>
                      </motion.div>
                    </div>

                    {/* Grouped: description + CTA buttons */}
                    <div className="space-y-4 mt-6 sm:mt-[calc(20%+10px)] md:mt-[calc(20%+10px)] lg:mt-[calc(25%+10px)] xl:mt-[calc(28%+10px)] max-w-[95%] mx-auto">

                      <div>
                        <Link
                          to="/products"
                          className="flex items-center justify-between w-full bg-primary hover:bg-primary-hover active:bg-primary-active py-4 px-6 rounded-lg transition-all duration-300"
                        >
                          <span className="text-dark font-medium text-lg">Explore Products</span>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          >
                            <Sun className="h-7 w-7 text-dark" />
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side - Dynamic Image Carousel */}
            <div className="hidden md:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative h-[512px] rounded-2xl overflow-hidden mt-12 md:mt-0 flex items-center"
              >
                {/* Container with glowing border */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-black/5"
                  style={{
                    boxShadow:
                      "0 0 40px 2px rgba(204, 255, 0, 0.1), inset 0 0 20px 0px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(45deg, rgba(204, 255, 0, 0.3) 0%, rgba(0, 225, 255, 0.15) 50%, rgba(204, 255, 0, 0.3) 100%)",
                        backgroundSize: "200% 200%",
                        animation: "gradientBorder 8s linear infinite",
                      }}
                    ></div>
                  </div>

                  {/* Inner shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/70 to-dark" />

                  {/* Dynamic image carousel */}
                  <div className="absolute inset-0 z-0">
                    <ImageCarousel />
                  </div>

                  {/* Overlay with grid texture */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Type 3 Benefits Section */}
      <section className="py-12 relative overflow-hidden">
        {/* Decorative background elements matching calculator card style */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark to-dark-900 opacity-95" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%), radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}
          />
          <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}></div>
        </div>
        
        {/* Subtle pulsing geometric elements */}
        {/* Removed decorative box element */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], boxShadow: ["0 0 15px 1px rgba(0, 225, 255, 0.08)", "0 0 25px 2px rgba(0, 225, 255, 0.12)", "0 0 15px 1px rgba(0, 225, 255, 0.08)"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-10 w-72 h-32 bg-cyan-400/10 border border-cyan-400/10 opacity-15 rounded-md -rotate-6"
        />
        
        {/* Additional subtle rectangle */}
        <motion.div
          animate={{ opacity: [0.08, 0.16, 0.08], boxShadow: ["0 0 15px 1px rgba(204, 255, 0, 0.05)", "0 0 20px 1px rgba(204, 255, 0, 0.1)", "0 0 15px 1px rgba(204, 255, 0, 0.05)"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute top-1/3 -right-20 w-80 h-20 bg-primary/10 border border-primary/10 opacity-10 rounded-md -rotate-12"
        />
        
        {/* Enhanced light beam effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-40 bg-primary/5 blur-3xl rounded-full transform -translate-y-1/2" />
        
        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-8"
          >
            <h2 className="text-[calc(1.2*1.1*1.25rem)] md:text-[calc(1.2*1.1*1.25rem)] lg:text-[calc(1.1*2.5rem)] font-bold text-light mb-1">टाइप 3 के साथ पाएं</h2>
          </motion.div>

          <div className="flex md:grid overflow-x-auto pb-4 md:overflow-visible md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 text-center" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {/* Hide scrollbar */}
            <style dangerouslySetInnerHTML={{ __html: `
              .flex::-webkit-scrollbar {
                display: none;
              }
            `}} />
            {/* 30+ years' experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/1.png"
                  alt="30+ years experience"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">३०+ वर्षों</p>
                <p className="m-0 -mt-1">का अनुभव</p>
              </div>
            </motion.div>

            {/* 25 years' warranty */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/2.png"
                  alt="25 years warranty"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">२५ वर्षों</p>
                <p className="m-0 -mt-1">की वारंटी</p>
              </div>
            </motion.div>

            {/* Trusted Quality */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/3.png"
                  alt="Trusted Quality"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">विश्वसनीय</p>
                <p className="m-0 -mt-1">गुणवत्ता</p>
              </div>
            </motion.div>

            {/* Exclusive sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/4.png"
                  alt="215+ districts service"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">सरल</p>
                <p className="m-0 -mt-1">वित्त विकल्प</p>
              </div>
            </motion.div>

            {/* Lifetime service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/5.png"
                  alt="Lifetime service"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">जीवन भर</p>
                <p className="m-0 -mt-1">सेवा</p>
              </div>
            </motion.div>

            {/* Easy financing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/6.png"
                  alt="Easy financing"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">आसान</p>
                <p className="m-0 -mt-1">वित्तपोषण</p>
              </div>
            </motion.div>

            {/* All-weather proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.7 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/7.png"
                  alt="All-weather proof"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">सभी</p>
                <p className="m-0 -mt-1">मौसम प्रूफ</p>
              </div>
            </motion.div>

            {/* Insurance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[100px] flex flex-col items-center justify-between h-full py-6 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 md:w-auto md:p-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center mb-2">
                <img
                  src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/icons/2ndfold/8.png"
                  alt="Insurance"
                  className="w-20 h-20 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain"
                />
              </div>
              <div className="text-light/80 text-sm md:text-sm text-center w-full">
                <p className="font-medium text-primary text-lg md:text-lg m-0">बीमा</p>
                <p className="m-0 -mt-1">कवर</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section className="py-16 md:py-24 relative overflow-hidden" id="how-it-works">
        {/* Solid black background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%), radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}
          />
          <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}></div>
          <div
            className="absolute left-0 top-1/4 w-40 h-80 rounded-full bg-primary/5 filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDuration: "15s" }}
          />
          <div
            className="absolute right-0 bottom-1/4 w-60 h-60 rounded-full bg-primary/10 filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDuration: "20s", animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-[calc(1.2*1.1*1.25rem)] md:text-[calc(1.2*1.1*1.25rem)] lg:text-[calc(1.1*2.5rem)] font-bold text-light mb-2">
              यह कैसे <span className="text-primary">काम करता है</span>
            </h2>
            <p className="text-lg text-light/70 max-w-xl mx-auto">
              सोलर अपनाने के 3 आसान चरण
            </p>
          </motion.div>

          {/* Steps Container - Horizontal Cards */}
          <div className="flex flex-col gap-8 mb-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group shadow-lg"
            >
              {/* Enhanced background effects matching calculator section */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background:
                      "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-full h-full"
                  style={{
                    background:
                      "radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-full h-full opacity-5"
                  style={{
                    background: 'url("/images/solar-pattern.svg") repeat',
                  }}
                />
                <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}></div>
              </div>
              
              <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md relative z-10 flex flex-col group-hover:shadow-xl overflow-hidden">
                {/* Two-part card with slanted divider */}
                <div className="flex relative z-10 w-full h-full">
                  {/* Left side for image with slanted edge */}
                  <div className="relative w-2/5 min-h-[140px] overflow-hidden">
                    {/* Placeholder image */}
                    <img 
                      src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/howitworks/1.png" 
                      alt="Free site visit" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent mix-blend-overlay"></div>
                    

                    
                    {/* Slanted divider */}
                    <div 
                      className="absolute top-0 right-0 h-full w-16 bg-dark-900/80 backdrop-blur-sm z-10"
                      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                    ></div>
                    <div 
                      className="absolute top-0 right-0 h-full w-[calc(100%+30px)] z-10"
                      style={{ clipPath: 'polygon(100% 0, 30px 0, 100% 100%)', background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1), transparent 70%)' }}
                    ></div>
                  </div>
                  
                  {/* Right side for text content */}
                  <div className="flex-1 p-4 md:p-5 flex flex-col items-start justify-center text-left">
                    <div className="flex flex-col gap-4 mb-3">
                      <div className="flex-shrink-0">
                        <div className="bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 inline-flex items-center justify-center border border-primary/30">
                          <span className="text-primary text-xs font-semibold">Step One</span>
                        </div>
                      </div>
                      <div className="space-y-[2px]">
                        <h3 className="text-3xl font-bold text-light group-hover:text-primary transition-colors duration-300">मुफ्त विजिट बुक करें</h3>
                        <p className="text-light/70 text-sm">हम आपके घर आते हैं। बिना किसी शुल्क के। आपकी छत का निरीक्षण करके सही सोलर सिस्टम का सुझाव देते हैं।</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mt-3">
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">Free Consultation</span>
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">At Home Visit</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group shadow-lg"
            >
              {/* Enhanced background effects matching calculator section */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background:
                      "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-full h-full"
                  style={{
                    background:
                      "radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-full h-full opacity-5"
                  style={{
                    background: 'url("/images/solar-pattern.svg") repeat',
                  }}
                />
                <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}></div>
              </div>
              
              <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md relative z-10 flex flex-col group-hover:shadow-xl overflow-hidden">
                {/* Two-part card with slanted divider */}
                <div className="flex relative z-10 w-full h-full">
                  {/* Left side for image with slanted edge */}
                  <div className="relative w-2/5 min-h-[140px] overflow-hidden">
                    {/* Placeholder image */}
                    <img 
                      src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/howitworks/2.png" 
                      alt="Choose the right system" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent mix-blend-overlay"></div>
                    

                    
                    {/* Slanted divider */}
                    <div 
                      className="absolute top-0 right-0 h-full w-16 bg-dark-900/80 backdrop-blur-sm z-10"
                      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                    ></div>
                    <div 
                      className="absolute top-0 right-0 h-full w-[calc(100%+30px)] z-10"
                      style={{ clipPath: 'polygon(100% 0, 30px 0, 100% 100%)', background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1), transparent 70%)' }}
                    ></div>
                  </div>
                  
                  {/* Right side for text content */}
                  <div className="flex-1 p-4 md:p-5 flex flex-col items-start justify-center text-left">
                    <div className="flex flex-col gap-4 mb-3">
                      <div className="flex-shrink-0">
                        <div className="bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 inline-flex items-center justify-center border border-primary/30">
                          <span className="text-primary text-xs font-semibold">Step Two</span>
                        </div>
                      </div>
                      <div className="space-y-[2px]">
                        <h3 className="text-3xl font-bold text-light group-hover:text-primary transition-colors duration-300">सही सिस्टम चुनें</h3>
                        <p className="text-light/70 text-sm">हम आपकी छत के आकार, आपकी बिजली की जरूरतों और बजट के हिसाब से सही सोलर सिस्टम का सुझाव देते हैं।</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mt-3">
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">Custom Solutions</span>
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">Budget Friendly</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group shadow-lg"
            >
              {/* Enhanced background effects matching calculator section */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background:
                      "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-full h-full"
                  style={{
                    background:
                      "radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 w-full h-full opacity-5"
                  style={{
                    background: 'url("/images/solar-pattern.svg") repeat',
                  }}
                />
                <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}></div>
              </div>
              
              <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md relative z-10 flex flex-col group-hover:shadow-xl overflow-hidden">
                {/* Two-part card with slanted divider */}
                <div className="flex relative z-10 w-full h-full">
                  {/* Left side for image with slanted edge */}
                  <div className="relative w-2/5 min-h-[140px] overflow-hidden">
                    {/* Placeholder image */}
                    <img 
                      src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/images/howitworks/3.png" 
                      alt="Installation and maintenance" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent mix-blend-overlay"></div>
                    

                    
                    {/* Slanted divider */}
                    <div 
                      className="absolute top-0 right-0 h-full w-16 bg-dark-900/80 backdrop-blur-sm z-10"
                      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                    ></div>
                    <div 
                      className="absolute top-0 right-0 h-full w-[calc(100%+30px)] z-10"
                      style={{ clipPath: 'polygon(100% 0, 30px 0, 100% 100%)', background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1), transparent 70%)' }}
                    ></div>
                  </div>
                  
                  {/* Right side for text content */}
                  <div className="flex-1 p-4 md:p-5 flex flex-col items-start justify-center text-left">
                    <div className="flex flex-col gap-4 mb-3">
                      <div className="flex-shrink-0">
                        <div className="bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 inline-flex items-center justify-center border border-primary/30">
                          <span className="text-primary text-xs font-semibold">Step Three</span>
                        </div>
                      </div>
                      <div className="space-y-[2px]">
                        <h3 className="text-3xl font-bold text-light group-hover:text-primary transition-colors duration-300">इंस्टॉलेशन और देखभाल</h3>
                        <p className="text-light/70 text-sm">प्रोफेशनल इंस्टॉलेशन और आजीवन देखभाल। हमारी कुशल टीम आपके सोलर सिस्टम को स्थापित करती है और उसकी निरंतर देखभाल सुनिश्चित करती है।</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mt-3">
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">Expert Installation</span>
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">Lifetime Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-8 mb-6"
          >
            <p className="text-xl text-light mb-6">अभी मुफ्त साइट विजिट बुक करें</p>
            <button
              className="flex items-center justify-between w-full sm:w-3/4 md:w-1/2 mx-auto bg-primary hover:bg-primary-hover active:bg-primary-active py-4 px-6 rounded-lg transition-all duration-300"
              onClick={() => setIsSiteVisitModalOpen(true)}
            >
              <span className="text-dark font-medium text-lg" style={{ textTransform: 'none', letterSpacing: '-0.02em' }}>Book Free Visit</span>
              <div>
                <Calendar className="h-7 w-7 text-dark" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Calculator Section */}
      <section className="py-16 md:py-20 relative -mt-8 sm:mt-0" id="calculator">
        {/* Decorative background elements - simplified */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dark to-dark-900 opacity-95" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%), radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}
          />
          <div className="absolute inset-0 z-0 opacity-5" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)", backgroundSize: "30px 30px"}}></div>
          {/* Reduced number of decorative elements */}
          <div
            className="absolute right-0 bottom-1/4 w-60 h-60 rounded-full bg-primary/10 filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDuration: "20s", animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-6 max-w-3xl mx-auto"
          >
            <h2 className="text-[calc(1.1*1.25rem)] md:text-[calc(1.1*1.25rem)] lg:text-[calc(1.1*2rem)] font-bold text-light mb-2">
              Calculate Your Solar <span className="text-primary">Savings</span>
            </h2>
            <p className="text-base text-light/70 max-w-2xl mx-auto">
              See how much you can save with rooftop solar energy for your home or business.
            </p>
          </motion.div>

          {/* Enhanced Calculator Content */}
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0"
            >
              {/* Left side: Inputs - Compact styling */}
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[210px] flex flex-col backdrop-blur-lg bg-white/5"
              >
                {/* Simplified background effects */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      background: "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                    }}
                  />
                </div>

                <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-4 relative z-10 flex flex-col flex-1 group-hover:shadow-xl">
                  {/* More compact header */}
                  <div className="flex items-center mb-3">
                    <div className="text-primary flex justify-center items-center bg-white/5 p-2 rounded-lg mr-3">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-light">System Specifications</h3>
                    </div>
                    {/* kW value display removed */}
                  </div>

                  <div className="flex flex-col justify-between flex-1">
                    {/* Compact button grid */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {[1, 2, 5, 10, 20].map((size) => (
                        <button
                          key={size}
                          onClick={() => setRoofSize(size)}
                          className={`relative rounded-lg py-2 flex flex-col items-center justify-center transition-all duration-300 ${
                            roofSize === size
                              ? "bg-primary text-dark font-medium shadow-md"
                              : "bg-dark-800/50 text-light/70 hover:bg-dark-700/50 border border-white/5"
                          }`}
                        >
                          <span className="text-base font-medium">{size}</span>
                          <span className="text-xs">kW</span>
                        </button>
                      ))}
                    </div>

                    {/* Compact info box */}
                    <div className="transition-all duration-300 bg-white/5 border border-white/10 hover:border-primary/20 rounded-lg p-3 mt-auto">
                      <div className="flex items-center">
                        <div className="text-primary flex justify-center items-center bg-primary/10 p-2 rounded-lg mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-light/70">Average roof area needed:</div>
                          <motion.span
                            key={roiValues.area}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="font-bold text-primary text-base"
                          >
                            ~{roiValues.area} sq.ft
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right side: Results - Compact styling */}
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[210px] flex flex-col backdrop-blur-lg bg-white/5"
              >
                {/* Simplified background effects */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      background: "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                    }}
                  />
                </div>

                <div className="transition-all duration-300 border border-white/10 hover:border-primary/20 rounded-xl shadow-md p-4 relative z-10 flex flex-col flex-1 group-hover:shadow-xl">
                  {/* More compact header */}
                  <div className="flex items-center mb-3">
                    <div className="text-primary flex justify-center items-center bg-white/5 p-2 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        shapeRendering="geometricPrecision"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        viewBox="0 0 452 512.11"
                        className="h-5 w-5"
                        fill="white"
                      >
                        <path d="M336.47 255.21h64.36v-12.46c-3.68-13.63-9.54-22.87-17.13-28.49-7.59-5.61-17.43-8.01-28.98-7.93l-263.96.06c-6.5 0-11.76-5.27-11.76-11.76 0-6.5 5.26-11.76 11.76-11.76l263.65.03c16.59-.16 31.23 3.62 43.25 12.53 1.08.8 2.14 1.64 3.17 2.52v-7.07c0-10.98-4.53-21.02-11.82-28.31-7.23-7.29-17.25-11.8-28.29-11.8h-8.49l-1.09-.05-4.15 15.56h-28.52l16.92-63.47c-14.22-3.8-22.7-18.5-18.89-32.72l-94.11-25.21c-3.81 14.21-18.5 22.71-32.7 18.9l-27.63 102.5h-29.41L177.4 0l199.7 53.51-19.69 73.73h3.31c17.45 0 33.36 7.19 44.9 18.72 11.56 11.51 18.73 27.45 18.73 44.92v64.99c6.79 1.35 12.86 4.71 17.57 9.42 6.21 6.21 10.08 14.81 10.08 24.28v77.35c0 9.87-4.04 18.85-10.52 25.32-4.63 4.63-10.53 8.02-17.13 9.57v46.66c0 17.46-7.18 33.39-18.72 44.93l-.74.68c-11.5 11.13-27.11 18.03-44.17 18.03H63.63c-17.47 0-33.4-7.17-44.94-18.7C7.17 481.89 0 465.98 0 448.47V190.88c0-17.52 7.16-33.43 18.68-44.95 11.52-11.52 27.44-18.69 44.95-18.69h37.12l.16.01L130.46 17.5l28.19 7.55-38.73 141.23H90.4l4.18-15.51H63.63c-11.01 0-21.04 4.52-28.32 11.79-7.27 7.27-11.79 17.31-11.79 28.32v257.59c0 11.01 4.53 21.03 11.81 28.3 7.28 7.29 17.32 11.82 28.3 11.82h297.09c10.73 0 20.54-4.3 27.74-11.25l.54-.58c7.29-7.28 11.83-17.32 11.83-28.29v-45.71h-64.36c-19.88 0-37.96-8.14-51.02-21.2l-1.23-1.35c-12.36-13-19.98-30.52-19.98-49.68v-3.1c0-19.79 8.13-37.83 21.21-50.94l.13-.13c13.1-13.05 31.12-21.15 50.89-21.15zm-95.71-93.06c17.19 4.6 34.89-5.6 39.49-22.8 4.61-17.19-5.61-34.89-22.8-39.49-17.2-4.6-34.9 5.6-39.5 22.8-4.6 17.19 5.62 34.88 22.81 39.49zM362.3 309.07l.06.05c10.93 10.96 10.9 28.79-.02 39.74l-.05.06c-10.96 10.93-28.79 10.9-39.75-.02l-.05-.05c-10.93-10.96-10.9-28.79.02-39.75l.05-.05c10.96-10.93 28.79-10.91 39.74.02z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-light">Financial Benefits</h3>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between flex-1">
                    {/* Main savings display */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-light/60">Monthly Savings</span>
                        <motion.span
                          key={roiValues.monthly}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-2xl font-bold text-primary"
                        >
                          ₹{roiValues.monthly.toLocaleString()}
                        </motion.span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-light/60">Yearly Savings</span>
                        <motion.span
                          key={roiValues.yearly}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-xl font-bold text-primary"
                        >
                          ₹{roiValues.yearly.toLocaleString()}
                        </motion.span>
                      </div>
                    </div>
                    
                    {/* Secondary stats in compact row */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                        <div className="text-xs text-light/60">Monthly Generation</div>
                        <motion.div
                          key={roiValues.monthlyWattage}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-base font-bold text-primary"
                        >
                          {roiValues.monthlyWattage} kWh
                        </motion.div>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                        <div className="text-xs text-light/60">Payback Period</div>
                        <motion.div
                          key={roiValues.payback}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="text-base font-bold text-primary"
                        >
                          {roiValues.payback} years
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Product Recommendation Card - Standardized design */}
              <div className="col-span-1 lg:col-span-2 mt-6 -mt-[40%] pt-[40%]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group"
                >
                  {/* Background effects matching home section style */}
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        background:
                          "radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-full h-full"
                      style={{
                        background:
                          "radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 45%)",
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-full h-full opacity-5"
                      style={{
                        background: 'url("/images/solar-pattern.svg") repeat',
                      }}
                    />
                  </div>

                  <div className="transition-all duration-300 border border-white/5 bg-dark-900 hover:border-primary/20 rounded-3xl shadow-lg p-4 relative z-10 overflow-hidden">
                    {/* Perfect Match Badge */}
                    <div className="absolute top-3 right-3 bg-primary text-dark font-bold px-4 py-1.5 rounded-full text-sm shadow-lg z-10 flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="mr-1.5"
                      >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                      </motion.div>
                      Perfect Match
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Product Image with standardized styling */}
                      <div className="w-full h-[280px] relative">
                        <div
                          className="transition-all duration-300 bg-black/30 border border-white/10 rounded-2xl overflow-hidden"
                          style={{ height: '100%' }}
                        >
                          {recommendedProduct ? (
                            <img
                              src={recommendedProduct.image_url}
                              alt={recommendedProduct.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src = "/images/solar-default.jpg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-dark-800">
                              <Zap className="h-16 w-16 text-primary/50 animate-pulse" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent" />
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center">
                            <span className="bg-dark-900/80 px-4 py-1.5 rounded-lg border border-white/10 font-mono text-lg">
                              <motion.span
                                key={
                                  recommendedProduct?.capacity_kw || roofSize
                                }
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-primary font-bold"
                              >
                                {recommendedProduct?.capacity_kw || roofSize}kW
                              </motion.span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Product Details with standardized layout */}
                      <div className="flex flex-col gap-4">
                        {recommendedProduct ? (
                          <>
                            {/* Price */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/60 border border-white/5">
                              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                                <Wallet className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="text-light/60 text-sm">Price</div>
                                <div className="text-2xl font-bold text-light">₹{recommendedProduct.price.toLocaleString()}</div>
                              </div>
                            </div>
                            
                            {/* Warranty */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/60 border border-white/5">
                              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                                <Shield className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="text-light/60 text-sm">Warranty</div>
                                <div className="text-2xl font-bold text-light">{recommendedProduct.warranty_years} Years</div>
                              </div>
                            </div>
                            
                            {/* Installation */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/60 border border-white/5">
                              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                                <Clock className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="text-light/60 text-sm">Installation</div>
                                <div className="text-2xl font-bold text-light">{recommendedProduct.installation_days} Days</div>
                              </div>
                            </div>
                            
                            {/* View Details Button */}
                            <Link to={`/product/${recommendedProduct.id}`} className="mt-2">
                              <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover transition-colors duration-300 text-dark font-bold rounded-xl px-6 py-4 text-lg">
                                View Details
                                <ArrowRight className="w-5 h-5" />
                              </button>
                            </Link>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10">
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Zap className="h-16 w-16 text-primary/70 mb-4" />
                            </motion.div>
                            <p className="text-light/60 text-center text-lg">
                              Loading product recommendations...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Suggested Products section */}
      <section className="py-12 md:py-16 relative overflow-hidden" id="suggested-products">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-800 opacity-50" />
        <div className="absolute inset-0 z-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)",
          backgroundSize: "30px 30px"
        }} />
            
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Section header with title and category filters */}
          <div className="text-center md:text-left mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-light">
                Suggested <span className="bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">Products</span>
              </h2>
              <p className="text-light/60 mt-2">Tailored solutions for your solar energy needs</p>
            </motion.div>
          </div>
          
          {/* Product cards - horizontal scroll on mobile, grid on desktop */}
          <div className="flex overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 hide-scrollbar">
            {products.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] sm:w-auto"
              >
                <Link 
                  to={`/products/${product.id}`} 
                  className="group h-full flex flex-col bg-dark-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Product Image - full width with improved styling */}
                  <div className="relative h-[140px] sm:h-[160px] overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name || 'Solar product'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = "/images/solar-default.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-dark-800/80">
                        <Sun className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/70"></div>
                    {product.capacity_kw !== undefined && (
                      <div className="absolute top-3 right-3 bg-primary text-dark px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {product.capacity_kw} kW
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info - Enhanced version */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Product Name with fallback */}
                    <h3 className="text-lg font-bold mb-1.5 text-light group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {product.name || 'Solar Product'}
                    </h3>
                    
                    {/* Short Description with fallback */}
                    <p className="text-sm text-light/60 mb-4 line-clamp-2">
                      {product.description || `High-efficiency ${product.category || 'solar'} solution for your energy needs`}
                    </p>
                    
                    {/* Key specs - enhanced version */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                          <Sun size={14} className="text-primary" />
                        </div>
                        <div className="flex flex-1 justify-between">
                          <span className="text-xs text-light/70">Annual Energy</span>
                          <span className="text-xs font-semibold text-light">{product.capacity_kw ? `${product.capacity_kw * 1400} kWh` : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                          <Wallet size={14} className="text-primary" />
                        </div>
                        <div className="flex flex-1 justify-between">
                          <span className="text-xs text-light/70">Annual Savings</span>
                          <span className="text-xs font-semibold text-light">{product.monthly_savings ? `₹${(product.monthly_savings * 12).toLocaleString()}` : 'Contact us'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Price and CTA */}
                    <div className="mt-auto pt-3 border-t border-white/10">
                      {/* Price Section */}
                      <div className="flex items-end gap-2 mb-3">
                        {product.subsidy_amount ? (
                          <div className="flex flex-col">
                            <span className="text-xs line-through text-light/40">₹{product.price.toLocaleString()}</span>
                            <span className="text-xl font-bold text-primary">
                              ₹{(product.price - product.subsidy_amount).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            ₹{product.price ? product.price.toLocaleString() : 'Call for price'}
                          </span>
                        )}
                        
                        {product.subsidy_amount && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded font-medium">
                            Save ₹{product.subsidy_amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Enhanced CTA Button */}
                      <button className="w-full py-2.5 px-4 bg-primary text-dark font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors duration-300 group-hover:shadow-md group-hover:shadow-primary/10">
                        View Details
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                        >
                          <ArrowRight size={16} />
                        </motion.div>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* View all products link */}
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              to="/products"
              variant="ghost"
              size="md"
              radius="lg"
              className="border border-white/10 hover:border-primary/20 text-light hover:text-primary hover:bg-primary/5"
            >
              <span className="relative z-10 flex items-center justify-center">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </span>
            </Button>
          </div>
          
          {/* CSS for hiding scrollbar is in global styles */}
        </div>
      </section>
      
      {/* Enhanced Call-to-Action Section */}
      <section className="py-8 sm:py-10 bg-black relative overflow-hidden">
        {/* Minimal decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/10 blur-2xl"
          />
          <motion.div
            animate={{
              opacity: [0.05, 0.15, 0.05],
              width: ["40%", "50%", "40%"],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
          {/* Mobile-optimized layout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Title and description - centered on mobile, left-aligned on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 space-y-4 text-center md:text-left"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-light leading-tight">
                Ready to
                <span className="relative mx-2">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text no-underline">
                    Go Solar
                  </span>
                </span>
                ?
              </h2>

              <p className="text-base text-light/80 max-w-md mx-auto md:mx-0">
                Schedule a free consultation with our solar experts and get a
                customized quote for your home.
              </p>
              
              {/* CTA buttons - centered and full width on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto sm:justify-start">
                <Button
                  to="/products"
                  variant="primary"
                  size="md"
                  radius="lg"
                  className="shadow-md w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                </Button>

                <Button
                  onClick={() => setIsSiteVisitModalOpen(true)}
                  variant="ghost"
                  size="md"
                  radius="lg"
                  className="border border-white/10 hover:border-primary/20 text-primary hover:bg-primary/10 active:bg-primary/15 shadow-md w-full sm:w-auto"
                  aria-haspopup="dialog"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Book Consultation
                  </span>
                </Button>
              </div>
            </motion.div>

            {/* Trust indicators - vertical grid on mobile, horizontal row on desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 grid grid-cols-3 sm:flex sm:flex-row md:justify-end gap-2 sm:gap-3 mt-6 md:mt-0"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-3 sm:px-3 sm:py-2 transition-transform duration-200 hover:-translate-y-1">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-light text-xs sm:text-sm text-center sm:text-left whitespace-nowrap">5-Year Warranty</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-3 sm:px-3 sm:py-2 transition-transform duration-200 hover:-translate-y-1">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-light text-xs sm:text-sm text-center sm:text-left whitespace-nowrap">1000+ Customers</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-3 sm:px-3 sm:py-2 transition-transform duration-200 hover:-translate-y-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-light text-xs sm:text-sm text-center sm:text-left whitespace-nowrap">Premium Quality</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Site Visit Form Modal */}
      <SiteVisitForm
        isOpen={isSiteVisitModalOpen}
        onClose={() => setIsSiteVisitModalOpen(false)}
        productSku={recommendedProduct?.sku || ""}
        productName={recommendedProduct?.name || "Solar Consultation"}
        productPower={recommendedProduct?.capacity_kw || roofSize}
      />

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/917995657936"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-full font-medium text-sm shadow-xl border border-[#25D366]/40 hover:border-[#25D366] text-white bg-[#25D366] hover:bg-[#25D366]/90 active:bg-[#25D366]/80 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-105 disabled:pointer-events-none disabled:opacity-50 animate-pulse"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="24"
            height="24"
            viewBox="0 0 50 50"
            className="h-5 w-5"
          >
            <path
              fill="white"
              d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"
            ></path>
          </svg>
          <span>Chat with us</span>
        </a>
      </div>
    </div>
  );
}

export default Home;
