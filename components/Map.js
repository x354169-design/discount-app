'use client';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 地図を動かし終わった時に、中心の座標を取得するセンサー
function MapEvents({ onCenterChanged }) {
  const map = useMapEvents({
    moveend: () => {
      onCenterChanged(map.getCenter());
    },
  });
  return null;
}

export default function Map({ onLocationSelect }) {
  // 初期位置（市川駅周辺）
  const position = [35.7293, 139.9080]; 

  return (
    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #444', marginBottom: '20px' }}>
      <MapContainer center={position} zoom={15} style={{ height: '300px', width: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onCenterChanged={onLocationSelect} />
      </MapContainer>

      {/* 画面のド真ん中に固定するピン */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
        fontSize: '40px',
        pointerEvents: 'none',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        📍
      </div>
    </div>
  );
}