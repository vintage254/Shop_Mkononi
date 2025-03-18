export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-200 dark:bg-gray-700" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
} 