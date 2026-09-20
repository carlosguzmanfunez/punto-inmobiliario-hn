import { propertyTypes } from "@/lib/property-types";

export function CategoryGrid() {
  return (
    <section className="container section compact-section">
      <div className="category-grid">
        {propertyTypes.map(({ icon, label, type }) => (
          <a href={`/propiedades?tipo=${encodeURIComponent(type)}`} className="category-card" key={type}>
            <span className="category-icon" aria-hidden>{icon}</span>
            <strong>{label}</strong>
          </a>
        ))}
      </div>
    </section>
  );
}
