import { Link } from "wouter";

const NavBar = () => {
  return (
    <nav className="bg-card shadow-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                NewsLens
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="border-primary text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Bias Analysis
              </Link>
              <Link href="/#how-it-works" className="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                How It Works
              </Link>
              <Link href="/#about" className="border-transparent text-muted-foreground hover:border-muted hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                About
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Sign In
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button type="button" className="bg-card inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
