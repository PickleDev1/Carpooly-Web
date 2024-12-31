interface Carpool {
  carpool_name: string;
  recurring_option: string;
  available_seats: number;
  destination_address: string;
  seats: number;
}

export function CarpoolTable({ carpools }: { carpools: Carpool[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recurring
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available Seats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {carpools.map((carpool, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{carpool.carpool_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{carpool.recurring_option}</td>
              <td className="px-6 py-4 whitespace-nowrap">{carpool.available_seats}</td>
              <td className="px-6 py-4 whitespace-nowrap">{carpool.destination_address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 