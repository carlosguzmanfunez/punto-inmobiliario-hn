const categories = [
  { icon: "⌂", label: "Casas", type: "Casa" },
  { icon: "▦", label: "Apartamentos", type: "Apartamento" },
  { icon: "⌖", label: "Terrenos", type: "Terreno" },
  { icon: "▣", label: "Locales comerciales", type: "Local comercial" },
  { icon: "▤", label: "Oficinas", type: "Oficina" },
  { icon: "▥", label: "Bodegas", type: "Bodega" },
  { icon: "≈", label: "Propiedades de playa", type: "Propiedad de playa" },
  { icon: "♧", label: "Fincas", type: "Finca" },
  { icon: "↗", label: "Inversión", type: "Propiedad de inversión" },
  { icon: "▧", label: "Proyectos", type: "Proyecto" },
] as const;

export function CategoryGrid() {
  return (
    <section className="container section compact-section">
      <div className="category-grid">
        {categories.map(({ icon, label, type }) => (
          <a href={`/propiedades?tipo=${encodeURIComponent(type)}`} className="category-card" key={type}>
            <span className="category-icon" aria-hidden>{icon}</span>
            <strong>{label}</strong>
          </a>
        ))}
      </div>
    </section>
  );
}
