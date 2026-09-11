import { Header } from "@/components/Header";
import { HeroSearch } from "@/components/HeroSearch";
import { CategoryGrid } from "@/components/CategoryGrid";
import { PropertyCard } from "@/components/PropertyCard";
import { DepartmentExplorer } from "@/components/DepartmentExplorer";
import { Footer } from "@/components/Footer";
import { properties } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSearch />
        <CategoryGrid />

        <section className="container section">
          <div className="section-heading">
            <div><p className="eyebrow dark">Selección del equipo</p><h2>Propiedades destacadas</h2><p>Oportunidades para vivir, invertir o hacer crecer tu negocio.</p></div>
            <a href="/propiedades" className="text-link">Ver todas →</a>
          </div>
          <div className="property-grid">
            {properties.map((property) => <PropertyCard property={property} key={property.id} />)}
          </div>
        </section>

        <DepartmentExplorer />

        <section className="container section" id="proyectos">
          <div className="section-heading"><div><p className="eyebrow dark">Desarrollos</p><h2>Nuevos proyectos</h2></div></div>
          <div className="project-grid">
            {[['Residencial Vista Verde','Tegucigalpa, Francisco Morazán','Casas desde L 3,950,000'],['Torre Nova','San Pedro Sula, Cortés','Apartamentos desde L 2,800,000'],['Las Palmas Beach Residences','Roatán, Islas de la Bahía','Villas desde L 12,500,000']].map(([name,location,price], i) => (
              <article className="project-card" key={name}><div className={`project-photo p${i+1}`} /><div><strong>{name}</strong><p>{location}</p><span>{price}</span></div></article>
            ))}
            <article className="seller-cta" id="publicar"><span className="seller-icon">⌂</span><h3>¿Quieres vender tu propiedad?</h3><p>Te ayudamos a encontrar al comprador adecuado.</p><a className="button button-dark" href="mailto:contacto@puntoinmobiliario.hn">Publicar mi propiedad</a></article>
          </div>
        </section>

        <section className="trust-strip container" id="nosotros">
          {[['Asesoría personalizada','Te acompañamos durante todo el proceso.'],['Propiedades verificadas','Información confiable y segura.'],['Cobertura nacional','Presencia en los 18 departamentos.'],['Expertos inmobiliarios','Compra, vende e invierte con criterio.']].map(([title,copy]) => <div key={title}><strong>{title}</strong><span>{copy}</span></div>)}
        </section>
      </main>
      <Footer />
    </>
  );
}
