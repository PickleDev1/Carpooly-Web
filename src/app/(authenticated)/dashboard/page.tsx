export default function Dashboard() {
  const menuItems = [
    {
      title: "Create Carpool",
      description: "Start a new carpool group for your children",
      href: "/create-carpool",
      icon: "🚗"
    },
    {
      title: "Invite Friends",
      description: "Grow your carpool network",
      href: "/invite",
      icon: "👥"
    },
    {
      title: "Schedule Updates",
      description: "Manage your carpool schedule",
      href: "/schedule",
      icon: "📅"
    },
    {
      title: "Join Carpool",
      description: "Find and join existing carpools",
      href: "/join",
      icon: "🤝"
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
} 