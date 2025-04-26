"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, MapPin, Phone } from "lucide-react";

const branches = [
  {
    name: "SM Mall of Asia",
    address: "Ground Floor, SM Mall of Asia, Pasay City",
    contact: "0917 123 4567",
    hours: "10:00 AM – 9:00 PM",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=SM+Mall+of+Asia,+Pasay+City",
  },
  {
    name: "Greenbelt 5",
    address: "Level 2, Greenbelt 5, Makati City",
    contact: "0917 765 4321",
    hours: "11:00 AM – 8:00 PM",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=Greenbelt+5,+Makati+City",
  },
];

export const BranchesPage = () => {
  return (
    <section className=" text-white py-20 px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold relative inline-block after:block after:h-[2px] after:bg-white after:mt-2 after:w-16 after:mx-auto">
          Our Branches
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Visit any of our physical stores
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
        {branches.map((branch, index) => (
          <Card
            key={index}
            className="bg-zinc-900 text-white border border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-xl"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {branch.name}
              </CardTitle>
              <CardDescription className="flex items-start gap-2 text-sm text-zinc-400">
                <MapPin size={16} className="mt-1" />
                {branch.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <div className="bg-red-500/10 text-red-500 p-1.5 rounded-full">
                  <Phone size={16} />
                </div>
                {branch.contact}
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <div className="bg-zinc-500/10 text-zinc-400 p-1.5 rounded-full">
                  <Clock size={16} />
                </div>
                {branch.hours}
              </div>
              <a
                href={branch.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-blue-400 hover:underline"
              >
                View on Google Maps
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm">More branches coming soon.</p>
      </div>
    </section>
  );
};
