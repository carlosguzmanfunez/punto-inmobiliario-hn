export interface HomeProject {
  name: string;
  location: string;
  price: string;
}

export interface HomeBenefit {
  title: string;
  copy: string;
}

export const homeProjects: readonly HomeProject[] = [
  {
    name: 'Residencial Vista Verde',
    location: 'Tegucigalpa, Francisco Morazán',
    price: 'Casas desde L 3,950,000',
  },
  {
    name: 'Torre Nova',
    location: 'San Pedro Sula, Cortés',
    price: 'Apartamentos desde L 2,800,000',
  },
  {
    name: 'Las Palmas Beach Residences',
    location: 'Roatán, Islas de la Bahía',
    price: 'Villas desde L 12,500,000',
  },
];

export const homeBenefits: readonly HomeBenefit[] = [
  {
    title: 'Asesoría personalizada',
    copy: 'Te acompañamos durante todo el proceso.',
  },
  {
    title: 'Propiedades verificadas',
    copy: 'Información confiable y segura.',
  },
  {
    title: 'Cobertura nacional',
    copy: 'Presencia en los 18 departamentos.',
  },
  {
    title: 'Expertos inmobiliarios',
    copy: 'Compra, vende e invierte con criterio.',
  },
];
