"use client";
import { useCallback } from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const HighlightSection = () => {
  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      url: "https://www.facebook.com/noire.ph",
      ariaLabel: "Visit our Facebook page",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://www.instagram.com/noire.ph",
      ariaLabel: "Visit our Instagram page",
    },
    {
      name: "TikTok",
      icon: FaTiktok,
      url: "https://www.tiktok.com/@noire.ph",
      ariaLabel: "Visit our TikTok page",
    },
  ];

  const handleSocialClick = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, url: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSocialClick(url);
      }
    },
    [handleSocialClick]
  );

  return (
    <section
      className="w-full py-10 space-y-10 overflow-hidden bg-transparent"
      aria-label="Social media links"
    >
      <div className="flex w-full animate-infinite-scroll space-x-16 whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <ul
            key={i}
            className="flex items-center space-x-16 text-4xl text-gray-300"
            aria-hidden={i !== 0} // Only first set is accessible
          >
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <li key={`${i}-${social.name}`}>
                  <button
                    onClick={() => handleSocialClick(social.url)}
                    onKeyDown={(e) => handleKeyDown(e, social.url)}
                    className="flex items-center gap-4 cursor-pointer transition-all duration-300 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg p-2"
                    aria-label={social.ariaLabel}
                    tabIndex={i === 0 ? 0 : -1} // Only first set is tabbable
                  >
                    <IconComponent size={40} aria-hidden="true" />
                    <span className="font-medium">{social.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </section>
  );
};

export default HighlightSection;
