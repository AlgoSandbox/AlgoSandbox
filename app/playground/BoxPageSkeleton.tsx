export default function BoxPageSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-4">
      {/* Nav bar placeholder */}
      <div className="h-8 bg-gray-200 rounded" />

      {/* Main content placeholder */}
      <div className="h-64 bg-gray-200 rounded" />

      {/* Footer controls placeholder (mobile, for example) */}
      <div className="h-12 bg-gray-200 rounded" />
    </div>
  );
}
