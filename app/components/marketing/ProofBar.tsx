"use client";
import FadeInView from "./FadeInView";

const stats = [
  { value: "20+", label: "Years in Business" },
  { value: "2,000+", label: "Clients Connected" },
  { value: "99.99%", label: "Average Uptime" },
];

export default function ProofBar() {
  return (
    <section className="py-10 md:py-14 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeInView>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-4xl md:text-5xl font-black mb-1 md:mb-2"
                  style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
