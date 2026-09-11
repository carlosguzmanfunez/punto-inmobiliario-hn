import Link from "next/link";
import type { Property } from "@/lib/types";

const money = new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 });

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="property-card">
      <Link href={`/propiedades/${property.slug}`} className="property-image-wrap">
        <img className="property-image" src={property.image} alt={property.title} />
        {property.featuredLabel && <span className="badge">{property.featuredLabel}</span>}
        <span className="favorite" aria-label="Guardar propiedad">♡</span>
      </Link>
      <div className="property-body">
        <div className="property-price">{property.currency === "HNL" ? "L" : "$"} {money.format(property.price)}{property.operation === "RENT" ? " / mes" : ""}</div>
        <Link href={`/propiedades/${property.slug}`}><h3>{property.title}</h3></Link>
        <p className="muted">{property.city}, {property.department}</p>
        <div className="property-facts">
          {property.bedrooms !== undefined && <span>{property.bedrooms} hab.</span>}
          {property.bathrooms !== undefined && <span>{property.bathrooms} baños</span>}
          {property.parking !== undefined && <span>{property.parking} est.</span>}
          {property.constructionAreaM2 !== undefined && <span>{property.constructionAreaM2} m²</span>}
          {property.landAreaM2 !== undefined && <span>{property.landAreaM2} m² terreno</span>}
        </div>
        <small className="property-code">ID {property.code}</small>
      </div>
    </article>
  );
}
