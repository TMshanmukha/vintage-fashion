import { Link } from "react-router-dom";

const team = [
  { name: "Marcus Reed", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
  { name: "Sophia Lane", role: "Creative Director", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face" },
  { name: "James Kato", role: "Head of Buying", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face" },
  { name: "Aria Patel", role: "Brand Strategist", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face" },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-100 py-24 text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=400&fit=crop" alt="" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">About Us</h1>
          <nav className="text-xs text-gray-500">
            <Link to="/" className="hover:text-pink-500">Home</Link>
            <span className="mx-2">/</span>
            <span>About</span>
          </nav>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-3">Our Story</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
              Fashion That Fits Your Lifestyle
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              At Vintage, we believe clothing is more than just what you wear—it's a reflection of your confidence, personality, and everyday journey. Our mission is to bring together modern style, exceptional quality, and affordable prices so everyone can dress with confidence.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Every piece in our collection is carefully selected for its comfort, durability, and timeless appeal. We partner with trusted manufacturers who share our commitment to craftsmanship and quality, ensuring you receive premium fashion without unnecessary markups.
            </p>
            <Link to="/shop" className="inline-block border border-gray-900 text-gray-900 text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-gray-900 hover:text-white transition-all">
              Shop Collection
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://plus.unsplash.com/premium_photo-1725075088969-73798c9b422c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVuJTIwY2xvdGglMjBjb2xsZWN0aW9uJTIwcGhvdG9zfGVufDB8fDB8fHww" alt="" className="w-full h-64 object-cover" />
            <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=500&fit=crop" alt="" className="w-full h-64 object-cover mt-8" />
          </div>
        </div>
      </section>

      {/* Stats */}
      {/* <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[["10K+", "Happy Customers"], ["500+", "Products"], ["15+", "Countries"], ["8", "Years of Trust"]].map(([num, label]) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">{num}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Meet the Team</h2>
          <div className="w-10 h-0.5 bg-gray-900 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="overflow-hidden mb-4 aspect-square">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
              <p className="text-xs text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
}
