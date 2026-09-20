import { departments, departmentMapPaths, departmentViewBox } from "@/lib/honduras";

export function DepartmentExplorer() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div><p className="eyebrow dark">Cobertura nacional</p><h2>Explora los 18 departamentos de Honduras</h2></div>
      </div>
      <div className="department-layout">
        <div className="results-map" aria-label="Mapa de departamentos de Honduras">
          <svg viewBox={departmentViewBox} role="img" aria-label="Mapa de departamentos de Honduras" className="honduras-map" style={{ width: "100%", height: "auto" }}>
            {departments.map((departmentName) => (
              <a
                key={departmentName}
                href={`/propiedades?departamento=${encodeURIComponent(departmentName)}`}
                title={`Ver propiedades en ${departmentName}`}
                aria-label={`Ver propiedades en ${departmentName}`}
                style={{ cursor: "pointer" }}
              >
                <title>{departmentName}</title>
                <path
                  d={departmentMapPaths[departmentName]}
                  fill="#f4efe6"
                  stroke="#8a7b6a"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </a>
            ))}
          </svg>
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
