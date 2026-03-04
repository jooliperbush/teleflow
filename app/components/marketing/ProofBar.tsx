"use client";
import FadeInView from "./FadeInView";

const stats = [
  { prefix: "20", suffix: "+", label: "Years in Business" },
  { prefix: "2,000", suffix: "+", label: "Clients Connected" },
  { prefix: "99.99", suffix: "%", label: "Average Uptime" },
];

const gradientStyle = {
  backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
}

export default function ProofBar() {
  return (
    <section className="py-8 md:py-14 px-5 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeInView>
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl sm:text-3xl md:text-5xl font-black mb-0.5 md:mb-2 inline-flex items-baseline gap-0">
                  <span style={{ ...gradientStyle, fontFamily: "\'Visby CF\', \'Poppins\', sans-serif" }}>
                    {stat.prefix}
                  </span>
                  <span style={{ ...gradientStyle, fontFamily: "\'Manrope\', \'Poppins\', sans-serif" }}>
                    {stat.suffix}
                  </span>
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
