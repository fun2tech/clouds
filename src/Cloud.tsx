import React, {
  FC,
  useRef,
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import { useFrame } from 'react-three-fiber';
import generateVoxelGeometries from './generateVoxelGeometries';
import { Vector3, Group, BufferGeometry, DataTexture } from 'three';
import { a, useSpring, config } from '@react-spring/three';
import { CloudShaderMaterial } from './CloudShaderMaterial';

export type CloudProps = {
  velocity: Vector3;
  id: string;
  initialPosition: Vector3;
  onExitBoundary?: (id: string) => any;
  boundarySize: number;
  size?: number;
  resolution?: number;
};

type GeometryState = {
  geometry: BufferGeometry;
  resolution: number;
};

export const Cloud: FC<CloudProps> = ({
  velocity,
  onExitBoundary,
  id,
  initialPosition,
  size = 480,
  resolution: providedResolution = 64,
  boundarySize,
}) => {
  const ref = useRef<Group>();
  const rotation = useRef(Math.random() * Math.PI * 2);

  const [lodGeometries, setLodGeometries] = useState<
    Map<number, GeometryState>
  >(new Map());

  const generateLod = useCallback(
    () =>
      generateVoxelGeometries({ resolution: providedResolution }).then(
        ({ geometry: geo }) =>
          setLodGeometries(existing => {
            existing.set(providedResolution, {
              resolution: providedResolution,
              geometry: geo,
            });
            return new Map(existing);
          }),
      ),
    [setLodGeometries, providedResolution],
  );

  const isExiting = useRef(false);
  useFrame(() => {
    if (!ref.current || !lodGeometries.size) return;

    ref.current.position.add(velocity);
    const planePosition = new Vector3(
      ref.current.position.x,
      0,
      ref.current.position.z,
    );
    if (planePosition.x > boundarySize / 2 && !isExiting.current) {
      isExiting.current = true;
      onExitBoundary && onExitBoundary(id);
      generateLod().then(() => {
        isExiting.current = false;
        if (!ref.current) return;
        ref.current.position.x = -(boundarySize / 2);
        ref.current.position.z =
          Math.random() * boundarySize - boundarySize / 2;
      });
    }
  });

  useEffect(() => {
    generateLod();
  }, [generateLod]);

  const { y } = useSpring({
    y: !!lodGeometries.size ? initialPosition.y : 100,
    config: config.gentle,
  });

  if (!lodGeometries.size) {
    console.log('Waiting for geometry');
    return null;
  }

  const { geometry, resolution } = lodGeometries.get(Array.from(
    lodGeometries.keys(),
  )
    .sort()
    .pop() as number) as GeometryState;

  const scale = size / resolution;

  const position = y.to(
    v =>
      new Vector3(
        ref.current ? ref.current.position.x : initialPosition.x,
        v,
        ref.current ? ref.current.position.z : initialPosition.z,
      ) as any,
  );

  return (
    <>
      <a.group
        ref={ref}
        position={position}
        scale={[scale, scale, scale]}
        rotation={[0, rotation.current, 0]}
      >
        <mesh
          geometry={geometry}
          position={[0, 2 * (480 / size), 0]}
          castShadow
        >
          <CloudShaderMaterial attach="material" />
        </mesh>
      </a.group>
    </>
  );
};
