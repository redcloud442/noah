import { ScrollArea } from "@/components/ui/scroll-area";

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-screen pt-24 sm:px-10 bg-zinc-950 text-white">
      <h1 className="text-2xl font-bold mb-4">About Us</h1>
      <ScrollArea className="w-full h-[700px] sm:h-full flex flex-col gap-8 text-base leading-relaxed">
        <section className="my-8">
          <h2 className="text-xl font-semibold mb-2">What is NOIR?</h2>
          <p>
            The word <strong>“NOIR”</strong> comes from the French language,
            meaning “black.” But in the world of fashion and culture, NOIR is
            more than just a color — it symbolizes{" "}
            <strong>elegance, mystery, power, and confidence</strong>.
          </p>
        </section>

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-2">
            👕 What is NOIR Clothing Philippines?
          </h2>
          <p>
            <strong>NOIR Clothing Philippines</strong> is a modern streetwear
            brand that combines premium quality with everyday style. It’s made
            for dreamers and doers — from hardworking individuals to successful
            entrepreneurs, influencers, and artists.
          </p>
          <p className="mt-2">
            Every piece — joggers, hoodies, shirts — is designed for{" "}
            <strong>comfort, class, and presence</strong>. It&apos;s a clothing
            brand worn by top content creators and TV celebrities, yet remains
            accessible to Filipinos who want to look clean, professional, and
            effortlessly sharp.
          </p>
        </section>

        <section className="my-4">
          <h2 className="text-xl font-semibold mb-2">
            🖤 What Does NOIR Mean?
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Literal:</strong> &quot;Black&quot;
            </li>
            <li>
              <strong>Symbolic:</strong> Class, confidence, mystery, power,
              style
            </li>
            <li>
              <strong>Cultural:</strong> Minimalist but bold. Quiet but
              impactful. Simple yet premium.
            </li>
          </ul>
        </section>

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-2">
            📜 What Are the Roots of NOIR?
          </h2>
          <p>
            NOIR was born from a simple idea:
            <em>
              “You don’t have to speak loudly to be noticed. Your style should
              speak for you.”
            </em>
          </p>
          <p className="mt-2">It was built for people who:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Want a powerful yet subtle presence</li>
            <li>Prefer clean, effortless fashion</li>
            <li>
              May come from humble beginnings but know they deserve premium
            </li>
          </ul>
          <p className="mt-2">
            <strong>NOIR Clothing Philippines</strong> is a brand:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Made for the streets, but built for success</li>
            <li>Trusted by celebrities and influencers</li>
            <li>Proudly Filipino, with a world-class aesthetic</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            ✅ NOIR isn’t just clothing. It’s a mindset.
          </h2>
          <p>
            If you want to stand out without being loud, if you want to look
            like a leader even on casual days, and if you’re ready to carry
            yourself to the next level —<strong>NOIR is the answer.</strong>
          </p>
        </section>

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-2">Mission Statement</h2>
          <p>
            To empower individuals to express confidence, class, and ambition
            through high-quality streetwear that blends comfort, culture, and
            modern style.
          </p>
          <p className="mt-2">
            We are committed to delivering premium yet accessible fashion
            designed for everyday leaders, creators, and dreamers who move with
            purpose.
          </p>
        </section>

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-2">🎯 Vision Statement</h2>
          <p>
            To become the leading Filipino streetwear brand recognized globally
            for its style, quality, and influence — worn by icons, trusted by
            communities, and driven by the bold spirit of self-made success.
          </p>
        </section>
      </ScrollArea>
    </div>
  );
};

export default AboutPage;
