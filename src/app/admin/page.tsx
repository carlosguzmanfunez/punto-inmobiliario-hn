import { properties } from "@/lib/mock-data";
import styles from "./admin.module.css";

export default function AdminPage() {
  const totalProperties = properties.length;
  const totalSale = properties.filter((property) => property.operation === "SALE").length;
  const totalRent = properties.filter((property) => property.operation === "RENT").length;
  const totalValue = properties.reduce((sum, property) => sum + property.price, 0);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Panel administrativo</h1>
        <p>Vista interna de solo lectura para uso de prueba.</p>
      </header>

      <section className={styles.metrics}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total de propiedades</span>
          <span className={styles.metricValue}>{totalProperties}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>En venta</span>
          <span className={styles.metricValue}>{totalSale}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>En alquiler</span>
          <span className={styles.metricValue}>{totalRent}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Valor total publicado</span>
          <span className={styles.metricValue}>L {totalValue.toLocaleString("es-HN")}</span>
        </div>
      </section>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Propiedad</th>
            <th scope="col">Operación</th>
            <th scope="col">Precio</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id}>
              <td>{property.code}</td>
              <td>{property.title}</td>
              <td>{property.operation === "SALE" ? "Venta" : "Alquiler"}</td>
              <td>L {property.price.toLocaleString("es-HN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
