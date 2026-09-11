import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { properties } from "@/lib/mock-data";

const money = new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 });

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  if (!property) notFound();

  return (
    <><Header /><main className="detail-page container">
      <div className="detail-title"><div><p className="eyebrow dark">{property.type} · {property.code}</p><h1>{property.title}</h1><p>{property.city}, {property.department}</p></div><div className="detail-price">{property.currency === 'HNL' ? 'L' : '$'} {money.format(property.price)}{property.operation === 'RENT' ? ' / mes' : ''}</div></div>
      <div className="detail-gallery"><img src={property.image} alt={property.title} /><div className="gallery-secondary"><div /><div /></div></div>
      <div className="detail-layout"><article><div className="detail-facts">{property.bedrooms !== undefined && <span><strong>{property.bedrooms}</strong> habitaciones</span>}{property.bathrooms !== undefined && <span><strong>{property.bathrooms}</strong> baños</span>}{property.parking !== undefined && <span><strong>{property.parking}</strong> estacionamientos</span>}{property.constructionAreaM2 !== undefined && <span><strong>{property.constructionAreaM2}</strong> m² construcción</span>}{property.landAreaM2 !== undefined && <span><strong>{property.landAreaM2}</strong> m² terreno</span>}</div><h2>Descripción</h2><p className="detail-copy">{property.summary} Este prototipo separa correctamente operación, tipo de inmueble, ubicación y características para que la base pueda crecer sin rehacer la arquitectura.</p><h2>Ubicación</h2><div className="location-box">Ubicación aproximada: {property.city}, {property.department}<br/><small>La dirección exacta puede permanecer protegida hasta validar al interesado.</small></div></article><aside className="contact-card"><h3>¿Te interesa esta propiedad?</h3><p>Solicita información o agenda una visita con un asesor.</p><a href="https://wa.me/50400000000" className="button button-whatsapp">Contactar por WhatsApp</a><a href="mailto:contacto@puntoinmobiliario.hn" className="button button-primary">Solicitar información</a><button className="button button-outline">Agendar visita</button><small>Referencia: {property.code}</small></aside></div>
    </main><Footer /></>
  );
}
