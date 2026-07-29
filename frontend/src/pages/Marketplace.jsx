import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { StarIcon } from "../components/Icons";

const LISTINGS = [
  // ---------------------------------------------------------
  // 1. FRESH PRODUCE (Priced per Kg / Dozen / Unit)
  // ---------------------------------------------------------
  // Fresh Vegetables
  { id: 1, title: "Fresh Tomato (गोलभेंडा)", unitPrice: 60, unit: "kg", seller: "Kavre Organic Farm", category: "produce", rating: 4.8, reviews: 52, stock: "In Stock", isFeatured: true, minQty: 0.5, step: 0.5 },
  { id: 2, title: "Local Red Potato (आलु)", unitPrice: 44, unit: "kg", seller: "Palung Vegetable Zone", category: "produce", rating: 4.7, reviews: 65, stock: "In Stock", minQty: 1, step: 1 },
  { id: 3, title: "Local Red Onion (प्याज)", unitPrice: 65, unit: "kg", seller: "Rautahat Agro Farm", category: "produce", rating: 4.5, reviews: 48, stock: "In Stock", minQty: 1, step: 1 },
  { id: 4, title: "Organic Green Cabbage (बन्दा)", unitPrice: 40, unit: "kg", seller: "Dhading Fresh Produce", category: "produce", rating: 4.4, reviews: 22, stock: "In Stock", minQty: 1, step: 1 },
  { id: 5, title: "Fresh Cauliflower (काउली)", unitPrice: 45, unit: "kg", seller: "Dhading Fresh Produce", category: "produce", rating: 4.6, reviews: 31, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 6, title: "Fresh Broccoli (ब्रोकाउली)", unitPrice: 90, unit: "kg", seller: "Kavre Organic Farm", category: "produce", rating: 4.7, reviews: 24, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 7, title: "Fresh Spinach / Palungo (पालुङ्गो)", unitPrice: 80, unit: "kg", seller: "Bhaktapur Greens", category: "produce", rating: 4.5, reviews: 19, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 8, title: "Mustard Greens (रायो साग)", unitPrice: 50, unit: "kg", seller: "Bhaktapur Greens", category: "produce", rating: 4.6, reviews: 27, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 9, title: "Fresh Coriander (धनियाँ)", unitPrice: 120, unit: "kg", seller: "Bhaktapur Greens", category: "produce", rating: 4.8, reviews: 14, stock: "In Stock", minQty: 0.25, step: 0.25 },
  { id: 10, title: "Fresh Cucumber / Kankro (काँक्रो)", unitPrice: 50, unit: "kg", seller: "Bhaktapur Greens", category: "produce", rating: 4.3, reviews: 14, stock: "In Stock", minQty: 1, step: 1 },
  { id: 11, title: "Fresh Bitter Gourd / Tite Karela (तिते करेला)", unitPrice: 70, unit: "kg", seller: "Terai Veg Exporters", category: "produce", rating: 4.3, reviews: 15, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 12, title: "Fresh Bottle Gourd (लौका)", unitPrice: 45, unit: "kg", seller: "Chitwan Veg Hub", category: "produce", rating: 4.4, reviews: 18, stock: "In Stock", minQty: 1, step: 1 },
  { id: 13, title: "Organic Pumpkin (फर्सी)", unitPrice: 35, unit: "kg", seller: "Palung Vegetable Zone", category: "produce", rating: 4.5, reviews: 21, stock: "In Stock", minQty: 1, step: 1 },
  { id: 14, title: "Fresh Brinjal / Eggplant (भण्टा)", unitPrice: 50, unit: "kg", seller: "Terai Veg Exporters", category: "produce", rating: 4.2, reviews: 13, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 15, title: "Fresh Okra / Lady Finger (भिण्डी)", unitPrice: 75, unit: "kg", seller: "Chitwan Veg Hub", category: "produce", rating: 4.4, reviews: 20, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 16, title: "Fresh Green Chilies (हरियो खुर्सानी)", unitPrice: 90, unit: "kg", seller: "Chitwan Veg Hub", category: "produce", rating: 4.4, reviews: 21, stock: "In Stock", minQty: 0.25, step: 0.25 },
  { id: 17, title: "White Radish (मूला)", unitPrice: 35, unit: "kg", seller: "Dhading Fresh Produce", category: "produce", rating: 4.3, reviews: 16, stock: "In Stock", minQty: 1, step: 1 },
  { id: 18, title: "Fresh Carrot (गाजर)", unitPrice: 80, unit: "kg", seller: "Palung Vegetable Zone", category: "produce", rating: 4.6, reviews: 30, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 19, title: "Fresh Garlic / Lasun (लसुन)", unitPrice: 320, unit: "kg", seller: "Kavre Organic Farm", category: "produce", rating: 4.7, reviews: 40, stock: "In Stock", minQty: 0.25, step: 0.25 },
  { id: 20, title: "Organic Ginger / Aduwa (अदुवा)", unitPrice: 140, unit: "kg", seller: "Surkhet Organic Farmers", category: "produce", rating: 4.6, reviews: 33, stock: "In Stock", minQty: 0.25, step: 0.25 },

  // Fresh Fruits
  { id: 21, title: "Organic Cavendish Bananas (केरा)", unitPrice: 120, unit: "dozen", seller: "Chitwan Fruit Farm", category: "produce", rating: 4.7, reviews: 28, stock: "In Stock", minQty: 1, step: 1 },
  { id: 22, title: "Mustang Apples (स्याउ)", unitPrice: 300, unit: "kg", seller: "Mustang Orchard Ltd.", category: "produce", rating: 4.9, reviews: 94, stock: "Limited", isFeatured: true, minQty: 1, step: 1 },
  { id: 23, title: "Suntala / Orange (सुन्तला)", unitPrice: 150, unit: "kg", seller: "Syangja Citrus Producers", category: "produce", rating: 4.8, reviews: 42, stock: "Limited", minQty: 1, step: 1 },
  { id: 24, title: "Fresh Lemon (कागती)", unitPrice: 180, unit: "kg", seller: "Terai Fruit Nursery", category: "produce", rating: 4.5, reviews: 17, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 25, title: "Fresh Mango (आँप)", unitPrice: 130, unit: "kg", seller: "Saptari Fruit Producers", category: "produce", rating: 4.9, reviews: 88, stock: "Limited", isFeatured: true, minQty: 1, step: 1 },
  { id: 26, title: "Fresh Papaya (मेवा)", unitPrice: 80, unit: "kg", seller: "Chitwan Fruit Farm", category: "produce", rating: 4.6, reviews: 25, stock: "In Stock", minQty: 1, step: 1 },
  { id: 27, title: "Fresh Guava (अम्बा)", unitPrice: 90, unit: "kg", seller: "Nawalparasi Fruit Zone", category: "produce", rating: 4.4, reviews: 19, stock: "In Stock", minQty: 1, step: 1 },
  { id: 28, title: "Pomegranate (अनार)", unitPrice: 350, unit: "kg", seller: "Himalayan Fruit Hub", category: "produce", rating: 4.8, reviews: 36, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 29, title: "Fresh Watermelon (तरबुजा)", unitPrice: 40, unit: "kg", seller: "Nawalparasi Fruit Zone", category: "produce", rating: 4.4, reviews: 19, stock: "In Stock", minQty: 2, step: 1 },
  { id: 30, title: "Pineapple (भुइँकटहर)", unitPrice: 120, unit: "pc", seller: "Eastern Agro Farm", category: "produce", rating: 4.7, reviews: 22, stock: "In Stock", minQty: 1, step: 1 },
  { id: 31, title: "Fresh Litchi (लिची)", unitPrice: 220, unit: "kg", seller: "Chitwan Fruit Farm", category: "produce", rating: 4.8, reviews: 41, stock: "Limited", minQty: 1, step: 1 },
  { id: 32, title: "Fresh Grapes (अंगुर)", unitPrice: 280, unit: "kg", seller: "Himalayan Fruit Hub", category: "produce", rating: 4.6, reviews: 29, stock: "In Stock", minQty: 0.5, step: 0.5 },
  { id: 33, title: "Local Pear (नास्पाती)", unitPrice: 110, unit: "kg", seller: "Palung Fruit Producers", category: "produce", rating: 4.5, reviews: 18, stock: "In Stock", minQty: 1, step: 1 },
  { id: 34, title: "Fresh Peach (आरु)", unitPrice: 160, unit: "kg", seller: "Kathmandu Valley Orchards", category: "produce", rating: 4.3, reviews: 15, stock: "Limited", minQty: 0.5, step: 0.5 },
  { id: 35, title: "Plum / Ainseloo (ऐंसेलु/प्लम)", unitPrice: 140, unit: "kg", seller: "Kathmandu Valley Orchards", category: "produce", rating: 4.4, reviews: 12, stock: "In Stock", minQty: 0.5, step: 0.5 },

  // ---------------------------------------------------------
  // 2. SEEDS & NURSERY
  // ---------------------------------------------------------
  // Vegetable Seeds
  { id: 36, title: "Tomato Seeds", unitPrice: 12, unit: "gram", seller: "Himalayan Seed House", category: "seeds", rating: 4.7, reviews: 33, stock: "In Stock", minQty: 5, step: 5 },
  { id: 37, title: "Cucumber Seeds - Hybrid", unitPrice: 3.5, unit: "gram", seller: "Himalayan Seed House", category: "seeds", rating: 4.4, reviews: 18, stock: "In Stock", minQty: 10, step: 10 },
  { id: 38, title: "Onion Seeds", unitPrice: 8, unit: "gram", seller: "Agro Supply Co.", category: "seeds", rating: 4.5, reviews: 22, stock: "In Stock", minQty: 10, step: 5 },
  { id: 39, title: "Hybrid Cauliflower Seeds", unitPrice: 9, unit: "gram", seller: "Agro Supply Co.", category: "seeds", rating: 4.8, reviews: 27, stock: "In Stock", minQty: 10, step: 5 },
  { id: 40, title: "Cabbage Seeds", unitPrice: 7, unit: "gram", seller: "Agro Supply Co.", category: "seeds", rating: 4.3, reviews: 15, stock: "In Stock", minQty: 10, step: 5 },
  { id: 41, title: "Radish Seeds - Tokinashi", unitPrice: 1.12, unit: "gram", seller: "Himalayan Seed House", category: "seeds", rating: 4.3, reviews: 16, stock: "In Stock", minQty: 50, step: 10 },
  { id: 42, title: "Carrot Seeds", unitPrice: 4, unit: "gram", seller: "Nepal Seed Company", category: "seeds", rating: 4.5, reviews: 19, stock: "In Stock", minQty: 20, step: 10 },
  { id: 43, title: "Spinach Seeds", unitPrice: 2, unit: "gram", seller: "Nepal Seed Company", category: "seeds", rating: 4.6, reviews: 24, stock: "In Stock", minQty: 50, step: 25 },
  { id: 44, title: "Okra Seeds", unitPrice: 3, unit: "gram", seller: "Agro Supply Co.", category: "seeds", rating: 4.4, reviews: 17, stock: "In Stock", minQty: 20, step: 10 },
  { id: 45, title: "Bitter Gourd Seeds", unitPrice: 6, unit: "gram", seller: "Himalayan Seed House", category: "seeds", rating: 4.5, reviews: 21, stock: "In Stock", minQty: 10, step: 5 },
  { id: 46, title: "Bottle Gourd Seeds", unitPrice: 5, unit: "gram", seller: "Himalayan Seed House", category: "seeds", rating: 4.3, reviews: 13, stock: "In Stock", minQty: 10, step: 5 },
  { id: 47, title: "Pumpkin Seeds", unitPrice: 4, unit: "gram", seller: "Agro Supply Co.", category: "seeds", rating: 4.4, reviews: 11, stock: "In Stock", minQty: 10, step: 5 },
  { id: 48, title: "Chili Seeds", unitPrice: 10, unit: "gram", seller: "Himalayan Seed House", category: "seeds", rating: 4.7, reviews: 31, stock: "In Stock", minQty: 5, step: 5 },
  { id: 49, title: "Coriander Seeds", unitPrice: 1.5, unit: "gram", seller: "Nepal Seed Company", category: "seeds", rating: 4.6, reviews: 20, stock: "In Stock", minQty: 50, step: 50 },
  { id: 50, title: "Bean Seeds", unitPrice: 120, unit: "kg", seller: "Nepal Seed Company", category: "seeds", rating: 4.5, reviews: 16, stock: "In Stock", minQty: 1, step: 1 },
  { id: 51, title: "Pea Seeds", unitPrice: 140, unit: "kg", seller: "Nepal Seed Company", category: "seeds", rating: 4.6, reviews: 28, stock: "In Stock", minQty: 1, step: 1 },

  // Field Crop Seeds
  { id: 52, title: "Paddy (Rice) Seeds - Mansuli", unitPrice: 110, unit: "kg", seller: "Nepal Seed Company", category: "seeds", rating: 4.7, reviews: 50, stock: "In Stock", minQty: 1, step: 1 },
  { id: 53, title: "Hybrid Maize (Corn) Seeds", unitPrice: 240, unit: "kg", seller: "Agro Supply Co.", category: "seeds", rating: 4.6, reviews: 38, stock: "In Stock", minQty: 1, step: 1 },
  { id: 54, title: "High-Yield Wheat Seeds", unitPrice: 95, unit: "kg", seller: "Nepal Seed Company", category: "seeds", rating: 4.6, reviews: 32, stock: "In Stock", minQty: 1, step: 1 },
  { id: 55, title: "Finger Millet Seeds", unitPrice: 130, unit: "kg", seller: "Karnali Agri Cooperative", category: "seeds", rating: 4.8, reviews: 19, stock: "In Stock", minQty: 1, step: 1 },
  { id: 56, title: "Mustard Seeds", unitPrice: 160, unit: "kg", seller: "Nepal Seed Company", category: "seeds", rating: 4.5, reviews: 23, stock: "In Stock", minQty: 1, step: 1 },
  { id: 57, title: "Soybean Seeds", unitPrice: 180, unit: "kg", seller: "Agro Supply Co.", category: "seeds", rating: 4.4, reviews: 15, stock: "In Stock", minQty: 1, step: 1 },
  { id: 58, title: "Lentil Seeds", unitPrice: 170, unit: "kg", seller: "Nepal Seed Company", category: "seeds", rating: 4.6, reviews: 26, stock: "In Stock", minQty: 1, step: 1 },

  // ---------------------------------------------------------
  // 3. FERTILIZERS
  // ---------------------------------------------------------
  // Organic
  { id: 59, title: "Farmyard Manure (FYM)", unitPrice: 12, unit: "kg", seller: "Kavre Organic Farm", category: "fertilizer", rating: 4.5, reviews: 30, stock: "In Stock", minQty: 10, step: 5 },
  { id: 60, title: "Vermicompost", unitPrice: 26, unit: "kg", seller: "Bhaktapur Organics", category: "fertilizer", rating: 4.4, reviews: 51, stock: "In Stock", minQty: 5, step: 5 },
  { id: 61, title: "Organic Compost", unitPrice: 18, unit: "kg", seller: "Kavre Organic Farm", category: "fertilizer", rating: 4.8, reviews: 62, stock: "In Stock", minQty: 5, step: 5 },
  { id: 62, title: "Poultry Manure", unitPrice: 15, unit: "kg", seller: "Chitwan Poultry & Organics", category: "fertilizer", rating: 4.3, reviews: 18, stock: "In Stock", minQty: 10, step: 5 },
  { id: 63, title: "Bone Meal", unitPrice: 65, unit: "kg", seller: "Agro Bio Tech", category: "fertilizer", rating: 4.7, reviews: 25, stock: "In Stock", minQty: 1, step: 1 },

  // Chemical
  { id: 64, title: "Urea Fertilizer", unitPrice: 21, unit: "kg", seller: "National Salt & Chemical", category: "fertilizer", rating: 4.5, reviews: 112, stock: "In Stock", minQty: 5, step: 5 },
  { id: 65, title: "DAP Fertilizer", unitPrice: 44, unit: "kg", seller: "National Salt & Chemical", category: "fertilizer", rating: 4.7, reviews: 95, stock: "Limited", minQty: 5, step: 5 },
  { id: 66, title: "NPK 20:20:20 Soluble Fertilizer", unitPrice: 380, unit: "kg", seller: "Agro Bio Tech", category: "fertilizer", rating: 4.6, reviews: 40, stock: "In Stock", minQty: 1, step: 1 },

  // ---------------------------------------------------------
  // 4. FARM TOOLS & MACHINERY
  // ---------------------------------------------------------
  // Hand Tools
  { id: 67, title: "Agricultural Spade (कोदालो)", unitPrice: 650, unit: "unit", seller: "Thapa Farm Tools", category: "equipment", rating: 4.6, reviews: 34, stock: "In Stock", minQty: 1, step: 1 },
  { id: 68, title: "Heavy Duty Shovel", unitPrice: 850, unit: "unit", seller: "Thapa Farm Tools", category: "equipment", rating: 4.5, reviews: 22, stock: "In Stock", minQty: 1, step: 1 },
  { id: 69, title: "Harvesting Sickle (हँसिया)", unitPrice: 350, unit: "unit", seller: "Thapa Farm Tools", category: "equipment", rating: 4.8, reviews: 56, stock: "In Stock", minQty: 1, step: 1 },
  { id: 70, title: "Hand Trowel / Weeder", unitPrice: 250, unit: "unit", seller: "Thapa Farm Tools", category: "equipment", rating: 4.3, reviews: 19, stock: "In Stock", minQty: 1, step: 1 },
  { id: 71, title: "Garden Fork", unitPrice: 550, unit: "unit", seller: "Thapa Farm Tools", category: "equipment", rating: 4.4, reviews: 15, stock: "In Stock", minQty: 1, step: 1 },

  // Power Equipment
  { id: 72, title: "Power Tiller 12HP", unitPrice: 125000, unit: "unit", seller: "Nepal Machinery Hub", category: "equipment", rating: 4.9, reviews: 18, stock: "Limited", minQty: 1, step: 1 },
  { id: 73, title: "Mini Power Tiller 7HP", unitPrice: 48500, unit: "unit", seller: "Nepal Machinery Hub", category: "equipment", rating: 4.9, reviews: 43, stock: "Limited", isFeatured: true, minQty: 1, step: 1 },
  { id: 74, title: "Agricultural Tractor 45HP", unitPrice: 1450000, unit: "unit", seller: "Himalayan Machinery", category: "equipment", rating: 4.9, reviews: 12, stock: "In Stock", isFeatured: true, minQty: 1, step: 1 },
  { id: 75, title: "Brush Cutter / Weed Trimmer", unitPrice: 18500, unit: "unit", seller: "Himalayan Machinery", category: "equipment", rating: 4.7, reviews: 31, stock: "In Stock", minQty: 1, step: 1 },
  { id: 76, title: "Kirloskar Water Pump 2HP", unitPrice: 14200, unit: "unit", seller: "AgriTech Nepal", category: "equipment", rating: 4.8, reviews: 27, stock: "In Stock", minQty: 1, step: 1 },
  { id: 77, title: "Power Sprayer 4-Stroke", unitPrice: 16500, unit: "unit", seller: "Himalayan Machinery", category: "equipment", rating: 4.6, reviews: 20, stock: "In Stock", minQty: 1, step: 1 },
  { id: 78, title: "Knapsack Manual/Battery Sprayer", unitPrice: 4800, unit: "unit", seller: "Himalayan Machinery", category: "equipment", rating: 4.6, reviews: 14, stock: "In Stock", minQty: 1, step: 1 },
  { id: 79, title: "Manual Seed Drill", unitPrice: 8500, unit: "unit", seller: "AgriTech Nepal", category: "equipment", rating: 4.5, reviews: 11, stock: "In Stock", minQty: 1, step: 1 },

  // Irrigation & Accessories
  { id: 80, title: "Drip Irrigation Kit", unitPrice: 6200, unit: "set", seller: "AgriTech Nepal", category: "equipment", rating: 4.7, reviews: 29, stock: "Limited", isFeatured: true, minQty: 1, step: 1 },
  { id: 81, title: "Micro Sprinkler System", unitPrice: 4500, unit: "set", seller: "AgriTech Nepal", category: "equipment", rating: 4.6, reviews: 16, stock: "In Stock", minQty: 1, step: 1 },
  { id: 82, title: "Garden Hose Pipe 50m", unitPrice: 1800, unit: "unit", seller: "AgriTech Nepal", category: "equipment", rating: 4.4, reviews: 25, stock: "In Stock", minQty: 1, step: 1 },
  { id: 83, title: "Watering Can 10L", unitPrice: 450, unit: "unit", seller: "Thapa Farm Tools", category: "equipment", rating: 4.5, reviews: 38, stock: "In Stock", minQty: 1, step: 1 },
  { id: 84, title: "PVC Pipe 2 inch (per meter)", unitPrice: 120, unit: "meter", seller: "AgriTech Nepal", category: "equipment", rating: 4.3, reviews: 19, stock: "In Stock", minQty: 5, step: 1 },
  { id: 85, title: "Water Tank 1000L", unitPrice: 11500, unit: "unit", seller: "AgriTech Nepal", category: "equipment", rating: 4.8, reviews: 45, stock: "In Stock", minQty: 1, step: 1 },
];

const PAYMENT_METHODS = [
  { id: "esewa", label: "eSewa" },
  { id: "khalti", label: "Khalti" },
  { id: "bank", label: "Global IME" },
  { id: "card", label: "Card" },
];

export default function Marketplace() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // Custom user quantity selection per item before adding to cart { itemId: quantity }
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // Cart & Checkout States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("cart"); // 'cart' | 'payment' | 'success'
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [paymentInput, setPaymentInput] = useState("");
  const [orderReceipt, setOrderReceipt] = useState(null);

  const CATEGORIES = [
    { key: "all", label: t("marketplace.all") || "All Products" },
    { key: "produce", label: "Fresh Vegetables & Fruits" },
    { key: "seeds", label: t("marketplace.seeds") || "Seeds & Nursery" },
    { key: "fertilizer", label: t("marketplace.fertilizer") || "Fertilizers" },
    { key: "equipment", label: t("marketplace.equipment") || "Farm Tools" },
  ];

  const getQtyForItem = (item) => {
    return selectedQuantities[item.id] !== undefined 
      ? selectedQuantities[item.id] 
      : item.minQty;
  };

  const handleQtyChange = (item, newQty) => {
    const val = Math.max(item.minQty, Number(parseFloat(newQty).toFixed(2)));
    setSelectedQuantities((prev) => ({ ...prev, [item.id]: val }));
  };

  const addToCart = (item, customQty = null) => {
    const qtyToAdd = customQty !== null ? customQty : getQtyForItem(item);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: Number((i.qty + qtyToAdd).toFixed(2)) } : i
        );
      }
      return [...prev, { ...item, qty: qtyToAdd }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateCartQty = (id, newQty) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const val = Math.max(item.minQty, Number(parseFloat(newQty).toFixed(2)));
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: val } : i))
    );
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const subtotal = cart.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
    const deliveryFee = 150;
    
    const receipt = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cart],
      totalAmount: subtotal + deliveryFee,
      paymentMethod: paymentMethod.toUpperCase(),
      date: new Date().toLocaleString(),
    };

    setOrderReceipt(receipt);
    setCheckoutStep("success");
    setCart([]);
  };

  const filtered = LISTINGS.filter((item) => {
    const matchesCategory = filter === "all" || item.category === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.unitPrice - b.unitPrice;
    if (sortBy === "price-high") return b.unitPrice - a.unitPrice;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const cartTotal = cart.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
  const totalCartCount = cart.length;

  return (
    <DashboardLayout>
      <div className="font-sans text-slate-800 max-w-7xl mx-auto space-y-6 pb-12 antialiased">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-transparent z-10" />
          <div className="relative z-20 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Flexible Quantities • Buy Exactly What You Need
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Direct Farmer Marketplace
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">
              Select custom weights for fresh produce or required counts for tools and seeds.
            </p>
          </div>
        </div>

        {/* Navigation & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search fresh vegetables, seeds, or farm tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all bg-slate-50/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setCheckoutStep("cart");
                  setIsCartOpen(true);
                }}
                className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95"
              >
                <span>Cart</span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 [scrollbar-width:none]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  filter === cat.key
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80">
            <p className="text-base font-semibold text-slate-800">No matching products found</p>
            <p className="text-xs text-slate-500 mt-1">Try refining your search keyword or clearing filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const qty = getQtyForItem(item);
              const calculatedPrice = Math.round(item.unitPrice * qty);

              return (
                <div
                  key={item.id}
                  className="group bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-600/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          Top Rated
                        </span>
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                        <StarIcon className="w-3.5 h-3.5 fill-current" />
                        {item.rating}
                      </span>
                      <span>({item.reviews} reviews)</span>
                    </div>

                    <h3 className="text-slate-900 font-bold text-base leading-snug group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5 mb-3">
                      Sold by <span className="font-semibold text-slate-700">{item.seller}</span>
                    </p>

                    {/* DYNAMIC WEIGHT / QUANTITY SELECTOR */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 mb-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                        <span>Select Quantity / Weight:</span>
                        <span className="font-semibold text-slate-900">
                          Rs. {item.unitPrice} / {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item, qty - item.step)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          -
                        </button>

                        <div className="relative flex-1">
                          <input
                            type="number"
                            step={item.step}
                            min={item.minQty}
                            value={qty}
                            onChange={(e) => handleQtyChange(item, e.target.value)}
                            className="w-full text-center text-xs font-bold py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                            {item.unit}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQtyChange(item, qty + item.step)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Price</span>
                      <span className="text-emerald-700 text-lg font-black">
                        Rs. {calculatedPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                      >
                        + Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(item);
                          setCheckoutStep("cart");
                          setIsCartOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Shopping Cart Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {checkoutStep === "cart" && "Your Custom Order Cart"}
                    {checkoutStep === "payment" && "Payment & Checkout"}
                    {checkoutStep === "success" && "Order Receipt"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-500"
                >
                  Close
                </button>
              </div>

              {/* CART STEP */}
              {checkoutStep === "cart" && (
                <>
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 space-y-2">
                        <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
                        <p className="text-xs">Explore products to add custom weight or quantities.</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1">
                            {/* Quantity Input inside cart */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500 font-medium">Qty:</span>
                              <input
                                type="number"
                                step={item.step}
                                min={item.minQty}
                                value={item.qty}
                                onChange={(e) => updateCartQty(item.id, e.target.value)}
                                className="w-16 px-2 py-0.5 text-xs font-bold border border-slate-200 rounded bg-white text-center focus:outline-none focus:border-emerald-600"
                              />
                              <span className="text-[11px] text-slate-500 uppercase font-semibold">{item.unit}</span>
                            </div>

                            <span className="text-xs text-emerald-700 font-extrabold">
                              Rs. {Math.round(item.unitPrice * item.qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Subtotal:</span>
                        <span className="text-base font-extrabold text-slate-900">Rs. {Math.round(cartTotal).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => setCheckoutStep("payment")}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* PAYMENT STEP */}
              {checkoutStep === "payment" && (
                <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col justify-between py-4">
                  <div className="space-y-4 overflow-y-auto pr-1">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((method) => {
                          const isSelected = paymentMethod === method.id;
                          return (
                            <label
                              key={method.id}
                              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={isSelected}
                                onChange={() => setPaymentMethod(method.id)}
                                className="hidden"
                              />
                              <span className="text-xs">{method.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        {paymentMethod === "esewa" || paymentMethod === "khalti"
                          ? "Mobile Number"
                          : paymentMethod === "bank"
                          ? "Account Number"
                          : "Card Number"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          paymentMethod === "esewa" || paymentMethod === "khalti"
                            ? "98XXXXXXXX"
                            : "Enter account details"
                        }
                        value={paymentInput}
                        onChange={(e) => setPaymentInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-200/60">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal:</span>
                        <span>Rs. {Math.round(cartTotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery Fee:</span>
                        <span>Rs. 150</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total Payable:</span>
                        <span className="text-emerald-700">Rs. {(Math.round(cartTotal) + 150).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md"
                    >
                      Pay & Confirm Order
                    </button>
                  </div>
                </form>
              )}

              {/* SUCCESS / RECEIPT STEP */}
              {checkoutStep === "success" && orderReceipt && (
                <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
                  <div className="space-y-4 overflow-y-auto pr-1">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
                      <span className="inline-block p-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-1">✓ Order Confirmed</span>
                      <h3 className="text-sm font-bold text-slate-900">Thank you for your purchase!</h3>
                      <p className="text-[11px] text-slate-500">Order Ref: {orderReceipt.orderId}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purchased Items</h4>
                      <div className="space-y-1.5">
                        {orderReceipt.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-semibold text-slate-800">{item.title}</p>
                              <p className="text-[10px] text-slate-500">{item.qty} {item.unit} @ Rs.{item.unitPrice}/{item.unit}</p>
                            </div>
                            <span className="font-bold text-slate-900">Rs. {Math.round(item.unitPrice * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-200/60">
                      <div className="flex justify-between text-slate-500">
                        <span>Payment Method:</span>
                        <span className="font-semibold text-slate-700">{orderReceipt.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Date:</span>
                        <span>{orderReceipt.date}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total Paid:</span>
                        <span className="text-emerald-700">Rs. {orderReceipt.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep("cart");
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Back to Marketplace
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}