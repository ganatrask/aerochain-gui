import React, { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ABI for a simplified smart contract (you would replace this with your actual contract ABI)
const vendorRegistryABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_vendorName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_partId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_contactInfo",
        "type": "string"
      }
    ],
    "name": "registerVendor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVendorCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedPart, setSelectedPart] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
    supplierCapacity: "",
    certification: "",
    deliveryTime: ""
  });
  const [isBlockchainConnected, setIsBlockchainConnected] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  
  // New state from App(1).js
  const [page, setPage] = useState("overview-dashboard");
  const [subPage, setSubPage] = useState(null);
  const [vendorControlOpen, setVendorControlOpen] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);

  // Enhanced Buyers Data - 15 aerospace parts
  const parts = [
    {
      id: 1,
      name: "Turbofan Blade",
      material: "Titanium Alloy",
      lastUpdated: "3 days ago",
      status: "Public",
      specs: {
        Design: "Aerodynamic profile optimized for low drag",
        Quantitative: "Weight - 2.5 kg/m²",
        "Type of Material": "Carbon Fiber Reinforced Polymer",
        "Thermal Conductivity": "0.2 W/m·K",
        "Tensile Strength": "600 MPa",
        "Elastic Modulus": "70 GPa",
        "Fatigue Limit": "200 MPa",
        "Corrosion Resistance": "Excellent in harsh environments",
        "Operating Temperature": "-50°C to 120°C",
        Color: "Black with a glossy finish",
        Applications: "Aerospace components, UAVs, automotive parts",
        Certifications: "ISO 9001, AS9100",
        "Manufacturing Process": "Automated Fiber Placement (AFP)",
        "Surface Treatment": "UV-resistant coating",
        Availability: "In stock, ready for immediate shipment",
        "Lead Time": "2 weeks for bulk orders",
      },
    },
    {
      id: 2,
      name: "Actuator Arm",
      material: "Aluminum 7075",
      lastUpdated: "1 day ago",
      status: "Private",
      specs: {
        Design: "Optimized for actuation",
        Quantitative: "Weight - 1.8 kg/m²",
        "Type of Material": "Aluminum 7075",
        "Tensile Strength": "500 MPa",
        "Elastic Modulus": "71 GPa",
        Availability: "Made to order",
        "Lead Time": "3 weeks",
        Applications: "Control surfaces, landing systems",
      },
    },
    {
      id: 3,
      name: "Landing Gear Shaft",
      material: "Steel 4340",
      lastUpdated: "4 days ago",
      status: "Public",
      specs: {
        Design: "Cylindrical shaft with high load tolerance",
        "Tensile Strength": "1080 MPa",
        Weight: "5.2 kg",
        Finish: "Zinc-plated",
        Applications: "Retractable landing gear",
        Certifications: "ISO 14001",
        "Lead Time": "2 weeks",
      },
    },
    {
      id: 4,
      name: "Avionics Heat Sink",
      material: "Copper-Tungsten",
      lastUpdated: "2 days ago",
      status: "Private",
      specs: {
        Design: "Modular fin-based heatsink",
        "Thermal Conductivity": "200 W/m·K",
        Finish: "Anodized Black",
        Applications: "Radar and avionics modules",
        Certifications: "RoHS, MIL-STD-810",
        Availability: "In stock",
        "Lead Time": "1 week",
      },
    },
    {
      id: 5,
      name: "Servo Bracket Assembly",
      material: "Stainless Steel 316L",
      lastUpdated: "6 days ago",
      status: "Public",
      specs: {
        Design: "Reinforced L-shaped bracket with multi-axis mount",
        Quantitative: "Weight - 0.95 kg",
        "Type of Material": "316L Stainless Steel",
        "Tensile Strength": "580 MPa",
        "Elastic Modulus": "193 GPa",
        Corrosion: "Excellent marine-grade resistance",
        Compatibility: "Standard aerospace servos (JR, Futaba)",
        Applications: "Control linkages in UAVs, stabilizers",
        Certifications: "NADCAP Compliant",
        Finish: "Electropolished",
        Availability: "Custom and standard sizes in stock",
        "Lead Time": "5–7 business days",
      }
    },
    {
      id: 6,
      name: "Composite Fuselage Panel",
      material: "Carbon Fiber Composite",
      lastUpdated: "Today",
      status: "Public",
      specs: {
        Design: "Honeycomb core sandwich panel for lightweight strength",
        Quantitative: "Weight - 3.0 kg/m²",
        "Type of Material": "Epoxy resin with carbon fiber",
        "Thermal Conductivity": "0.15 W/m·K",
        "Tensile Strength": "900 MPa",
        "Elastic Modulus": "85 GPa",
        "Impact Resistance": "High energy absorption",
        FireResistance: "Meets FAR 25.853",
        Applications: "Fuselage skin, fairings, access panels",
        Certifications: "FAA Certified, ISO 9001",
        "Manufacturing Process": "Autoclave cured",
        "Surface Treatment": "Fire-retardant coating",
        Availability: "Limited stock",
        "Lead Time": "3–4 weeks",
      }
    },
    {
      id: 7,
      name: "Flight Control Linkage",
      material: "Titanium Grade 5",
      lastUpdated: "Yesterday",
      status: "Private",
      specs: {
        Design: "Precision-machined rod with clevis ends",
        Quantitative: "Weight - 0.6 kg",
        "Tensile Strength": "950 MPa",
        "Elastic Modulus": "114 GPa",
        Corrosion: "High resistance in salt spray environment",
        Compatibility: "Universal aerospace actuator interfaces",
        Applications: "Elevator and aileron actuation systems",
        Finish: "Passivated surface",
        Certifications: "AMS 4911 Compliant",
        Availability: "Available upon request",
        "Lead Time": "2–3 weeks",
      }
    },
    {
      id: 8,
      name: "High-Precision Gearbox",
      material: "Nitrided Alloy Steel",
      lastUpdated: "5 days ago",
      status: "Public",
      specs: {
        Design: "Compact planetary gear system with high torque output",
        Quantitative: "Torque - 300 Nm, Weight - 2.3 kg",
        "Gear Ratio": "50:1",
        Lubrication: "Synthetic aerospace-grade grease",
        Applications: "Robotic joints, actuator drives",
        Certifications: "AS9100, ISO 9001",
        Compatibility: "Brushless DC and stepper motors",
        Finish: "Nickel-coated housing",
        Availability: "In stock for limited runs",
        "Lead Time": "7–10 business days",
      }
    },
    {
      id: 9,
      name: "Hydraulic Control Valve",
      material: "Inconel 718",
      lastUpdated: "7 days ago",
      status: "Public",
      specs: {
        Design: "Proportional flow control valve with high pressure tolerance",
        "Max Pressure": "350 bar",
        "Flow Rate": "120 L/min",
        "Temperature Range": "-30°C to 150°C",
        Applications: "Landing gear systems, flight controls",
        Certifications: "DO-160, MIL-STD-810",
        Availability: "Made to order",
        "Lead Time": "4 weeks",
      }
    },
    {
      id: 10,
      name: "Airframe Fastener Set",
      material: "Titanium Ti-6Al-4V",
      lastUpdated: "2 days ago",
      status: "Public",
      specs: {
        Design: "Lightweight aerospace-grade fasteners with various head types",
        Quantitative: "Tensile strength - 900 MPa",
        "Type of Material": "Titanium alloy (Grade 5)",
        "Corrosion Resistance": "Excellent",
        "Weight Reduction": "40% compared to steel fasteners",
        Applications: "Wing-to-fuselage connections, panel mounting",
        Certifications: "NAS, MS, BAC standards",
        "Surface Treatment": "Passivated",
        Availability: "In stock",
        "Lead Time": "1 week",
      }
    },
    {
      id: 11,
      name: "Electronic Flight Computer",
      material: "Multi-layer PCB with Aluminum Housing",
      lastUpdated: "Yesterday",
      status: "Private",
      specs: {
        Design: "Triple-redundant flight control computer",
        Processor: "ARM Cortex-R5F (400MHz)",
        Memory: "4GB ECC RAM, 32GB Flash",
        "Power Consumption": "15W nominal",
        "Environmental Rating": "IP65, MIL-STD-810G",
        Certifications: "DO-254, DO-178C Level A",
        Applications: "Primary flight control, fly-by-wire systems",
        Availability: "12 week lead time",
        "Special Requirements": "ITAR controlled",
      }
    },
    {
      id: 12,
      name: "Composite Wing Spar",
      material: "Carbon Fiber/Epoxy Composite",
      lastUpdated: "5 days ago",
      status: "Public",
      specs: {
        Design: "I-beam construction with unidirectional carbon fiber reinforcement",
        "Tensile Strength": "1200 MPa",
        "Flexural Modulus": "140 GPa",
        Weight: "65% lighter than aluminum equivalent",
        "Fatigue Performance": "Excellent resistance to cyclic loading",
        Applications: "Primary wing structure, UAV construction",
        Certifications: "AS9100D, NADCAP AC7118",
        "Testing": "100% ultrasonic inspection",
        Availability: "Custom manufacturing",
        "Lead Time": "8-10 weeks",
      }
    },
    {
      id: 13,
      name: "Anti-Ice Heating Element",
      material: "Nickel-Chromium Alloy",
      lastUpdated: "3 days ago",
      status: "Public",
      specs: {
        Design: "Thin-film resistive heating element with embedded sensors",
        "Power Density": "2.5 W/cm²",
        "Operating Voltage": "28V DC",
        "Temperature Range": "-60°C to 200°C",
        "Response Time": "< 5 seconds to full heat",
        Applications: "Wing leading edges, engine inlets, pitot tubes",
        Certifications: "SAE AMS 2750F",
        Availability: "Made to specification",
        "Lead Time": "3-4 weeks",
      }
    },
    {
      id: 14,
      name: "Fuel System Sensor Package",
      material: "316 Stainless Steel with PTFE",
      lastUpdated: "Today",
      status: "Private",
      specs: {
        Design: "Integrated fuel level, temperature, and density sensors",
        "Accuracy": "±0.5% for level, ±1°C for temperature",
        "Output": "ARINC 429 protocol",
        "Operating Pressure": "0-10 bar",
        "Fuel Compatibility": "Jet A, Jet A-1, JP-8",
        Applications: "Aircraft fuel tanks, fuel management systems",
        Certifications: "DO-160G, ATEX",
        "MTBF": "> 50,000 hours",
        Availability: "In production",
        "Lead Time": "6 weeks",
      }
    },
    {
      id: 15,
      name: "Cabin Air Filtration System",
      material: "Aluminum/Composite Housing with HEPA Media",
      lastUpdated: "4 days ago",
      status: "Public",
      specs: {
        Design: "Multi-stage filtration with UV sterilization",
        "Filtration Efficiency": "99.97% of particles ≥ 0.3µm",
        "Air Flow Rate": "500 CFM",
        "Pressure Drop": "< 0.5 inH₂O at rated flow",
        "Life Span": "3,000 flight hours",
        Applications: "Commercial aircraft cabin air systems",
        Certifications: "SAE ARP1796, EASA CS-25",
        Availability: "In stock",
        "Lead Time": "2 weeks",
      }
    }
  ];

  // Enhanced Orders Data - 15 entries
  const orders = [
    { id: "#ORD-001", item: "Servo Bracket Assembly", qty: 100, vendor: "AeroTech Industries", date: "2025-03-10", status: "Shipped", deliveryDate: "2025-04-15", trackingNum: "AT728495620" },
    { id: "#ORD-002", item: "Avionics Heat Sink", qty: 50, vendor: "Precision Aerospace", date: "2025-03-15", status: "Pending", deliveryDate: "2025-04-20", trackingNum: "Pending" },
    { id: "#ORD-003", item: "Landing Gear Shaft", qty: 25, vendor: "Global Aero Components", date: "2025-03-18", status: "In Production", deliveryDate: "2025-04-22", trackingNum: "Pending" },
    { id: "#ORD-004", item: "Turbofan Blade", qty: 150, vendor: "AeroTech Industries", date: "2025-03-05", status: "Shipped", deliveryDate: "2025-04-10", trackingNum: "AT728392018" },
    { id: "#ORD-005", item: "Flight Control Linkage", qty: 75, vendor: "TitaniumPro Supplies", date: "2025-03-12", status: "Quality Check", deliveryDate: "2025-04-18", trackingNum: "Pending" },
    { id: "#ORD-006", item: "Composite Fuselage Panel", qty: 30, vendor: "Global Aero Components", date: "2025-03-20", status: "Pending", deliveryDate: "2025-04-25", trackingNum: "Pending" },
    { id: "#ORD-007", item: "High-Precision Gearbox", qty: 15, vendor: "Precision Aerospace", date: "2025-03-08", status: "Shipped", deliveryDate: "2025-04-12", trackingNum: "PA65432987" },
    { id: "#ORD-008", item: "Hydraulic Control Valve", qty: 40, vendor: "TitaniumPro Supplies", date: "2025-03-17", status: "In Production", deliveryDate: "2025-04-28", trackingNum: "Pending" },
    { id: "#ORD-009", item: "Airframe Fastener Set", qty: 500, vendor: "AeroTech Industries", date: "2025-03-22", status: "Pending", deliveryDate: "2025-04-30", trackingNum: "Pending" },
    { id: "#ORD-010", item: "Electronic Flight Computer", qty: 10, vendor: "Precision Aerospace", date: "2025-03-01", status: "Shipped", deliveryDate: "2025-04-05", trackingNum: "PA65487321" },
    { id: "#ORD-011", item: "Composite Wing Spar", qty: 8, vendor: "Global Aero Components", date: "2025-03-25", status: "Material Sourcing", deliveryDate: "2025-05-10", trackingNum: "Pending" },
    { id: "#ORD-012", item: "Anti-Ice Heating Element", qty: 60, vendor: "TitaniumPro Supplies", date: "2025-03-14", status: "Quality Check", deliveryDate: "2025-04-18", trackingNum: "Pending" },
    { id: "#ORD-013", item: "Fuel System Sensor Package", qty: 25, vendor: "Precision Aerospace", date: "2025-03-19", status: "In Production", deliveryDate: "2025-04-25", trackingNum: "Pending" },
    { id: "#ORD-014", item: "Cabin Air Filtration System", qty: 12, vendor: "AeroTech Industries", date: "2025-03-09", status: "Shipped", deliveryDate: "2025-04-15", trackingNum: "AT728496735" },
    { id: "#ORD-015", item: "Actuator Arm", qty: 35, vendor: "TitaniumPro Supplies", date: "2025-03-28", status: "Pending", deliveryDate: "2025-05-05", trackingNum: "Pending" }
  ];

  // Enhanced Inventory Management for Orders page
  const inventory = [
    { id: 1, name: "Turbofan Blade", qty: 1250, location: "Warehouse A, Row 15, Shelf 3", lastUpdated: "2025-04-02", minLevel: 1000, onOrder: 150 },
    { id: 2, name: "Actuator Arm", qty: 450, location: "Warehouse A, Row 8, Shelf 1", lastUpdated: "2025-04-03", minLevel: 400, onOrder: 35 },
    { id: 3, name: "Landing Gear Shaft", qty: 180, location: "Warehouse B, Row 3, Shelf 2", lastUpdated: "2025-04-01", minLevel: 200, onOrder: 25 },
    { id: 4, name: "Avionics Heat Sink", qty: 780, location: "Warehouse A, Row 10, Shelf 4", lastUpdated: "2025-04-05", minLevel: 500, onOrder: 50 },
    { id: 5, name: "Servo Bracket Assembly", qty: 620, location: "Warehouse A, Row 5, Shelf 2", lastUpdated: "2025-04-04", minLevel: 400, onOrder: 100 },
    { id: 6, name: "Composite Fuselage Panel", qty: 320, location: "Warehouse C, Row 2, Shelf 1", lastUpdated: "2025-04-02", minLevel: 300, onOrder: 30 },
    { id: 7, name: "Flight Control Linkage", qty: 280, location: "Warehouse B, Row 6, Shelf 3", lastUpdated: "2025-04-05", minLevel: 250, onOrder: 75 },
    { id: 8, name: "High-Precision Gearbox", qty: 95, location: "Warehouse B, Row 4, Shelf 2", lastUpdated: "2025-04-03", minLevel: 80, onOrder: 15 },
    { id: 9, name: "Hydraulic Control Valve", qty: 120, location: "Warehouse C, Row 3, Shelf 3", lastUpdated: "2025-04-04", minLevel: 100, onOrder: 40 },
    { id: 10, name: "Airframe Fastener Set", qty: 3500, location: "Warehouse A, Row 2, Shelf 1", lastUpdated: "2025-04-02", minLevel: 3000, onOrder: 500 },
    { id: 11, name: "Electronic Flight Computer", qty: 25, location: "Secure Storage, Cabinet 2", lastUpdated: "2025-04-06", minLevel: 20, onOrder: 10 },
    { id: 12, name: "Composite Wing Spar", qty: 18, location: "Warehouse C, Row 1, Shelf 1", lastUpdated: "2025-04-01", minLevel: 15, onOrder: 8 },
    { id: 13, name: "Anti-Ice Heating Element", qty: 210, location: "Warehouse B, Row 7, Shelf 4", lastUpdated: "2025-04-03", minLevel: 150, onOrder: 60 },
    { id: 14, name: "Fuel System Sensor Package", qty: 65, location: "Warehouse B, Row 8, Shelf 1", lastUpdated: "2025-04-05", minLevel: 50, onOrder: 25 },
    { id: 15, name: "Cabin Air Filtration System", qty: 32, location: "Warehouse A, Row 12, Shelf 2", lastUpdated: "2025-04-02", minLevel: 30, onOrder: 12 }
  ];

  // Enhanced Vendors Data - 15 entries
  const vendors = [
    { id: 1, name: "AeroTech Industries", rating: 4.8, location: "Seattle, WA", blockchain: true, activeContracts: 12, contactPerson: "John Smith", email: "jsmith@aerotech.com", phone: "206-555-1234", deliveryPerformance: 98, qualityScore: 95, avgLeadTime: 14, specialization: "Precision machined components", yearEstablished: 2006, certifications: ["AS9100D", "ISO 9001:2015", "NADCAP"] },
    { id: 2, name: "TitaniumPro Supplies", rating: 4.5, location: "Phoenix, AZ", blockchain: true, activeContracts: 8, contactPerson: "Sarah Johnson", email: "sjohnson@titanium.com", phone: "480-555-9876", deliveryPerformance: 92, qualityScore: 97, avgLeadTime: 18, specialization: "Titanium alloy parts", yearEstablished: 2010, certifications: ["ISO 9001:2015", "AS9100C"] },
    { id: 3, name: "Global Aero Components", rating: 4.2, location: "Dallas, TX", blockchain: true, activeContracts: 5, contactPerson: "David Williams", email: "dwilliams@globalaero.com", phone: "214-555-4321", deliveryPerformance: 89, qualityScore: 90, avgLeadTime: 21, specialization: "Composite structures", yearEstablished: 2009, certifications: ["ISO 9001:2015", "AS9100D", "ISO 14001"] },
    { id: 4, name: "Precision Aerospace", rating: 4.7, location: "Boston, MA", blockchain: false, activeContracts: 3, contactPerson: "Michelle Brown", email: "mbrown@precision.com", phone: "617-555-7890", deliveryPerformance: 94, qualityScore: 93, avgLeadTime: 16, specialization: "Avionics and electronic systems", yearEstablished: 2012, certifications: ["AS9100D", "ISO 9001:2015", "CMMI Level 3"] },
    { id: 5, name: "Advanced Materials Corp", rating: 4.3, location: "San Diego, CA", blockchain: true, activeContracts: 7, contactPerson: "Robert Chen", email: "rchen@advmaterials.com", phone: "858-555-3456", deliveryPerformance: 91, qualityScore: 88, avgLeadTime: 15, specialization: "Composite and advanced materials", yearEstablished: 2008, certifications: ["AS9100D", "NADCAP"] },
    { id: 6, name: "Aerospace Dynamics", rating: 4.6, location: "Denver, CO", blockchain: true, activeContracts: 9, contactPerson: "Jennifer Adams", email: "jadams@aerodyn.com", phone: "303-555-6789", deliveryPerformance: 95, qualityScore: 92, avgLeadTime: 12, specialization: "Hydraulic systems", yearEstablished: 2005, certifications: ["ISO 9001:2015", "AS9100D"] },
    { id: 7, name: "NextGen Aviation Systems", rating: 4.4, location: "Austin, TX", blockchain: false, activeContracts: 4, contactPerson: "Michael Wilson", email: "mwilson@nextgenav.com", phone: "512-555-2468", deliveryPerformance: 90, qualityScore: 94, avgLeadTime: 19, specialization: "Flight control systems", yearEstablished: 2013, certifications: ["AS9100D", "ISO 9001:2015"] },
    { id: 8, name: "AirFrame Technologies", rating: 4.1, location: "Portland, OR", blockchain: true, activeContracts: 6, contactPerson: "Lisa Parker", email: "lparker@airframetech.com", phone: "503-555-1357", deliveryPerformance: 87, qualityScore: 89, avgLeadTime: 20, specialization: "Structural components", yearEstablished: 2011, certifications: ["ISO 9001:2015", "AS9100C"] },
    { id: 9, name: "Sky-High Fabrication", rating: 4.9, location: "Wichita, KS", blockchain: true, activeContracts: 11, contactPerson: "Thomas Rodriguez", email: "trodriguez@skyhighfab.com", phone: "316-555-8642", deliveryPerformance: 97, qualityScore: 98, avgLeadTime: 13, specialization: "Fuselage and wing components", yearEstablished: 2003, certifications: ["AS9100D", "ISO 9001:2015", "NADCAP"] },
    { id: 10, name: "Quantum Aerospace Solutions", rating: 4.0, location: "Atlanta, GA", blockchain: false, activeContracts: 2, contactPerson: "Karen Martinez", email: "kmartinez@quantumaero.com", phone: "404-555-7531", deliveryPerformance: 85, qualityScore: 87, avgLeadTime: 22, specialization: "Landing gear systems", yearEstablished: 2015, certifications: ["ISO 9001:2015", "AS9100C"] },
    { id: 11, name: "Aerodynamic Precision Works", rating: 4.5, location: "Cincinnati, OH", blockchain: true, activeContracts: 7, contactPerson: "Daniel Thompson", email: "dthompson@aeroprecision.com", phone: "513-555-9753", deliveryPerformance: 93, qualityScore: 91, avgLeadTime: 17, specialization: "Engine components", yearEstablished: 2007, certifications: ["AS9100D", "ISO 9001:2015"] },
    { id: 12, name: "Elite Aerospace Manufacturing", rating: 4.8, location: "Hartford, CT", blockchain: true, activeContracts: 10, contactPerson: "Rachel Kim", email: "rkim@eliteaero.com", phone: "860-555-3691", deliveryPerformance: 96, qualityScore: 96, avgLeadTime: 15, specialization: "Actuator systems", yearEstablished: 2004, certifications: ["ISO 9001:2015", "AS9100D", "NADCAP"] },
    { id: 13, name: "Alliance Aviation Components", rating: 4.2, location: "Charleston, SC", blockchain: false, activeContracts: 4, contactPerson: "Christopher Davis", email: "cdavis@allianceaviation.com", phone: "843-555-8024", deliveryPerformance: 88, qualityScore: 90, avgLeadTime: 20, specialization: "Interior components", yearEstablished: 2010, certifications: ["AS9100C", "ISO 9001:2015"] },
    { id: 14, name: "Sky Materials", rating: 4.6, location: "Minneapolis, MN", blockchain: true, activeContracts: 8, contactPerson: "Amanda White", email: "awhite@skymaterials.com", phone: "612-555-4682", deliveryPerformance: 94, qualityScore: 93, avgLeadTime: 16, specialization: "Composite materials", yearEstablished: 2008, certifications: ["ISO 9001:2015", "AS9100D"] },
    { id: 15, name: "Aerospace Precision Products", rating: 4.3, location: "Huntsville, AL", blockchain: true, activeContracts: 6, contactPerson: "Brian Miller", email: "bmiller@aeroprecision.com", phone: "256-555-7319", deliveryPerformance: 91, qualityScore: 89,