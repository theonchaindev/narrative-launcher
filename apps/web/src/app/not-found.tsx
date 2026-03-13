import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-2xl font-bold text-text-primary mb-3">Narrative not found</h1>
      <p className="text-text-secondary mb-8">
        This narrative doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="h-10 px-6 rounded-lg bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-medium transition-colors inline-flex items-center"
      >
        Back to feed →
      </Link>
    </div>
  );
}
