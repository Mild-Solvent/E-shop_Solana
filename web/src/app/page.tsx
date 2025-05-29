export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      {/* Main Content */}
      <header className="flex flex-col items-center justify-center text-center mt-20">
        <h1 className="text-4xl font-bold sm:text-6xl">Welcome to SolZone</h1>
        <p className="mt-4 text-lg sm:text-2xl">
          The first crypto marketplace on Solana
        </p>
        <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium text-lg">
          Get Started
        </button>
        <p>Click &quot;Sign Up&quot; to get started!</p>
      </header>

      {/* Disclaimer Section */}
      <footer className="w-full text-center mt-auto mb-10 px-4">
        <p className="text-sm text-gray-300">
          Disclaimer: This platform is for informational purposes only and does
          not constitute financial advice. Always perform your own research
          before investing in any blockchain project.
        </p>
        <a href="#" className="block mt-2 text-blue-300 hover:underline">
          Terms and Conditions
        </a>
      </footer>

      {/* Cookie Consent */}
      <div className="fixed bottom-0 w-full bg-gray-800 text-gray-200 text-center py-4">
        <p className="text-sm">
          We use cookies to enhance your browsing experience and analyze our
          traffic. By clicking "Accept", you consent to our use of cookies.
        </p>
        <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white">
          Accept
        </button>
      </div>
    </div>
  );
}
