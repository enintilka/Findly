import {
  AMENITY_LABELS,
  type PropertyType,
  type RequestAmenities,
  type RequestPropertyDetails,
} from "@/types/customer";

export type ExtraField = {
  key: keyof RequestPropertyDetails;
  label: string;
  type: "text" | "number" | "select" | "checkbox";
  options?: readonly string[];
  placeholder?: string;
};

export type PropertyTypeFormConfig = {
  sectionDescription: string;
  showBedrooms: boolean;
  showBathrooms: boolean;
  bedroomsLabel: string;
  bathroomsLabel: string;
  sizeMinLabel: string;
  sizeMaxLabel: string;
  sizePlaceholder: { min: string; max: string };
  amenities: (keyof RequestAmenities)[];
  extraFields: ExtraField[];
};

const RESIDENTIAL_AMENITIES = [
  "garden",
  "swimmingPool",
  "fireplace",
  "parking",
  "balcony",
  "seaView",
  "mountainView",
  "nearTheSea",
  "furnished",
  "newConstruction",
  "renovationNeeded",
] as const satisfies readonly (keyof RequestAmenities)[];

const residentialConfig = (
  description: string,
): Omit<PropertyTypeFormConfig, "amenities"> => ({
  sectionDescription: description,
  showBedrooms: true,
  showBathrooms: true,
  bedroomsLabel: "Bedrooms",
  bathroomsLabel: "Bathrooms",
  sizeMinLabel: "Size min (m²)",
  sizeMaxLabel: "Size max (m²)",
  sizePlaceholder: { min: "50", max: "90" },
  extraFields: [],
});

export const PROPERTY_TYPE_FORM_CONFIG: Record<PropertyType, PropertyTypeFormConfig> =
  {
    apartment: {
      ...residentialConfig("Typical apartment size and room count."),
      amenities: [...RESIDENTIAL_AMENITIES],
    },
    house: {
      ...residentialConfig("House size and how many rooms you need."),
      amenities: [...RESIDENTIAL_AMENITIES],
    },
    villa: {
      ...residentialConfig("Villa size and room layout preferences."),
      amenities: [...RESIDENTIAL_AMENITIES],
    },
    vacation_home: {
      ...residentialConfig("Holiday home size and room count."),
      amenities: [...RESIDENTIAL_AMENITIES],
    },
    land: {
      sectionDescription: "Plot size and land characteristics agencies should know.",
      showBedrooms: false,
      showBathrooms: false,
      bedroomsLabel: "",
      bathroomsLabel: "",
      sizeMinLabel: "Plot size min (m²)",
      sizeMaxLabel: "Plot size max (m²)",
      sizePlaceholder: { min: "500", max: "2000" },
      amenities: ["garden", "seaView", "mountainView", "nearTheSea", "newConstruction"],
      extraFields: [
        {
          key: "zoning",
          label: "Zoning / permitted use",
          type: "select",
          options: ["Residential", "Agricultural", "Commercial", "Mixed use", "Any / not sure"],
        },
        {
          key: "buildable",
          label: "Buildable plot",
          type: "select",
          options: ["Yes", "No", "Not sure"],
        },
        {
          key: "roadAccess",
          label: "Road access",
          type: "select",
          options: ["Paved road", "Dirt road", "No road access", "Not sure"],
        },
        {
          key: "terrain",
          label: "Terrain",
          type: "select",
          options: ["Flat", "Gentle slope", "Steep slope", "Mixed"],
        },
        {
          key: "utilitiesWater",
          label: "Water connection nearby",
          type: "checkbox",
        },
        {
          key: "utilitiesElectricity",
          label: "Electricity nearby",
          type: "checkbox",
        },
        {
          key: "utilitiesSewage",
          label: "Sewage / drainage available",
          type: "checkbox",
        },
      ],
    },
    commercial: {
      sectionDescription: "Commercial space size and business-use details.",
      showBedrooms: true,
      showBathrooms: true,
      bedroomsLabel: "Rooms / units",
      bathroomsLabel: "Restrooms",
      sizeMinLabel: "Floor area min (m²)",
      sizeMaxLabel: "Floor area max (m²)",
      sizePlaceholder: { min: "80", max: "250" },
      amenities: ["parking", "newConstruction", "renovationNeeded", "furnished"],
      extraFields: [
        {
          key: "commercialUse",
          label: "Intended use",
          type: "select",
          options: [
            "Retail",
            "Office",
            "Warehouse",
            "Restaurant / hospitality",
            "Mixed use",
            "Other",
          ],
        },
        {
          key: "floorLevel",
          label: "Preferred floor level",
          type: "number",
          placeholder: "0 for ground floor",
        },
        {
          key: "parkingSpaces",
          label: "Parking spaces needed",
          type: "number",
          placeholder: "2",
        },
      ],
    },
  };

export function filterAmenitiesForPropertyType(
  propertyType: PropertyType,
  amenities: RequestAmenities,
): RequestAmenities {
  const allowed = new Set(PROPERTY_TYPE_FORM_CONFIG[propertyType].amenities);
  const filtered = { ...amenities };
  for (const key of Object.keys(AMENITY_LABELS) as (keyof RequestAmenities)[]) {
    if (!allowed.has(key)) {
      filtered[key] = false;
    }
  }
  return filtered;
}

export function collectPropertyDetails(
  form: FormData,
  propertyType: PropertyType,
): RequestPropertyDetails {
  const config = PROPERTY_TYPE_FORM_CONFIG[propertyType];
  const details: RequestPropertyDetails = {};

  for (const field of config.extraFields) {
    if (field.type === "checkbox") {
      (details as Record<string, unknown>)[field.key] =
        form.get(`detail_${field.key}`) === "on";
      continue;
    }

    const raw = String(form.get(`detail_${field.key}`) ?? "").trim();
    if (!raw) continue;

    if (field.type === "number") {
      const value = Number(raw);
      if (!Number.isNaN(value)) {
        (details as Record<string, unknown>)[field.key] = value;
      }
      continue;
    }

    (details as Record<string, unknown>)[field.key] = raw;
  }

  return details;
}

const DETAIL_LABELS: Partial<Record<keyof RequestPropertyDetails, string>> = {
  zoning: "Zoning",
  buildable: "Buildable",
  roadAccess: "Road access",
  terrain: "Terrain",
  utilitiesWater: "Water nearby",
  utilitiesElectricity: "Electricity nearby",
  utilitiesSewage: "Sewage available",
  commercialUse: "Intended use",
  floorLevel: "Floor level",
  parkingSpaces: "Parking spaces",
};

export function formatPropertyDetailLines(
  details: RequestPropertyDetails | undefined,
): string[] {
  if (!details) return [];

  return (Object.keys(DETAIL_LABELS) as (keyof RequestPropertyDetails)[])
    .map((key) => {
      const value = details[key];
      if (value === undefined || value === false || value === "") return null;
      const label = DETAIL_LABELS[key];
      if (!label) return null;
      if (typeof value === "boolean") return value ? label : null;
      return `${label}: ${value}`;
    })
    .filter((line): line is string => Boolean(line));
}

export function getPropertyTypeFormConfig(propertyType: PropertyType): PropertyTypeFormConfig {
  return PROPERTY_TYPE_FORM_CONFIG[propertyType];
}
