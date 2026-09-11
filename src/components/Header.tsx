import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Punto Inmobiliario HN">
        <span className="brand-mark">P</span>
        <span>
          <strong>Punto Inmobiliario HN</strong>
          <small>Propiedades · Inversión · Honduras</small>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Navegación principal">
        <Link href="/propiedades?operacion=venta">Comprar</Link>
        <Link href="/propiedades?operacion=alquiler">Alquilar</Link>
        <Link href="/#proyectos">Proyectos</Link>
        <Link href="/propiedades">Propiedades</Link>
        <Link href="/#nosotros">Nosotros</Link>
        <Link href="/#contacto">Contacto</Link>
      </nav>
      <Link href="/#publicar" className="button button-dark">Publicar propiedad</Link>
    </header>
  );
}
