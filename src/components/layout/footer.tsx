
export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container py-4 text-center text-sm text-muted-foreground">
        <p>
          Powered by
          <a href="https://www.desmos.com/api/v1.8/docs/index.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary px-1"> Desmos API</a>,
          <a href="https://pubchemdocs.ncbi.nlm.nih.gov/pug-rest" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary px-1"> PubChem PUG REST API</a>,
          <a href="https://dictionaryapi.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary px-1"> Free Dictionary API</a>, and
          <a href="https://en.wikipedia.org/api/rest_v1/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary px-1"> Wikipedia API</a>.
        </p>
        <p>© {new Date().getFullYear()} PCMBtools. All rights reserved.</p>
      </div>
    </footer>
  );
}
