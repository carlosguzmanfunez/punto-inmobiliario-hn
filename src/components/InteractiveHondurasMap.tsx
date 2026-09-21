"use client";

import { useState } from "react";
import { departments, departmentMapPaths, departmentViewBox } from "@/lib/honduras";
import type { DepartmentName } from "@/lib/honduras";

export function InteractiveHondurasMap() {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentName | null>(null);

  return (
    <>
      <svg
        viewBox={departmentViewBox}
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
              d={departmentMapPaths[departmentName]}
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
      <p className="map-active-label" role="status" aria-live="polite">
        {activeDepartment
          ? `Departamento: ${activeDepartment}`
          : "Pasa el cursor sobre un departamento"}
      </p>
    </>
  );
}
