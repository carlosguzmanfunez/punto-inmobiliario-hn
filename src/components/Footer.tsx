export function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="container footer-grid">
        <div><strong className="footer-brand">Punto Inmobiliario HN</strong><p>Tu próximo hogar o inversión está más cerca de lo que imaginas.</p></div>
        <div><strong>Propiedades</strong><a href="/propiedades?operacion=venta">Comprar</a><a href="/propiedades?operacion=alquiler">Alquilar</a><a href="/#proyectos">Proyectos</a></div>
        <div><strong>Empresa</strong><a href="/#nosotros">Nosotros</a><a href="/#publicar">Vender propiedad</a><a href="/#contacto">Contacto</a></div>
        <div><strong>Honduras</strong><p>Cobertura en los 18 departamentos.</p></div>
      </div>
      <div className="container footer-bottom">© 2026 Punto Inmobiliario HN. Todos los derechos reservados.</div>
    </footer>
  );
}
