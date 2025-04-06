import React, { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";

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
                <h3>Parts Inventory</h3>
                <div className="kpi-value">1,254</div>
              </div>
            </div>
            
            {/* Charts section */}
            <div className="charts-grid">
              <div className="chart-container large">
                <h3>Vendor Performance Timeline</h3>
                <div className="chart-placeholder">
                  <div className="chart-description">
                    Shows on-time delivery rates and quality metrics over time
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Blockchain Contract Activity</h3>
                <div className="chart-placeholder">
                  <div className="chart-description">
                    Number of contracts registered on blockchain by month
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Inventory Levels</h3>
                <div className="chart-placeholder">
                  <div className="chart-description">
                    Current inventory levels by part category
                  </div>
                </div>
              </div>
              
              <div className="chart-container large">
                <h3>Price Trend Analysis</h3>
                <div className="chart-placeholder">
                  <div className="chart-description">
                    Historical pricing for key aerospace materials
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Lead Time Analysis</h3>
                <div className="chart-placeholder">
                  <div className="chart-description">
                    Average lead time by supplier and part category
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Supplier Distribution</h3>
                <div className="chart-placeholder">
                  <div className="chart-description">
                    Geographic distribution of aerospace suppliers
                  </div>
                </div>
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