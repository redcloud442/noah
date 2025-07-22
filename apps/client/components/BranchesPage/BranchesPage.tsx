"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ExternalLink, MapPin } from "lucide-react";

const branches = [
  {
    name: "Noir Pasig 1",
    address:
      "Unit 8 Blk2 Lot 8, Riverside Drive, Sta. Lucia, Pasig City, Metro Manila",
    mapLink:
      "https://www.google.com/maps/search/Unit+8+Blk2+Lot+8,+Riverside+Drive,+Sta.+Lucia,+Pasig+City,+Metro+Manila/@14.5855181,121.0969537,16z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDYxNS4wIKXMDSoASAFQAw%3D%3D",
    status: "Open",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=200&fit=crop&crop=center",
  },
  {
    name: "Noir Pasig 2",
    address: "Unit 4 , 15 industria, kapasigan , pasig city",
    mapLink:
      "https://www.google.com/maps/place/15+Industria,+Pasig+City,+1600+Metro+Manila/@14.5618196,121.0714825,17z/data=!4m6!3m5!1s0x3397c8795c0ef3d9:0x5fd9d391d7e1cf82!8m2!3d14.5618196!4d121.0740574!16s%2Fg%2F11vyrhqnsd?entry=ttu&g_ep=EgoyMDI1MDYxNS4wIKXMDSoASAFQAw%3D%3D",
    status: "Open",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=200&fit=crop&crop=center",
  },
  {
    name: "Noir Valenzuela",
    address: "4009 Gen T De L Bantigue, Valenzuela, Philippines",
    mapLink:
      "https://www.google.com/maps/search/4009+Gen+T+De+L+Bantigue,+Valenzuela,+Philippines/@14.5618051,120.9893614,12z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDYxNS4wIKXMDSoASAFQAw%3D%3D",
    status: "Open",
    image:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=200&fit=crop&crop=center",
  },
  {
    name: "Noir Isabela",
    address:
      "Ala Moana Build, Maharlika Highway, Brgy. Villasis, Santiago City, Isabela",
    mapLink:
      "https://www.google.com/maps/search/Ala+Moana+Build+,+maharlika+highway+,+brgy.+villasis+,+santiago+city,+isabela/@16.6913731,121.5517686,17z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDYxNS4wIKXMDSoASAFQAw%3D%3D",
    status: "Open",
    image: "/assets/branches/PASIG_BRANCH.png",
  },
];

const BranchesPage = () => {
  return (
    <section className="min-h-[80vh] text-white py-20 px-4 sm:px-8 md:px-16 lg:px-24 relative overflow-hidden bg-zinc-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-700/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-600/5 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-4">
            Our Branches
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-zinc-600 to-zinc-800 mx-auto rounded-full mb-6"></div>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Visit any of our premium locations for an exceptional in-store
            experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {branches.map((branch, index) => (
            <Card
              key={index}
              className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 shadow-2xl hover:shadow-zinc-700/20 transition-all duration-500 hover:scale-[1.02] hover:bg-zinc-900/70 rounded-2xl overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 z-20">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    branch.status === "Open"
                      ? "bg-zinc-800/80 text-zinc-300 border border-zinc-700"
                      : "bg-zinc-800/80 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {branch.status}
                </span>
              </div>

              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${branch.image})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"></div>

                {/* Overlay Content */}
                <div className="absolute bottom-4 left-4 right-4">
                  <CardTitle className="text-xl font-bold text-white mb-1">
                    {branch.name}
                  </CardTitle>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3 group/item">
                  <div className="bg-zinc-800 text-zinc-400 p-2 rounded-lg shrink-0 group-hover/item:bg-zinc-700 transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {branch.address}
                    </p>
                  </div>
                </div>

                {branch.status === "Open" && (
                  <a
                    href={branch.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-zinc-700/25 group/link border border-zinc-700 hover:border-zinc-600"
                  >
                    <span>View on Maps</span>
                    <ExternalLink
                      size={14}
                      className="group-hover/link:translate-x-0.5 transition-transform"
                    />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></div>
            <p className="text-zinc-400 text-sm font-medium">
              More premium locations opening soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BranchesPage;
