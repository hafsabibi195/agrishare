import type { Equipment, EquipmentCategory } from "@/data/sampleData";

export const farmImages = {
  hero: "/images/web/farm-hero.jpg",
  tractor: "/images/web/tractor.jpg",
  harvester: "/images/web/harvester.jpg",
  sprayer: "/images/web/sprayer.jpg",
  cultivator: "/images/web/cultivator.jpg"
} as const;

const categoryImages: Record<EquipmentCategory, string> = {
  Tractor: farmImages.tractor,
  Harvester: farmImages.harvester,
  Thresher: farmImages.harvester,
  Sprayer: farmImages.sprayer,
  Rotavator: farmImages.cultivator
};

export function equipmentImage(category: string) {
  return categoryImages[category as EquipmentCategory] ?? farmImages.tractor;
}

/** Owner photos when the listing has them, otherwise the category picture. */
export function equipmentPhotos(equipment: Pick<Equipment, "category" | "photos">) {
  return equipment.photos?.length ? equipment.photos : [equipmentImage(equipment.category)];
}
