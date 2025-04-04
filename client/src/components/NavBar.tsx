
import { Link } from "wouter";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-semibold text-foreground">BiasBuster</span>
              </a>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/features">
                <a className="text-foreground/60 hover:text-foreground px-3 py-2 text-sm font-medium">Features</a>
              </Link>
              <Link href="/news-analysis">
                <a className="text-foreground/60 hover:text-foreground px-3 py-2 text-sm font-medium">News Analysis</a>
              </Link>
              <Link href="/testimonials">
                <a className="text-foreground/60 hover:text-foreground px-3 py-2 text-sm font-medium">Testimonials</a>
              </Link>
              <Link href="/pricing">
                <a className="text-foreground/60 hover:text-foreground px-3 py-2 text-sm font-medium">Pricing</a>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost">Log in</Button>
            <Button>Sign up</Button>
          </div>
        </div>
      </div>
    </nav>