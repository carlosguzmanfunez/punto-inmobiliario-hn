"use client";

import { useState } from "react";
import type { DepartmentName } from "@/lib/honduras";

// Vista cliente del mapa: solo maneja el hover/foco. NO importa valores de `@/lib/honduras`
// (ese módulo lee el GeoJSON con `node:fs`, que es server-only): los datos llegan por props desde
// el Server Component `InteractiveHondurasMap`. El `import type` de arriba se borra al compilar.
export type HondurasMapViewProps = {
  departments: readonly DepartmentName[];
  paths: Record<DepartmentName, string>;
  viewBox: string;
};

export function HondurasMapView({ departments, paths, viewBox }: HondurasMapViewProps) {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentName | null>(null);

  return (
    <>
      <svg
        viewBox={viewBox}
        role="img"
        aria-label="Mapa de departamentos de Honduras"
        className="honduras-map"
        style={{ width: "100%", height: "auto" }}
      >
        {departments.map((departmentName) => (
          <a
            key={departmentName}
            href={`/propiedades?departamento=${encodeURIComponent(departmentName)}`}
            title={`Ver propiedades en ${departmentName}`}
            aria-label={`Ver propiedades en ${departmentName}`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveDepartment(departmentName)}
            onMouseLeave={() => setActiveDepartment(null)}
            onFocus={() => setActiveDepartment(departmentName)}
            onBlur={() => setActiveDepartment(null)}
          >
            <title>{departmentName}</title>
            <path
              d={paths[departmentName]}
              fill="#f4efe6"
              fillRule="evenodd"
              stroke="#8a7b6a"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className={
                activeDepartment === departmentName
                  ? "department-path is-active"
                  : "department-path"
              }
            />
          </a>
        ))}
      </svg>
      <p
        className={activeDepartment ? "map-active-label is-active" : "map-active-label"}
        role="status"
        aria-live="polite"
      >
        {activeDepartment ? (
          <>
            Departamento: <strong>{activeDepartment}</strong>
          </>
        ) : (
          "Pasa el cursor sobre un departamento"
        )}
      </p>
    </>
  );
}
