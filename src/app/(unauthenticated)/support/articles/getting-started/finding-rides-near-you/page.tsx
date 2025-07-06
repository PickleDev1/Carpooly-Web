'use client'

export default function FindingRidesNearYou() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">Finding Rides Near You</h1>
      <div className="prose prose-lg">
        <ol>
          <li><strong>Go to the Search Page:</strong> Log in and click on <b>Search Carpools</b> in the main menu.</li>
          <li><strong>Enter Your Location:</strong> Use the address field to enter your current location or desired pickup point.</li>
          <li><strong>Set Your Destination:</strong> Enter where you want to go.</li>
          <li><strong>Choose Date & Time:</strong> Select when you want to travel.</li>
          <li><strong>Apply Filters:</strong> Use filters for seats, car type, or preferences (e.g., non-smoking, music, etc.).</li>
          <li><strong>Browse Results:</strong> View available carpools that match your criteria. Click on a carpool to see more details.</li>
          <li><strong>Request to Join:</strong> Click <b>Request to Join</b> or <b>Book</b> on the carpool you want. The driver will be notified and can accept your request.</li>
        </ol>
        <h2>Tips</h2>
        <ul>
          <li>Set your location accurately for best results.</li>
          <li>Check driver ratings and reviews before joining.</li>
          <li>Message the driver if you have questions about the ride.</li>
        </ul>
      </div>
    </div>
  )
} 