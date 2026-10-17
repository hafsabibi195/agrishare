"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { Equipment } from "@/data/sampleData";
import { equipmentPhotos } from "@/lib/equipment-images";

/** Listing cover photo; opens a full-size viewer when the owner uploaded photos. */
export function EquipmentPhoto({ equipment, className }: { equipment: Pick<Equipment, "title" | "category" | "photos">; className?: string }) {
  const photos = equipmentPhotos(equipment);
  const hasOwnerPhotos = Boolean(equipment.photos?.length);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!hasOwnerPhotos) {
    return <img src={photos[0]} alt={equipment.category} loading="lazy" className={`object-cover ${className ?? ""}`} />;
  }

  return <>
    <button type="button" onClick={() => setOpenIndex(0)} aria-label={`View photos of ${equipment.title}`} className={`relative block shrink-0 overflow-hidden ${className ?? ""}`}>
      <img src={photos[0]} alt={equipment.title} loading="lazy" className="size-full object-cover transition duration-300 hover:scale-105" />
      {photos.length > 1 && <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white"><Images size={11} />{photos.length}</span>}
    </button>
    {openIndex !== null && createPortal(<PhotoViewer title={equipment.title} photos={photos} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />, document.body)}
  </>;
}

function PhotoViewer({ title, photos, index, onIndexChange, onClose }: { title: string; photos: string[]; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const show = (next: number) => onIndexChange((next + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") show(index + 1);
      if (event.key === "ArrowLeft") show(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return <div role="dialog" aria-modal="true" aria-label={`Photos of ${title}`} onClick={onClose} className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4">
    <div onClick={(event) => event.stopPropagation()} className="relative flex w-full max-w-4xl flex-col items-center gap-3">
      <button type="button" onClick={onClose} aria-label="Close photos" className="absolute -top-2 right-0 grid size-10 -translate-y-full place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"><X size={20} /></button>
      <img src={photos[index]} alt={`${title}, photo ${index + 1} of ${photos.length}`} className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain" />
      <p className="text-sm font-semibold text-white">{title} · {index + 1} / {photos.length}</p>
      {photos.length > 1 && <>
        <button type="button" onClick={() => show(index - 1)} aria-label="Previous photo" className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#1E2A1F] hover:bg-white"><ChevronLeft size={22} /></button>
        <button type="button" onClick={() => show(index + 1)} aria-label="Next photo" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#1E2A1F] hover:bg-white"><ChevronRight size={22} /></button>
        <div className="flex gap-2">{photos.map((photo, photoIndex) => <button key={photoIndex} type="button" onClick={() => show(photoIndex)} aria-label={`Show photo ${photoIndex + 1}`} className={`size-14 overflow-hidden rounded-lg border-2 ${photoIndex === index ? "border-[#E3B04B]" : "border-transparent opacity-70 hover:opacity-100"}`}><img src={photo} alt="" className="size-full object-cover" /></button>)}</div>
      </>}
    </div>
  </div>;
}
