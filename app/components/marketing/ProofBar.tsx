"use client";
import FadeInView from "./FadeInView";

const stats = [
  { value: "20+", label: "Years in Business" },
  { value: "2,000+", label: "Clients Connected" },
  { value: "99.99%", label: "Average Uptime" },
];

export default function ProofBar() {
  return (
    <section className="py-8 md:py-14 px-5 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeInView>
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl sm:text-3xl md:text-5xl font-black mb-0.5 md:mb-2"
                  style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
