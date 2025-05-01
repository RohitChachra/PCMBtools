export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container py-4 text-center text-sm text-muted-foreground">
        <p>
          Powered by <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">React</a>,
          <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary"> Tailwind CSS</a>,
          <a href="https://www.desmos.com/api/v1.8/docs/index.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary"> Desmos API</a>, and
          <a href="https://pubchemdocs.ncbi.nlm.nih.gov/pug-rest" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary"> PubChem PUG REST API</a>.
        </p>
        <p>© {new Date().getFullYear()} SciVerse. All rights reserved.</p>
      </div>
    </footer>
  );
}
