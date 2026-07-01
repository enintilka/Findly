import PropertyCard from "./PropertyCard";

export default function PropertyGrid() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-16">
      <h2 className="mb-8 text-3xl font-bold">
        Featured Properties
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
      </div>
    </section>
  );
}