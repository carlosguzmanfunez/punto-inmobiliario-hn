import { departments } from "@/lib/honduras";
import { InteractiveHondurasMap } from "@/components/InteractiveHondurasMap";

export function DepartmentExplorer() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div><p className="eyebrow dark">Cobertura nacional</p><h2>Explora los 18 departamentos de Honduras</h2></div>
      </div>
      <div className="department-layout">
        <div className="results-map">
          <InteractiveHondurasMap />
          <strong>Mapa interactivo</strong>
          <p>Selecciona un departamento para ver sus propiedades.</p>
        </div>
        <div className="department-grid">
          {departments.map((department) => (
            <a key={department} href={`/propiedades?departamento=${encodeURIComponent(department)}`}>{department}<span>→</span></a>
          ))}
        </div>
        <a href="/propiedades?departamento=Islas%20de%20la%20Bahía" className="roatan-card">
          <span className="eyebrow">Caribe hondureño</span>
          <strong>Propiedades en Roatán</strong>
          <span>Explorar oportunidades →</span>
        </a>
      </div>
    </section>
  );
}
