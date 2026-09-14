export function Footer() {
  return (
    <footer className="border-t border-border py-6">
      <div className="container-app flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>eFootball Hub — organize and follow tournaments.</p>
        <p>&copy; {new Date().getFullYear()} eFootball Hub</p>
      </div>
    </footer>
  );
}
