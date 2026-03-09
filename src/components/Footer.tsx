export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-auto bg-card/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} RZD Music · Juninho Rezende
          </p>

          <div className="flex items-center gap-5 text-xs">
            {[
              { label: "Facebook", href: "https://www.facebook.com/juninhorezende" },
              { label: "Instagram", href: "https://www.instagram.com/juninhorezende" },
              { label: "YouTube", href: "https://www.youtube.com/@juninhorezende" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-smooth font-medium"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};