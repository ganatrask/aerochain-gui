import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container">
      <div className="left-panel">
        <h1>Welcome to Our Procurement Platform</h1>
      </div>

      <div className="right-panel">
        <div className="card">
          <div className="tabs">
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
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <div className="forgot">Forgot password?</div>
              <button className="primary">Login</button>
              <button className="secondary">Continue with Google</button>
            </>
          ) : (
            <>
              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email" />
              <input type="tel" placeholder="Phone Number" />
              <input type="password" placeholder="Password" />
              <button className="primary">Register</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
