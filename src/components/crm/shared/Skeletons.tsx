'use client';

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-4">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
              </th>
              <th className="px-6 py-4">
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </th>
              <th className="px-6 py-4">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </th>
              <th className="px-6 py-4">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </th>
              <th className="px-6 py-4">
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
              </th>
              <th className="px-6 py-4">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
          <div className="h-20 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80">
          <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
              <div className="h-6 w-8 bg-gray-300 rounded-full"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <CardSkeleton key={j} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="h-64 w-full bg-gray-100 rounded-lg flex items-end justify-around p-4 gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-t w-full"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-32 bg-gray-200 rounded"></div>
    </div>
  );
}
