import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"} transition-colors`;

const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
          Accessibly
        </Link>
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <NavLink to="/" end className={navLinkCls}>
            Home
          </NavLink>
          <NavLink to="/features" className={navLinkCls}>
            Features
          </NavLink>
          <NavLink to="/wcag-guide" className={navLinkCls}>
            WCAG Guide
          </NavLink>
          <NavLink to="/about" className={navLinkCls}>
            About
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#app-panel">
            <Button variant="hero" size="lg" className="btn-hero">Start Checking</Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
