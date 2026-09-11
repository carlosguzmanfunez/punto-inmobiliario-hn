export type Operation = "SALE" | "RENT";

export type Property = {
  id: string;
  code: string;
  slug: string;
  title: string;
  operation: Operation;
  type: string;
  price: number;
  currency: "HNL" | "USD";
  city: string;
  department: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  constructionAreaM2?: number;
  landAreaM2?: number;
  featuredLabel?: string;
  image: string;
  summary: string;
};
