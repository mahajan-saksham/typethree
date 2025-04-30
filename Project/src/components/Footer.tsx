import { Facebook, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-dark/95 backdrop-blur-lg border-t border-light/10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-black opacity-95" />
      
      {/* Subtle color gradients */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 85%, rgba(204, 255, 0, 0.08) 0%, rgba(0, 0, 0, 0) 45%), radial-gradient(circle at 85% 15%, rgba(0, 225, 255, 0.08) 0%, rgba(0, 0, 0, 0) 45%)",
        }}
      />
      
      {/* Diagonal pattern background */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 10px)",
          backgroundSize: "30px 30px"
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center group">
              <Logo />
            </Link>
            <p className="mt-4 text-light/60">
              Powering the future through sustainable solar energy solutions in Indore and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/terms-and-conditions" className="footer-link">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-light/60">6/3 South Harsiddhi</li>
              <li className="text-light/60">Indore, MP – 452002</li>
              <li className="text-light/60">hello@type3.energy</li>
              <li className="text-light/60">+91 7995657936</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="social-link">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="social-link">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="social-link">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-light/10 text-center text-light/60 -mx-4 sm:-mx-6 lg:-mx-8">
          <p>&copy; {new Date().getFullYear()} Type 3. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}