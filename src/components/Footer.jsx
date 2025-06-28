import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="logo">Z</div>
          <h2>ZeroFraud vote</h2>
          <p>Secure, transparent voting for organizations in Cameroon and beyond.</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Platform</h4>
            <ul>
              <li><a href="#">Overview</a></li>
              <li><a href="#">Updates</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Legal</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contact</h4>
            <ul>
              <li><a href="#">armelduvalkenmoe@gmail.com</a></li>
              <li><a href="#">+237 653 673 311</a></li>
              <li><a href="#">Douala Cameroon</a></li>
             
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ZeroFraud vote. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
