import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ───
interface RoomData {
  name: string;
  area_m2: number;
  vertices: number[][];
  height: number;
  type: string;
}

interface GeometryData {
  rooms: RoomData[];
  scale: { total_width_m: number; total_height_m: number };
}

// ─── Room colors by type ───
const ROOM_COLORS: Record<string, string> = {
  main: '#e4665c',
  office: '#4a9eff',
  bathroom: '#7dd3fc',
  kitchen: '#fbbf24',
  storage: '#9ca3af',
  corridor: '#d1d5db',
  terrace: '#86efac',
  other: '#c4b5fd',
};

const ROOM_COLORS_FLOOR: Record<string, string> = {
  main: '#3d1c1a',
  office: '#1a2a3d',
  bathroom: '#1a2d3d',
  kitchen: '#3d3010',
  storage: '#2a2a2a',
  corridor: '#333333',
  terrace: '#1a3d1a',
  other: '#2a1a3d',
};

// ─── 3D Room Component ───
function Room({ room, offsetX, offsetZ }: { room: RoomData; offsetX: number; offsetZ: number }) {
  const wallColor = ROOM_COLORS[room.type] || ROOM_COLORS.other;
  const floorColor = ROOM_COLORS_FLOOR[room.type] || ROOM_COLORS_FLOOR.other;
  
  const vertices = room.vertices.map(([x, y]) => [x - offsetX, y - offsetZ] as [number, number]);
  
  // Create floor shape
  const floorShape = useMemo(() => {
    const shape = new THREE.Shape();
    vertices.forEach(([x, z], i) => {
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    shape.closePath();
    return shape;
  }, [vertices]);

  // Create walls from edges
  const walls = useMemo(() => {
    const wallGeometries: JSX.Element[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const [x1, z1] = vertices[i];
      const [x2, z2] = vertices[(i + 1) % vertices.length];
      
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      wallGeometries.push(
        <mesh
          key={`wall-${i}`}
          position={[midX, room.height / 2, midZ]}
          rotation={[0, -angle, 0]}
        >
          <boxGeometry args={[length, room.height, 0.15]} />
          <meshStandardMaterial color={wallColor} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      );
    }
    return wallGeometries;
  }, [vertices, room.height, wallColor]);

  // Center of room for label
  const center = useMemo(() => {
    const cx = vertices.reduce((s, [x]) => s + x, 0) / vertices.length;
    const cz = vertices.reduce((s, [, z]) => s + z, 0) / vertices.length;
    return [cx, cz] as [number, number];
  }, [vertices]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <shapeGeometry args={[floorShape]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Walls */}
      {walls}

      {/* Room label */}
      <Text
        position={[center[0], room.height / 2 + 0.5, center[1]]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {room.name}
      </Text>
      <Text
        position={[center[0], room.height / 2, center[1]]}
        fontSize={0.3}
        color="#aaa"
        anchorX="center"
        anchorY="middle"
      >
        {room.area_m2} m²
      </Text>
    </group>
  );
}

// ─── First Person Controls ───
function FirstPersonControls() {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const velocity = useRef(new THREE.Vector3());
  const isPointerLocked = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const onClick = () => {
      if (!isPointerLocked.current) gl.domElement.requestPointerLock();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    gl.domElement.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      gl.domElement.removeEventListener('click', onClick);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const speed = 8 * delta;
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) direction.add(forward);
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) direction.sub(forward);
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) direction.add(right);
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) direction.sub(right);

    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(speed);
      camera.position.add(direction);
    }
    camera.position.y = 1.7; // Eye height
  });

  return null;
}

// ─── 3D Scene ───
function Scene({ geometry }: { geometry: GeometryData }) {
  const offsetX = geometry.scale.total_width_m / 2;
  const offsetZ = geometry.scale.total_height_m / 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.7, 5]} fov={75} />
      <FirstPersonControls />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 4, 0]} intensity={0.5} />

      {/* Ground grid */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellColor="#333"
        sectionSize={5}
        sectionColor="#555"
        position={[0, 0, 0]}
        infiniteGrid
        fadeDistance={50}
      />

      {/* Rooms */}
      {geometry.rooms.map((room, i) => (
        <Room key={i} room={room} offsetX={offsetX} offsetZ={offsetZ} />
      ))}
    </>
  );
}

// ─── Orbit Scene (overview mode) ───
function SceneOrbit({ geometry }: { geometry: GeometryData }) {
  const offsetX = geometry.scale.total_width_m / 2;
  const offsetZ = geometry.scale.total_height_m / 2;
  const maxDim = Math.max(geometry.scale.total_width_m, geometry.scale.total_height_m);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, maxDim * 0.8, maxDim * 0.6]} fov={60} />
      <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />

      <Grid
        args={[100, 100]}
        cellSize={1}
        cellColor="#333"
        sectionSize={5}
        sectionColor="#555"
        position={[0, -0.01, 0]}
        infiniteGrid
        fadeDistance={50}
      />

      {geometry.rooms.map((room, i) => (
        <Room key={i} room={room} offsetX={offsetX} offsetZ={offsetZ} />
      ))}
    </>
  );
}

// ─── Main Component ───
const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8098' 
  : 'https://mygloven-api.aeoninfinitive.com/space';

export default function SpaceCreator() {
  const [geometry, setGeometry] = useState<GeometryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'orbit' | 'firstperson'>('orbit');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    setError(null);
    setGeometry(null);

    try {
      const formData = new FormData();
      formData.append('floorplan', file);

      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error processing floor plan');
      }

      const data = await res.json();
      if (data.success && data.geometry) {
        setGeometry(data.geometry);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Header */}
      <div className="text-center pt-24 pb-8 px-4">
        <p className="text-[#e4665c] text-xs font-semibold uppercase tracking-[0.2em] mb-3">Beta</p>
        <h1 className="text-3xl font-black mb-3">
          my'G <span className="text-[#e4665c]">Space Studio</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Sube el plano de tu espacio y visualízalo en 3D al instante. Recorre cada rincón como si estuvieras allí.
        </p>
      </div>

      {/* Upload area */}
      {!geometry && !loading && (
        <div className="max-w-xl mx-auto px-4 pb-8">
          <label
            className="block border-2 border-dashed border-gray-600 hover:border-[#e4665c] rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-[#e4665c]/5"
            onClick={() => fileRef.current?.click()}
          >
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold mb-1">Sube tu plano</p>
            <p className="text-gray-500 text-sm">PNG, JPG o PDF — máximo 20MB</p>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-xl mx-auto px-4 pb-8 text-center">
          {preview && (
            <img src={preview} alt="Floor plan" className="mx-auto mb-6 max-h-48 rounded-xl opacity-50" />
          )}
          <div className="inline-flex items-center gap-3 bg-[#1a1a2e] px-6 py-4 rounded-xl">
            <div className="w-5 h-5 border-2 border-[#e4665c] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-300">Analizando plano con IA...</span>
          </div>
          <p className="text-gray-500 text-xs mt-3">Esto puede tardar 15-30 segundos</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-xl mx-auto px-4 pb-8">
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => { setError(null); setPreview(null); }}
              className="mt-3 text-[#e4665c] text-sm font-semibold hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* 3D Viewer */}
      {geometry && (
        <div className="px-4 pb-8">
          {/* Controls bar */}
          <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('orbit')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewMode === 'orbit' ? 'bg-[#e4665c] text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                🔄 Vista orbital
              </button>
              <button
                onClick={() => setViewMode('firstperson')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewMode === 'firstperson' ? 'bg-[#e4665c] text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                🚶 Recorrer espacio
              </button>
            </div>
            <button
              onClick={() => { setGeometry(null); setPreview(null); }}
              className="text-gray-500 hover:text-white text-sm transition"
            >
              ← Subir otro plano
            </button>
          </div>

          {/* Help text */}
          <div className="max-w-5xl mx-auto mb-2">
            <p className="text-gray-500 text-xs">
              {viewMode === 'orbit' 
                ? 'Arrastra para rotar · Scroll para zoom · Click derecho para mover' 
                : 'Click para activar · WASD/Flechas para moverte · Ratón para mirar · ESC para salir'}
            </p>
          </div>

          {/* Canvas */}
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-gray-800" style={{ height: '70vh' }}>
            <Canvas shadows>
              {viewMode === 'orbit' 
                ? <SceneOrbit geometry={geometry} />
                : <Scene geometry={geometry} />
              }
            </Canvas>
          </div>

          {/* Room list */}
          <div className="max-w-5xl mx-auto mt-6">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Espacios detectados ({geometry.rooms.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {geometry.rooms.map((room, i) => (
                <div key={i} className="bg-[#1a1a2e] rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ROOM_COLORS[room.type] || ROOM_COLORS.other }} />
                    <span className="text-xs font-semibold text-white truncate">{room.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{room.area_m2} m²</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
