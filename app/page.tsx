export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600">Findly</h1>

        <p className="mt-4 text-xl text-gray-600">
          Find your next home with confidence.
        </p>

        <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </main>
  );
}
