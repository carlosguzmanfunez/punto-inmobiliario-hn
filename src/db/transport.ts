/**
 * Selección explícita del transporte de base de datos (PILOT-01R.2).
 *
 * La aplicación habla con PostgreSQL de dos maneras según dónde se ejecute:
 *
 * - **modo normal** (producción y desarrollo): Neon sobre HTTP, el transporte actual;
 * - **modo QA aislado**: PostgreSQL TCP normal, porque PUNTO levanta una base efímera **dentro** de
 *   la red interna del sandbox de QA y ahí no existe ningún endpoint HTTP compatible con Neon.
 *
 * La decisión es una señal **explícita** que aporta PUNTO, nunca una inferencia: no se deduce del
 * hostname, ni del formato del DSN, ni de un fallo de conexión, ni de si hay Internet. Un valor que
 * no esté en la lista cerrada falla de inmediato: no hay degradación ni reserva silenciosa.
 *
 * Este módulo es deliberadamente puro (no lee el entorno, no importa ningún driver): así la regla de
 * selección se puede probar sola, sin base de datos y sin credenciales.
 */

/** Variable de entorno que selecciona el transporte. La controla PUNTO, no el proyecto. */
export const TRANSPORT_ENV_VAR = "PUNTO_QA_DATABASE_TRANSPORT";

/** Transportes autorizados. Lista cerrada: ampliarla es un cambio de este módulo, no de la config. */
export const DATABASE_TRANSPORTS = ["neon-http", "postgres-tcp"] as const;

/** Transporte de base de datos admitido. */
export type DatabaseTransport = (typeof DATABASE_TRANSPORTS)[number];

/** Transporte del modo normal: el que se usa cuando PUNTO no pide explícitamente el de QA. */
export const DEFAULT_TRANSPORT: DatabaseTransport = "neon-http";

/**
 * Traduce el valor de la variable de entorno al transporte que hay que usar.
 *
 * Reglas, sin excepciones:
 *
 * - la variable **ausente** significa el modo normal (`neon-http`);
 * - `"neon-http"` selecciona Neon sobre HTTP;
 * - `"postgres-tcp"` selecciona PostgreSQL por TCP (solo QA autorizado por PUNTO);
 * - cualquier otro valor —incluida la cadena vacía, un espacio o una variante de mayúsculas— es un
 *   error de configuración y se rechaza antes de intentar ninguna conexión.
 *
 * @param value Valor crudo de `PUNTO_QA_DATABASE_TRANSPORT`, o `undefined` si no está definida.
 * @returns El transporte seleccionado.
 * @throws Error si el valor no pertenece a la lista cerrada de transportes.
 */
export function selectDatabaseTransport(value: string | undefined): DatabaseTransport {
  if (value === undefined) {
    return DEFAULT_TRANSPORT;
  }
  if (value === "neon-http" || value === "postgres-tcp") {
    return value;
  }
  throw new Error(
    `${TRANSPORT_ENV_VAR} tiene un valor no autorizado (${JSON.stringify(value)}). ` +
      `Valores permitidos: ${DATABASE_TRANSPORTS.map((item) => JSON.stringify(item)).join(", ")}. ` +
      "Sin valor, el transporte es Neon sobre HTTP.",
  );
}
