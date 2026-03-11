import React, { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export default function VenueMap({ lat, lng, name, address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Dynamically load Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = (window as any).L;
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false,
      }).setView([lat, lng], 15);

      // CartoDB Voyager - clean, modern look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom marker with coral color
      const markerIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px; 
            background: #e4665c; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            border: 3px solid white; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <svg viewBox="0 0 24 24" style="width:16px;height:16px;transform:rotate(45deg);fill:white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:Inter,system-ui,sans-serif;padding:4px 0">
          <strong style="font-size:13px;color:#1a1a2a">${name}</strong>
          ${address ? `<br><span style="font-size:11px;color:#888">${address}</span>` : ''}
        </div>
      `);

      // Add subtle attribution
      L.control.attribution({ prefix: false, position: 'bottomright' })
        .addAttribution('© <a href="https://carto.com" style="color:#888;font-size:10px">CARTO</a>')
        .addTo(map);

      mapInstance.current = map;

      // Fix map size after render
      setTimeout(() => map.invalidateSize(), 100);
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng, name, address]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
      <div ref={mapRef} style={{ height: '280px', width: '100%' }} />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 text-sm text-[#e4665c] hover:text-[#d86259] font-medium border-t border-gray-50 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        Abrir en Google Maps
      </a>
    </div>
  );
}
