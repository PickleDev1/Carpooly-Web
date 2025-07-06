'use client'

export default function SettingUpProfile() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">Setting Up Your Profile</h1>
      <div className="prose prose-lg">
        <ol>
          <li><strong>Access Profile Settings:</strong> Log in and click on your profile icon or name in the top navigation.</li>
          <li><strong>Edit Your Details:</strong> Update your name, photo, and contact information.</li>
          <li><strong>Verify Your Identity:</strong> Complete any required verification steps (email, phone, or ID verification).</li>
          <li><strong>Add Preferences:</strong> Set your carpooling preferences (music, pets, smoking, etc.).</li>
          <li><strong>Save Changes:</strong> Click <b>Save</b> or <b>Update</b> to apply your changes.</li>
        </ol>
        <h2>Why a Complete Profile Matters</h2>
        <ul>
          <li>Builds trust with other users.</li>
          <li>Improves your chances of finding or filling a carpool.</li>
          <li>Enables better matching based on preferences.</li>
        </ul>
      </div>
    </div>
  )
} 