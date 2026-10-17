"use client";

import { LeafletProvider, createLeafletContext, type LeafletContextInterface } from "@react-leaflet/core";
import { Map as LeafletMap } from "leaflet";
import type { MapContainerProps } from "react-leaflet";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

// Drop-in for react-leaflet's MapContainer. The original creates a new Leaflet map
// whenever React re-attaches its ref (e.g. when a Suspense boundary re-shows content),
// which throws "Map container is already initialized". This version reuses the map.
export const MapContainer = forwardRef<LeafletMap, MapContainerProps>(function MapContainer(
  { bounds, boundsOptions, center, children, className, id, placeholder, style, whenReady, zoom, ...options },
  forwardedRef
) {
  const [props] = useState({ className, id, style });
  const [context, setContext] = useState<LeafletContextInterface | null>(null);
  const contextRef = useRef<LeafletContextInterface | null>(null);
  useImperativeHandle(forwardedRef, () => context?.map as LeafletMap, [context]);

  const mapRef = useCallback((node: HTMLDivElement | null) => {
    if (node === null || contextRef.current !== null) return;
    const map = new LeafletMap(node, options);
    if (center != null && zoom != null) map.setView(center, zoom);
    else if (bounds != null) map.fitBounds(bounds, boundsOptions);
    if (whenReady != null) map.whenReady(whenReady);
    contextRef.current = createLeafletContext(map);
    setContext(contextRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (context === null) return;
    context.map.remove();
    contextRef.current = null;
  }, [context]);

  return (
    <div {...props} ref={mapRef}>
      {context ? <LeafletProvider value={context}>{children}</LeafletProvider> : placeholder ?? null}
    </div>
  );
});
