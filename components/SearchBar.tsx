export default function SearchBar() {
    return (
      <section className="flex justify-center -mt-8">
        <div className="flex gap-3 rounded-xl bg-white p-4 shadow-lg">
          <input
            type="text"
            placeholder="Search by city..."
            className="w-80 rounded-lg border px-4 py-3"
          />
  
          <button className="rounded-lg bg-blue-600 px-6 py-3 text-white">
            Search
          </button>
        </div>
      </section>
    );
  }