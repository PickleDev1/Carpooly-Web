'use client'

export default function HowToCreateCarpool() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">How to Create a Carpool</h1>
      <div className="prose prose-lg">
        <ol>
          <li><strong>Go to the Dashboard:</strong> Log in to your CarPooly account and navigate to your dashboard.</li>
          <li><strong>Click "Create Carpool":</strong> Find and click the <b>Create Carpool</b> button, usually at the top or in the main navigation.</li>
          <li><strong>Enter Your Details:</strong>
            <ul>
              <li><b>Start Location:</b> Enter your pickup address (use the address autocomplete for accuracy).</li>
              <li><b>Destination:</b> Enter your drop-off address.</li>
              <li><b>Date & Time:</b> Select when you want the carpool to start.</li>
              <li><b>Seats Needed:</b> Specify how many seats you're offering or need.</li>
              <li><b>Additional Info:</b> Add notes for riders (e.g., music preference, luggage space, etc.).</li>
            </ul>
          </li>
          <li><strong>Review & Confirm:</strong> Double-check your details, then click <b>Publish</b> or <b>Confirm</b>.</li>
          <li><strong>Share or Wait for Riders:</strong> Your carpool is now live! Share the link or wait for others to join.</li>
        </ol>
        <h2>Tips for a Great Carpool</h2>
        <ul>
          <li>Be clear about pickup points and timing.</li>
          <li>Set expectations for communication and punctuality.</li>
          <li>Use the in-app chat to coordinate with riders.</li>
        </ul>
      </div>
    </div>
  )
} 