// SharedFooter.tsx - Cross-linking footer for Holstjensen Tools Network
// Copy this file to src/components/ in each Next.js project

export default function SharedFooter() {
  const tools = [
    { href: "https://gratisfaktura.dk", emoji: "📄", name: "Faktura Generator" },
    { href: "https://kodeord.dk", emoji: "🔐", name: "Kodeord Generator" },
    { href: "https://countdowntimer.dk", emoji: "⏰", name: "Countdown Timer" },
    { href: "https://loenberegner.dk", emoji: "💰", name: "Lønberegner" },
    { href: "https://minberegner.dk", emoji: "🧮", name: "Alle Beregnere" },
    { href: "https://ai-tools.dk", emoji: "🤖", name: "AI Værktøjer" },
    { href: "https://whitenoise.dk", emoji: "🔊", name: "White Noise" },
    { href: "https://rejsermedborn.dk", emoji: "✈️", name: "Rejser m. Børn" },
    { href: "https://notiondk.dk", emoji: "📋", name: "Notion Templates" },
    { href: "https://valuta.holstjensen.eu", emoji: "💱", name: "Valuta Omregner" },
    { href: "https://enheder.holstjensen.eu", emoji: "📏", name: "Enheder Omregner" },
    { href: "https://timer.holstjensen.eu", emoji: "⏱️", name: "Timer/Stopur" },
    { href: "https://citater.holstjensen.eu", emoji: "💬", name: "Citater" },
    { href: "https://noter.holstjensen.eu", emoji: "📝", name: "Noter App" },
    { href: "https://farver.holstjensen.eu", emoji: "🎨", name: "Farve Palette" },
    { href: "https://lorem.holstjensen.eu", emoji: "📜", name: "Lorem Ipsum" },
    { href: "https://synonymer.holstjensen.eu", emoji: "📚", name: "Synonymer" },
    { href: "https://sundhedsberegner.holstjensen.eu", emoji: "🏥", name: "Sundhedsberegner" },
    { href: "https://qr.holstjensen.eu", emoji: "📱", name: "QR Generator" },
  ];

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tools grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🛠️ Andre gratis værktøjer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="hover:bg-white p-2 rounded-lg transition text-sm text-gray-600 hover:text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tool.emoji} {tool.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            &copy; 2025{" "}
            <a href="https://mahope.dk" className="hover:text-blue-600">
              Mahope.dk
            </a>{" "}
            - Gratis online værktøjer
          </p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a
              href="https://privacy.holstjensen.eu"
              className="hover:text-blue-600"
            >
              Privatlivspolitik
            </a>
            <a href="mailto:kontakt@mahope.dk" className="hover:text-blue-600">
              Kontakt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
