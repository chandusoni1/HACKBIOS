export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 shadow-sm bg-white">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Ashoka Emblem */}
        <img
          src="/national.jpg"
          alt="Ashoka Emblem"
          className="w-40 h-auto object-contain"
        />

        <div>
          <h1 className="text-xl font-semibold">Government of India</h1>
          <h2 className="text-2xl font-bold leading-6">
            Defence Research and Development<br />Organisation
          </h2>
        </div>
      </div>

      <div>
        <img
          src="/drdo logo.jpg"
          alt="DRDO Logo"
          className="w-24 h-auto object-contain rounded-full"
        />
      </div>

    </header>
  );
}
