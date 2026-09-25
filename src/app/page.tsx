import { Header } from '@/components/Header';
import { HeroSearch } from '@/components/HeroSearch';
import { CategoryGrid } from '@/components/CategoryGrid';
import { PropertyCard } from '@/components/PropertyCard';
import { DepartmentExplorer } from '@/components/DepartmentExplorer';
import { Footer } from '@/components/Footer';
import { properties } from '@/lib/mock-data';
import { homeBenefits, homeProjects } from '@/lib/home-content';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSearch />
        <CategoryGrid />

        <section className='container section' id='propiedades-destacadas' aria-labelledby='propiedades-destacadas-titulo'>
          <div className='section-heading'>
            <div><p className='eyebrow dark'>Selección del equipo</p><h2 id='propiedades-destacadas-titulo'>Propiedades destacadas</h2><p>Oportunidades para vivir, invertir o hacer crecer tu negocio.</p></div>
            <a href='/propiedades' className='text-link'>Ver todas →</a>
          </div>
          <div className='property-grid'>
            {properties.map((property) => <PropertyCard property={property} key={property.id} />)}
          </div>
        </section>

        <DepartmentExplorer />

        <section className='container section' id='proyectos' aria-labelledby='proyectos-titulo'>
          <div className='section-heading'><div><p className='eyebrow dark'>Desarrollos</p><h2 id='proyectos-titulo'>Nuevos proyectos</h2></div></div>
          <div className='project-grid'>
            {homeProjects.map((project, i) => (
              <article className='project-card' key={project.name}><div className={`project-photo p${i + 1}`} /><div><strong>{project.name}</strong><p>{project.location}</p><span>{project.price}</span></div></article>
            ))}
            <article className='seller-cta' id='publicar'><span className='seller-icon'>⌂</span><h3>¿Quieres vender tu propiedad?</h3><p>Te ayudamos a encontrar al comprador adecuado.</p><a className='button button-dark' href='mailto:contacto@puntoinmobiliario.hn'>Publicar mi propiedad</a></article>
          </div>
        </section>

        <section className='trust-strip container' id='nosotros' aria-labelledby='nosotros-titulo'>
          <h2 id='nosotros-titulo' style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Beneficios</h2>
          {homeBenefits.map((benefit) => <div key={benefit.title}><strong>{benefit.title}</strong><span>{benefit.copy}</span></div>)}
        </section>
      </main>
      <Footer />
    </>
  );
}
