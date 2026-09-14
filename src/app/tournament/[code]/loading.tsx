export default function TournamentLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-64 rounded bg-muted" />
      <div className="h-24 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 rounded-lg bg-muted" />
        <div className="h-32 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
