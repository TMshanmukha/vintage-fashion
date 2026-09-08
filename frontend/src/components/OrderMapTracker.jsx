import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icons break under Vite/webpack bundling
// unless you re-point them at the bundled asset URLs like this.
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const courierIcon = L.divIcon({
  className: "",
  html: `<div style="background:#ec4899;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// EDIT THIS to your actual shop/warehouse coordinates.
// Placeholder is roughly central Bucharest, matching the address on your Contact page.
const SHOP_LOCATION = { lat: 44.4268, lng: 26.1025 };

// Same matching rules as OrderProgressTracker — kept in sync by hand
// since Shiprocket's status text isn't a fixed enum. If you add a new
// phrase there, add it here too.
function resolveProgressFraction(orderStatus, shippingStatus) {
  if (orderStatus === "cancelled" || orderStatus === "pending") return 0;
  if (!shippingStatus) return 0.05;

  const s = shippingStatus.toLowerCase();

  if (/deliver/.test(s)) return 1;
  if (/out for delivery/.test(s)) return 0.85;
  if (/transit|in transit|reached|hub/.test(s)) return 0.6;
  if (/picked up|pickup complete/.test(s)) return 0.3;
  if (/shipment created|awb|manifest/.test(s)) return 0.1;

  return 0.1;
}

function interpolate(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

async function geocodeAddress(addressText) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressText)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default function OrderMapTracker({ order }) {
  const [customerLocation, setCustomerLocation] = useState(null);
  const [geocoding, setGeocoding] = useState(true);
  const [geocodeFailed, setGeocodeFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveAddress() {
      setGeocoding(true);
      setGeocodeFailed(false);

      const addressText = [order.address_line1, order.address_line2, order.city, order.state, order.pincode, order.country]
        .filter(Boolean)
        .join(", ");

      if (!addressText) {
        setGeocoding(false);
        setGeocodeFailed(true);
        return;
      }

      try {
        const coords = await geocodeAddress(addressText);
        if (cancelled) return;

        if (!coords) {
          setGeocodeFailed(true);
        } else {
          setCustomerLocation(coords);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        if (!cancelled) setGeocodeFailed(true);
      } finally {
        if (!cancelled) setGeocoding(false);
      }
    }

    resolveAddress();
    return () => {
      cancelled = true;
    };
  }, [order.address_line1, order.address_line2, order.city, order.state, order.pincode, order.country]);

  if (geocoding) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400">
        Loading map...
      </div>
    );
  }

  if (geocodeFailed || !customerLocation) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-4 text-center text-sm text-gray-400">
        <span>Couldn't locate the delivery address on the map.</span>
        <span className="text-xs">Tracking status is still accurate above.</span>
      </div>
    );
  }

  const progress = resolveProgressFraction(order.order_status, order.shipping_status);
  const courierPosition = interpolate(SHOP_LOCATION, customerLocation, progress);
  const bounds = [
    [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
    [customerLocation.lat, customerLocation.lng],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} style={{ height: "260px", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[SHOP_LOCATION.lat, SHOP_LOCATION.lng]}>
          <Popup>Vintage Fashion — Shop</Popup>
        </Marker>

        <Marker position={[customerLocation.lat, customerLocation.lng]}>
          <Popup>Delivery address</Popup>
        </Marker>

        {order.order_status !== "cancelled" && progress > 0 && (
          <Marker position={[courierPosition.lat, courierPosition.lng]} icon={courierIcon}>
            <Popup>Approximate courier position</Popup>
          </Marker>
        )}

        <Polyline
          positions={[
            [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
            [customerLocation.lat, customerLocation.lng],
          ]}
          pathOptions={{ color: "#ec4899", dashArray: "6 6", weight: 2 }}
        />
      </MapContainer>
    </div>
  );
}