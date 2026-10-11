import L from "leaflet";

/**
 * The map pin, in the dashboard's own colour.
 *
 * Replaces Leaflet's stock blue marker PNG, which looked borrowed next to the
 * rest of the settings page. An inline SVG divIcon: no image requests, crisp
 * at any density, and a soft ground shadow so the tip reads as "here".
 */
const PIN_SVG = `
<div class="mel-pin">
  <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M20 46c0 0 16-14.2 16-26.5C36 10.4 28.8 3 20 3S4 10.4 4 19.5C4 31.8 20 46 20 46z" fill="#00b7ff" stroke="#ffffff" stroke-width="3"/>
    <circle cx="20" cy="19.5" r="6.5" fill="#ffffff"/>
  </svg>
  <span class="mel-pin__shadow"></span>
</div>`;

export const brandPinIcon = L.divIcon({
  html: PIN_SVG,
  className: "mel-pin-icon",
  iconSize: [40, 48],
  iconAnchor: [20, 46],
});
