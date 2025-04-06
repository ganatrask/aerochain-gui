// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import React, { useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedPart, setSelectedPart] = useState(null);

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
  

  const handleLogin = () => {
    if (form.email && form.password) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter both email and password.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-left">
          <h1>Welcome to Our Procurement Platform</h1>
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
        <h2>Dashboard</h2>
        <ul>
          <li>👥 Buyers</li>
          <li>📦 Orders</li>
          <li>🏭 Vendors</li>
        </ul>
      </div>

      <div className="main-content">
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
      </div>

      {selectedPart && (
        <div className="modal-overlay">
          <div className="modal-content-wide">
            <h2>Material Specifications</h2>
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
              <button className="primary">Apply as Vendor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
