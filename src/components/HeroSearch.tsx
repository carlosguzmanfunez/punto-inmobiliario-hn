import { departments } from "@/lib/honduras";

export function HeroSearch() {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content container">
        <p className="eyebrow">Punto Inmobiliario HN</p>
        <h1>Encuentra tu próxima propiedad en Honduras</h1>
        <p className="hero-copy">Casas, apartamentos, terrenos, propiedades comerciales y oportunidades de inversión en todo el país.</p>

        <form action="/propiedades" className="search-card">
          <div className="operation-switch" role="group" aria-label="Tipo de operación">
            <label><input type="radio" name="operacion" value="venta" defaultChecked /> Comprar</label>
            <label><input type="radio" name="operacion" value="alquiler" /> Alquilar</label>
          </div>
          <div className="search-grid">
            <label>
              <span>¿Dónde buscas?</span>
              <select name="departamento" defaultValue="">
                <option value="">Toda Honduras</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label>
              <span>Tipo de propiedad</span>
              <select name="tipo" defaultValue="">
                <option value="">Todos los tipos</option>
                <option>Casa</option><option>Apartamento</option><option>Terreno</option><option>Local comercial</option><option>Oficina</option><option>Bodega</option><option>Finca</option>
              </select>
            </label>
            <label>
              <span>Precio máximo</span>
              <input type="number" name="precioMax" placeholder="Ej. 5000000" min="0" />
            </label>
            <button className="button button-primary" type="submit">Buscar propiedades</button>
          </div>
        </form>

        <div className="popular-links">
          <span>Popular:</span>
          {['Tegucigalpa','San Pedro Sula','La Ceiba','Roatán','Comayagua'].map((city) => <a key={city} href={`/propiedades?ciudad=${encodeURIComponent(city)}`}>{city}</a>)}
        </div>
      </div>
    </section>
  );
}
