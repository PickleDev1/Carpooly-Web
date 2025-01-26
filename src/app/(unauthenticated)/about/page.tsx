'use client'

export default function AboutPage() {
  return (
    <div className="px-4 py-8 w-full max-w-[100vw] overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-green-50 rounded-lg px-4 py-2 mb-6 inline-block">
          <p className="text-green-800 font-medium text-sm md:text-base">
            Our Story
          </p>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
          From Problem to Solution
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Like many high school students, Nikhil Cidambi witnessed firsthand the daily juggling act his parents performed. Between demanding careers and managing the busy schedules of active children, coordinating school drop-offs and pickups for various activities became an increasingly complex puzzle.
          </p>

          <p className="text-gray-600 mb-6">
            What caught Nikhil&apos;s attention was a pattern: many families in his neighborhood were making similar trips, often to the same destinations, but at slightly different times. He saw an opportunity to help not just his family, but his entire community.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">A California Climate Crisis</h2>
          
          <p className="text-gray-600 mb-6">
            Growing up in California, Nikhil experienced firsthand the devastating effects of climate change. From increasingly severe wildfires that forced school closures to drought conditions affecting local communities, the reality of environmental challenges became impossible to ignore.
          </p>

          <div className="bg-amber-50 rounded-lg p-6 my-8">
            <h3 className="text-xl font-semibold mb-4">Environmental Impact</h3>
            <p className="text-gray-700 mb-4">
              A typical school run can generate up to 800g of CO₂ per trip. With thousands of parents making individual trips twice daily, the environmental impact adds up significantly.
            </p>
            <p className="text-gray-700">
              Through carpooling, we can reduce these emissions by up to 75% while building stronger community bonds.
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">The Birth of CarPooly</h2>
          
          <p className="text-gray-600 mb-6">
            In 2023, during his junior year at high school, Nikhil began developing CarPooly. His vision was simple yet powerful: create a platform that would help parents coordinate their carpools efficiently, saving time, reducing stress, and building stronger community connections - all while making a meaningful impact on carbon emissions.
          </p>

          <div className="bg-green-50 rounded-lg p-6 my-8">
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-700">
              To simplify the daily transportation challenges faced by busy families through community-driven carpooling solutions, while promoting environmental sustainability and stronger neighborhood connections.
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Environmental Impact</h2>
          
          <p className="text-gray-600 mb-6">
            Every carpool arranged through our platform represents more than just convenience - it&apos;s a small but significant step toward reducing our community&apos;s carbon footprint. By combining trips that would otherwise be made individually, we&apos;re helping to reduce traffic congestion and lower emissions.
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-lg mb-2">Reduced Emissions</h4>
              <p className="text-gray-600">Each shared ride can save up to 2.5kg of CO₂ emissions</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-lg mb-2">Less Traffic</h4>
              <p className="text-gray-600">Fewer cars on the road means reduced congestion</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-lg mb-2">Community Impact</h4>
              <p className="text-gray-600">Building sustainable habits for future generations</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Looking Forward</h2>
          
          <p className="text-gray-600 mb-6">
            Today, CarPooly continues to grow, helping more families streamline their daily routines while reducing their environmental impact. What started as a solution to a personal problem has evolved into a platform that brings communities together and contributes to a more sustainable future, one carpool at a time.
          </p>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 italic">
              &quot;Sometimes the biggest environmental changes start with the smallest community actions. Every shared ride counts.&quot;
              <br />
              - Nikhil Cidambi, Founder of CarPooly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 