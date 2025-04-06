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

  // Sample vendors data
  const vendors = [
    { id: 1, name: "AeroTech Industries", rating: 4.8, location: "Seattle, WA", blockchain: true, activeContracts: 12, contactPerson: "John Smith", email: "jsmith@aerotech.com", phone: "206-555-1234", deliveryPerformance: 98, qualityScore: 95, avgLeadTime: 14 },
    { id: 2, name: "TitaniumPro Supplies", rating: 4.5, location: "Phoenix, AZ", blockchain: true, activeContracts: 8, contactPerson: "Sarah Johnson", email: "sjohnson@titanium.com", phone: "480-555-9876", deliveryPerformance: 92, qualityScore: 97, avgLeadTime: 18 },
    { id: 3, name: "Global Aero Components", rating: 4.2, location: "Dallas, TX", blockchain: true, activeContracts: 5, contactPerson: "David Williams", email: "dwilliams@globalaero.com", phone: "214-555-4321", deliveryPerformance: 89, qualityScore: 90, avgLeadTime: 21 },
    { id: 4, name: "Precision Aerospace", rating: 4.7, location: "Boston, MA", blockchain: false, activeContracts: 3, contactPerson: "Michelle Brown", email: "mbrown@precision.com", phone: "617-555-7890", deliveryPerformance: 94, qualityScore: 93, avgLeadTime: 16 },
  ];
  
  // Sample ongoing orders
  const ongoingOrders = [
    { id: 1, partName: "Turbofan Blade", companyName: "AeroTech Industries", count: 500, orderDate: "2025-03-15", deliveryDate: "2025-04-20", progress: 65, forecastDelivery: "On time", status: "In Production" },
    { id: 2, partName: "Actuator Arm", companyName: "TitaniumPro Supplies", count: 300, orderDate: "2025-03-10", deliveryDate: "2025-04-15", progress: 80, forecastDelivery: "Early (Apr 12)", status: "Final Testing" },
    { id: 3, partName: "Landing Gear Shaft", companyName: "Global Aero Components", count: 150, orderDate: "2025-03-20", deliveryDate: "2025-04-25", progress: 40, forecastDelivery: "Delayed (May 2)", status: "Production" },
    { id: 4, partName: "Avionics Heat Sink", companyName: "Precision Aerospace", count: 800, orderDate: "2025-03-01", deliveryDate: "2025-04-10", progress: 95, forecastDelivery: "On time", status: "Quality Control" },
  ];
  
  // Sample current inventory with cost data
  const currentInventory = [
    { id: 1, partName: "Turbofan Blade", companyName: "AeroTech Industries", count: 1250, lastUpdate: "2025-04-02", nextOrderDue: "2025-04-30", minThreshold: 1000, unitCost: 3200, reorderCost: 150000, leadTime: 14 },
    { id: 2, partName: "Actuator Arm", companyName: "TitaniumPro Supplies", count: 450, lastUpdate: "2025-04-03", nextOrderDue: "2025-04-15", minThreshold: 400, unitCost: 850, reorderCost: 42000, leadTime: 10 },
    { id: 3, partName: "Landing Gear Shaft", companyName: "Global Aero Components", count: 180, lastUpdate: "2025-04-01", nextOrderDue: "2025-04-10", minThreshold: 200, unitCost: 4500, reorderCost: 90000, leadTime: 21 },
    { id: 4, partName: "Avionics Heat Sink", companyName: "Precision Aerospace", count: 780, lastUpdate: "2025-04-05", nextOrderDue: "2025-05-15", minThreshold: 500, unitCost: 320, reorderCost: 25000, leadTime: 7 },
    { id: 5, partName: "Servo Bracket Assembly", companyName: "AeroTech Industries", count: 620, lastUpdate: "2025-04-04", nextOrderDue: "2025-04-20", minThreshold: 400, unitCost: 275, reorderCost: 18000, leadTime: 8 },
    { id: 6, partName: "Composite Fuselage Panel", companyName: "Global Aero Components", count: 320, lastUpdate: "2025-04-02", nextOrderDue: "2025-04-12", minThreshold: 300, unitCost: 5800, reorderCost: 175000, leadTime: 30 },
  ];
  
  // Sample vendor performance data for charts
  const vendorPerformanceData = [
    { month: 'Nov', onTime: 85, quality: 88, blockchain: 60 },
    { month: 'Dec', onTime: 87, quality: 89, blockchain: 65 },
    { month: 'Jan', onTime: 89, quality: 91, blockchain: 72 },
    { month: 'Feb', onTime: 91, quality: 93, blockchain: 78 },
    { month: 'Mar', onTime: 93, quality: 94, blockchain: 85 },
    { month: 'Apr', onTime: 92, quality: 95, blockchain: 90 },
  ];
  
  // Sample blockchain activity data
  const blockchainActivityData = [
    { month: 'Nov', contracts: 8, verifications: 12 },
    { month: 'Dec', contracts: 15, verifications: 18 },
    { month: 'Jan', contracts: 22, verifications: 25 },
    { month: 'Feb', contracts: 28, verifications: 32 },
    { month: 'Mar', contracts: 35, verifications: 40 },
    { month: 'Apr', contracts: 42, verifications: 45 },
  ];
  
  // Sample inventory data
  const inventoryLevelsData = [
    { name: 'Turbofan Blade', value: 1250, threshold: 1000 },
    { name: 'Actuator Arm', value: 450, threshold: 400 },
    { name: 'Landing Gear Shaft', value: 180, threshold: 200 },
    { name: 'Avionics Heat Sink', value: 780, threshold: 500 },
    { name: 'Servo Bracket', value: 620, threshold: 400 },
    { name: 'Fuselage Panel', value: 320, threshold: 300 },
  ];
  
  // Sample lead time data
  const leadTimeData = [
    { vendor: 'AeroTech', quoted: 14, actual: 15 },
    { vendor: 'TitaniumPro', quoted: 18, actual: 17 },
    { vendor: 'Global Aero', quoted: 21, actual: 23 },
    { vendor: 'Precision', quoted: 16, actual: 16 },
  ];
  
  // Sample supplier distribution data
  const supplierDistributionData = [
    { name: 'West Coast', value: 35 },
    { name: 'Midwest', value: 20 },
    { name: 'East Coast', value: 25 },
    { name: 'South', value: 15 },
    { name: 'International', value: 5 },
  ];

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
  ];
  
  // New data structures from App(1).js
  const orders = [
    { id: "#001", item: "Servo Bracket", qty: 100, status: "Shipped" },
    { id: "#002", item: "Heat Sink", qty: 50, status: "Pending" },
  ];

  const completedOrders = [
    { id: "#12345", rating: 5, comments: "Great service!" },
  ];
  
  // State for selected vendor or part details
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedInventoryPart, setSelectedInventoryPart] = useState(null);
  
  // Initialize Web3 connection
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Get connected account
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          
          // Connect to smart contract (replace with your contract address)
          const contractAddress = "0x1234567890123456789012345678901234567890"; // Example address
          const contractInstance = new web3Instance.eth.Contract(
            vendorRegistryABI,
            contractAddress
          );
          setContract(contractInstance);
          setIsBlockchainConnected(true);
        } catch (error) {
          console.error("User denied account access or error occurred:", error);
        }
      } else {
        console.log("Please install MetaMask or another Ethereum wallet provider.");
      }
    };
    
    initWeb3();
  }, []);

  const handleLogin = () => {
    if (form.email && form.password) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter both email and password.");
    }
  };
  
  const handleVendorFormChange = (e) => {
    setVendorForm({
      ...vendorForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleVendorSubmit = async () => {
    if (!isBlockchainConnected) {
      alert("Please connect to blockchain first");
      return;
    }
    
    setTxStatus("Submitting to blockchain...");
    
    try {
      // Call the smart contract function
      await contract.methods.registerVendor(
        vendorForm.companyName,
        selectedPart.id.toString(),
        JSON.stringify({
          email: vendorForm.contactEmail,
          phone: vendorForm.phoneNumber,
          capacity: vendorForm.supplierCapacity,
          certification: vendorForm.certification,
          deliveryTime: vendorForm.deliveryTime
        })
      ).send({ from: account });
      
      setTxStatus("Successfully registered on blockchain!");
      setTimeout(() => {
        setSelectedPart(null);
        setTxStatus("");
      }, 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxStatus("Transaction failed. See console for details.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-left">
          <h1>Welcome to Our Blockchain-Powered Procurement Platform</h1>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={isLogin ? "active" : ""}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={!isLogin ? "active" : ""}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {isLogin ? (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <div className="forgot">Forgot password?</div>
                <button className="primary" onClick={handleLogin}>
                  Login
                </button>
                <button className="secondary">Continue with Google</button>
              </>
            ) : (
              <>
                <input type="text" placeholder="Full Name" />
                <input type="email" placeholder="Email" />
                <input type="tel" placeholder="Phone Number" />
                <input type="password" placeholder="Password" />
                <button className="primary" onClick={handleLogin}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>{page === "vendors" ? "Performance Dashboard" : "Dashboard"}</h2>
        <ul>
          <li onClick={() => setPage("overview-dashboard")}>📊 Analytics Dashboard</li>
          <li onClick={() => setPage("dashboard")}>👥 Buyers</li>
          <li onClick={() => setPage("orders")}>📦 Orders</li>
          <li onClick={() => setPage("vendors")}>🏭 Vendors</li>
          <li onClick={() => setVendorControlOpen(!vendorControlOpen)}>
            🛠 Vendor Control {vendorControlOpen ? "▾" : "▸"}
          </li>
          {vendorControlOpen && (
            <ul className="sub-menu">
              <li onClick={() => { setPage("vendor-control"); setSubPage("bids"); }}>📩 Bids</li>
              <li onClick={() => { setPage("vendor-control"); setSubPage("followups"); }}>⏰ Follow Ups</li>
              <li onClick={() => { setPage("vendor-control"); setSubPage("trusted"); }}>⭐ Trusted Sources</li>
            </ul>
          )}
          <li>⛓️ Blockchain Status: {isBlockchainConnected ? 
              <span className="status-connected">Connected</span> : 
              <span className="status-disconnected">Disconnected</span>}
          </li>
          {account && <li className="account-info">🔑 {account.substring(0, 6)}...{account.substring(account.length - 4)}</li>}
        </ul>
      </div>

      <div className="main-content">
      {page === "overview-dashboard" && (
  <div className="dashboard-overview">
    <h2>Aerospace Procurement Analytics</h2>
    
    {/* Top KPIs row */}
    <div className="kpi-row">
      <div className="kpi-card">
        <h3>Verified Vendors</h3>
        <div className="kpi-value">24 <span className="blockchain-verified">⛓️</span></div>
      </div>
      <div className="kpi-card">
        <h3>On-time Delivery</h3>
        <div className="kpi-value">92%</div>
      </div>
      <div className="kpi-card">
        <h3>Active Contracts</h3>
        <div className="kpi-value">37</div>
      </div>
      <div className="kpi-card">
        <h3>Inventory Value</h3>
        <div className="kpi-value">$7.4M</div>
        <div className="kpi-subtitle">Avg. Reorder Cost: $83.3K</div>
      </div>
    </div>
    
    {/* MOVED: Supplier Distribution and Inventory Levels first */}
    <div className="section-header">
      <h3>Inventory & Supplier Overview</h3>
    </div>
    <div className="charts-grid">
      <div className="chart-container">
        <h3>Supplier Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={supplierDistributionData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {supplierDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <h3>Inventory Levels</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={inventoryLevelsData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" name="Current Stock">
              {inventoryLevelsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value < entry.threshold ? '#ff8042' : '#82ca9d'} />
              ))}
            </Bar>
            <Bar dataKey="threshold" fill="#8884d8" name="Min Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    
    {/* MOVED: Current Inventory Status Section next */}
    <div className="section-header">
      <h3>Current Inventory Status</h3>
    </div>
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Part Name</th>
            <th>Supplier</th>
            <th>Current Count</th>
            <th>Last Updated</th>
            <th>Next Order Due</th>
            <th>Inventory Status</th>
          </tr>
        </thead>
        <tbody>
          {currentInventory.map(item => (
            <tr key={item.id}>
              <td><a href="#" onClick={(e) => {e.preventDefault(); setSelectedInventoryPart(parts.find(p => p.name === item.partName));}}>{item.partName}</a></td>
              <td><a href="#" onClick={(e) => {e.preventDefault(); setSelectedVendor(vendors.find(v => v.name === item.companyName));}}>{item.companyName}</a></td>
              <td>{item.count.toLocaleString()}</td>
              <td>{new Date(item.lastUpdate).toLocaleDateString()}</td>
              <td>{new Date(item.nextOrderDue).toLocaleDateString()}</td>
              <td className={item.count < item.minThreshold ? "low-inventory" : "good-inventory"}>
                {item.count < item.minThreshold ? "Low Stock" : "Good"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Order Tracking Section */}
    <div className="section-header">
      <h3>Ongoing Orders</h3>
    </div>
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Part Name</th>
            <th>Vendor</th>
            <th>Quantity</th>
            <th>Delivery Date</th>
            <th>Progress</th>
            <th>Delivery Forecast</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {ongoingOrders.map(order => (
            <tr key={order.id}>
              <td><a href="#" onClick={(e) => {e.preventDefault(); setSelectedInventoryPart(parts.find(p => p.name === order.partName));}}>{order.partName}</a></td>
              <td><a href="#" onClick={(e) => {e.preventDefault(); setSelectedVendor(vendors.find(v => v.name === order.companyName));}}>{order.companyName}</a></td>
              <td>{order.count.toLocaleString()}</td>
              <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
              <td>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{width: `${order.progress}%`}}></div>
                  <span className="progress-text">{order.progress}%</span>
                </div>
              </td>
              <td className={order.forecastDelivery.includes("Delayed") ? "delayed" : order.forecastDelivery.includes("Early") ? "early" : "on-time"}>
                {order.forecastDelivery}
              </td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Charts section - remaining charts */}
    <div className="section-header">
      <h3>Performance Analytics</h3>
    </div>
    <div className="charts-grid">
      <div className="chart-container large">
        <h3>Vendor Performance Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={vendorPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="onTime" stroke="#8884d8" name="On-time Delivery %" />
            <Line type="monotone" dataKey="quality" stroke="#82ca9d" name="Quality Score" />
            <Line type="monotone" dataKey="blockchain" stroke="#ffc658" name="Blockchain Verified %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <h3>Blockchain Contract Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={blockchainActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="contracts" fill="#8884d8" name="New Contracts" />
            <Bar dataKey="verifications" fill="#82ca9d" name="Verifications" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <h3>Lead Time Analysis</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={leadTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendor" />
            <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="quoted" fill="#8884d8" name="Quoted Lead Time" />
            <Bar dataKey="actual" fill="#82ca9d" name="Actual Lead Time" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    
    <div className="blockchain-status-panel">
      <h3>⛓️ Blockchain Network Status</h3>
      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">Network:</span>
          <span className="status-value">Ethereum Mainnet</span>
        </div>
        <div className="status-item">
          <span className="status-label">Connected Account:</span>
          <span className="status-value">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Not connected"}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Smart Contract:</span>
          <span className="status-value">VendorRegistry</span>
        </div>
        <div className="status-item">
          <span className="status-label">Connection Status:</span>
          <span className="status-value">{isBlockchainConnected ? "Connected ✅" : "Disconnected ❌"}</span>
        </div>
      </div>
    </div>
  </div>
)}
        
        {page === "dashboard" && (
          <>
            <div className="header-banner">
              <h2>Aerospace Part Catalog</h2>
              <div className="blockchain-indicator">
                {isBlockchainConnected ? 
                  <span className="blockchain-connected">⛓️ Blockchain Connected</span> : 
                  <span className="blockchain-disconnected">⛓️ Connect Wallet</span>}
              </div>
            </div>
            
            {parts.map((part) => (
              <div className="buyer-card" key={part.id}>
                <h3>{part.name}</h3>
                <p>
                  <strong>Material:</strong> {part.material}
                </p>
                <p>
                  <strong>Last Updated:</strong> {part.lastUpdated}
                </p>
                <p>
                  <strong>Status:</strong> {part.status}
                </p>
                <button onClick={() => setSelectedPart(part)}>More Info</button>
              </div>
            ))}
          </>
        )}

        {page === "orders" && (
          <>
            <h2>Upload Inventory</h2>
            <div className="upload-box">Drag and drop or click to upload XLS/CSV files</div>
            <h3 style={{ marginTop: "30px" }}>Inventory Management</h3>
            <table>
              <thead>
                <tr><th>Material Name</th><th>Quantity</th><th>Location</th><th>Last Updated</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Material 1</td>
                  <td>100</td>
                  <td>Warehouse A</td>
                  <td>Today</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button className="primary">Save Changes</button>
              <button className="primary">Export Inventory</button>
              <button className="primary">Order Materials</button>
            </div>
          </>
        )}

        {page === "vendors" && (
          <>
            <h3>Vendor Scorecard</h3>
            <div className="scorecard">
              <div className="rating-badge">5</div>
              <span>Rating based on delivery performance</span>
            </div>
            <h3>Data Visualizations</h3>
            <div className="chart-row">
              <div className="chart-placeholder">Order Fulfillment Over Time</div>
              <div className="chart-placeholder">Current Stock Composition</div>
            </div>
            <h3>Completed Orders</h3>
            <table>
              <thead>
                <tr><th>Order ID</th><th>Rating</th><th>Comments</th></tr>
              </thead>
              <tbody>
                {completedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.rating}</td>
                    <td>{order.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label>Filter by Time:</label><br />
            <input type="text" placeholder="Enter date..." style={{ marginTop: "10px" }} />
          </>
        )}

        {page === "vendor-control" && subPage === "bids" && (
          <>
            <h2>Vendor Bids</h2>
            <table>
              <thead>
                <tr><th>Vendor</th><th>Material</th><th>Bid Price</th><th>Timeline</th><th>Rating</th><th>Blockchain Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vendor A</td>
                  <td>Titanium Alloy</td>
                  <td>$120/unit</td>
                  <td>3 weeks</td>
                  <td>4.8 ⭐</td>
                  <td>✅ Verified</td>
                </tr>
                <tr>
                  <td>Vendor B</td>
                  <td>Aluminum 7075</td>
                  <td>$95/unit</td>
                  <td>2 weeks</td>
                  <td>4.5 ⭐</td>
                  <td>⏳ Pending</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {page === "vendor-control" && subPage === "followups" && (
          <>
            <h2>Vendor Follow-Ups</h2>
            <p>Set follow-up reminders and track vendor updates:</p>
            <table>
              <thead>
                <tr><th>Vendor</th><th>Material</th><th>Next Update</th><th>Status</th><th>Blockchain Contract</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vendor A</td>
                  <td>Titanium Alloy</td>
                  <td>April 15, 2025</td>
                  <td>Pending</td>
                  <td><code>0x12...3f4d</code></td>
                </tr>
                <tr>
                  <td>Vendor B</td>
                  <td>Aluminum 7075</td>
                  <td>April 18, 2025</td>
                  <td>Scheduled</td>
                  <td><code>0x78...9a2b</code></td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {page === "vendor-control" && subPage === "trusted" && (
          <>
            <h2>Trusted Vendor Sources</h2>
            <p>Blockchain-verified trusted vendor list:</p>
            <ul className="trusted-list">
              <li>✅ Vendor A <span className="blockchain-verified">⛓️ Verified</span> <button className="secondary">Remove</button></li>
              <li>✅ Vendor C <span className="blockchain-verified">⛓️ Verified</span> <button className="secondary">Remove</button></li>
            </ul>
            <input type="text" placeholder="Add new vendor..." style={{ marginTop: "10px" }} />
            <button className="primary" style={{ marginTop: "10px" }}>Add to Trusted & Register on Blockchain</button>
          </>
        )}
      </div>

      {selectedPart && (
        <div className="modal-overlay">
          <div className="modal-content-wide">
            {!showVendorForm ? (
              <>
                <h2>Material Specifications</h2>
                <h3>{selectedPart.name}</h3>
                <table>
                  <tbody>
                    {Object.entries(selectedPart.specs).map(([key, value]) => (
                      <tr key={key}>
                        <td><strong>{key}:</strong></td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="modal-actions">
                  <button onClick={() => setSelectedPart(null)} className="secondary">
                    Close
                  </button>
                  <button className="primary" onClick={() => setShowVendorForm(true)}>
                    Apply as Vendor
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Apply as Vendor for {selectedPart.name}</h2>
                <div className="blockchain-note">
                  <p>
                    <strong>⛓️ Blockchain Integration:</strong> Your application will be securely recorded on the blockchain, 
                    ensuring transparency and immutability.
                  </p>
                </div>
                
                <div className="vendor-form">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input 
                      type="text" 
                      name="companyName"
                      value={vendorForm.companyName}
                      onChange={handleVendorFormChange}
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      name="contactEmail"
                      value={vendorForm.contactEmail}
                      onChange={handleVendorFormChange}
                      placeholder="business@example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      value={vendorForm.phoneNumber}
                      onChange={handleVendorFormChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Supplier Capacity (units/month)</label>
                    <input 
                      type="number" 
                      name="supplierCapacity"
                      value={vendorForm.supplierCapacity}
                      onChange={handleVendorFormChange}
                      placeholder="1000"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Certifications</label>
                    <input 
                      type="text" 
                      name="certification"
                      value={vendorForm.certification}
                      onChange={handleVendorFormChange}
                      placeholder="ISO 9001, AS9100, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Average Delivery Time (days)</label>
                    <input 
                      type="number" 
                      name="deliveryTime"
                      value={vendorForm.deliveryTime}
                      onChange={handleVendorFormChange}
                      placeholder="14"
                    />
                  </div>
                </div>
                
                {txStatus && <div className="tx-status">{txStatus}</div>}
                
                <div className="blockchain-address">
                  {account ? (
                    <span>Connected Wallet: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                  ) : (
                    <span className="status-warning">No wallet connected. Please connect your Ethereum wallet.</span>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button onClick={() => setShowVendorForm(false)} className="secondary">
                    Back
                  </button>
                  <button 
                    className="primary" 
                    onClick={handleVendorSubmit}
                    disabled={!isBlockchainConnected}
                  >
                    {isBlockchainConnected ? "Submit to Blockchain" : "Connect Wallet First"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;