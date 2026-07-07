"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";

import {
  Canvas,
  extend,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  Environment,
  Lightformer,
  useGLTF,
  useTexture,
} from "@react-three/drei";

import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";

import {
  MeshLineGeometry,
  MeshLineMaterial,
} from "meshline";

extend({
  MeshLineGeometry,
  MeshLineMaterial,
});

const GLTF_PATH = "/assets/cards.glb";
const TEXTURE_PATH = "/assets/new.jpeg";

useGLTF.preload(GLTF_PATH);
useTexture.preload(TEXTURE_PATH);

export default function BandCard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <Canvas
          gl={{
            alpha: true,
            antialias: true,
          }}
          dpr={[1, 2]}
          camera={{
            position: isMobile
              ? [0, 0, 15]
              : [0, 0, 13],
            fov: isMobile ? 32 : 25,
          }}
          style={{
            background: "transparent",
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
            touchAction: "none",
          }}
        >
          <ambientLight intensity={1.5} />

          <Physics
            interpolate
            gravity={[0, -25, 0]}
            timeStep={1 / 60}
          >
            <Band isMobile={isMobile} />
          </Physics>

          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />

            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />

            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />

            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[
                0,
                Math.PI / 2,
                Math.PI / 3,
              ]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Canvas>
      </Suspense>
    </div>
  );
}

function Band({
  isMobile,
  maxSpeed = 50,
  minSpeed = 10,
}: {
  isMobile: boolean;
  maxSpeed?: number;
  minSpeed?: number;
}) {
  const band = useRef<any>(null);

  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);

  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: any = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const gltf = useGLTF(GLTF_PATH) as any;

  const nodes = gltf?.nodes || {};
  const materials = gltf?.materials || {};

  const strapTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#a54545ff";
      ctx.font = "900 115px sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Render PUSHKAR once, centered with space around it to prevent squishing
      ctx.fillText("   PUSHKAR   ", canvas.width / 2, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  const cardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    const cardTex = new THREE.CanvasTexture(canvas);

    // Crucial: flipY must be false to match GLTF model coordinate system
    cardTex.flipY = false;

    if (ctx) {
      ctx.fillStyle = "#ffffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.src = "/assets/pushkar-card-main.png";

      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Helper function to draw one side of the card
        const drawCardSide = (offsetX: number) => {
          // Photo dimensions
          const photoX = offsetX + 36;
          const photoY = 70;
          const photoWidth = 440;
          const photoHeight = 600; // Taller photo to fill card space

          // Clip path for photo with rounded corners
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(photoX, photoY, photoWidth, photoHeight, 24);
          } else {
            ctx.rect(photoX, photoY, photoWidth, photoHeight);
          }
          ctx.clip();

          // Draw the portrait image centered within the photo frame (object-cover style)
          const imgRatio = img.width / img.height;
          const frameRatio = photoWidth / photoHeight;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (imgRatio > frameRatio) {
            sw = img.height * frameRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / frameRatio;
            sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoWidth, photoHeight);
          ctx.restore();

          // Banner divider line
          ctx.strokeStyle = "#ffffffff";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(offsetX, 700);
          ctx.lineTo(offsetX + 512, 700);
          ctx.stroke();

          // Write name text at the bottom in elegant cursive/handwritten script font
          ctx.fillStyle = "#111827";
          ctx.font = "italic bold 70px 'Brush Script MT', 'Apple Chancery', 'Dancing Script', cursive, serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Pushkar Chhokar", offsetX + 256, 720); // Lowered name to balance card layout
        };

        // Draw both Front (left half) and Back (right half) of the card
        drawCardSide(0);    // Front: U = 0.0 to 0.5
        drawCardSide(512);  // Back:  U = 0.5 to 1.0

        cardTex.needsUpdate = true;
      };

      img.onerror = () => {
        if (img.src.endsWith(".png")) {
          img.src = "/assets/pushkar-card-main.jpeg";
        }
      };
    }

    return cardTex;
  }, []);

  const { width, height } = useThree(
    (state) => state.size
  );

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  const [dragged, drag] =
    useState<any>(null);

  const [hovered, hover] =
    useState(false);

  const canDrag = true;

  useRopeJoint(
    fixed,
    j1,
    [[0, 0, 0], [0, 0, 0], 1] as any
  );

  useRopeJoint(
    j1,
    j2,
    [[0, 0, 0], [0, 0, 0], 1] as any
  );

  useRopeJoint(
    j2,
    j3,
    [[0, 0, 0], [0, 0, 0], 1] as any
  );

  useSphericalJoint(
    j3,
    card,
    [[0, 0, 0], [0, 1.45, 0]] as any
  );

  useEffect(() => {
    if (hovered && canDrag) {
      document.body.style.cursor =
        dragged ? "grabbing" : "grab";

      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (
      dragged !== null &&
      card.current &&
      canDrag
    ) {
      vec
        .set(
          state.pointer.x,
          state.pointer.y,
          0.5
        )
        .unproject(state.camera);

      dir
        .copy(vec)
        .sub(state.camera.position)
        .normalize();

      vec.add(
        dir.multiplyScalar(
          state.camera.position.length()
        )
      );

      [
        card,
        j1,
        j2,
        j3,
        fixed,
      ].forEach((r) =>
        r.current?.wakeUp()
      );

      const newX = vec.x - dragged.x;

      let newY = vec.y - dragged.y;

      const newZ = 0;

      if (isMobile) {
        vec.multiplyScalar(0.92);
      }

      const limit = isMobile
        ? -0.05
        : -0.2;

      if (state.pointer.y < limit) {
        newY =
          card.current.translation().y;
      }

      card.current.setNextKinematicTranslation(
        {
          x: newX,
          y: newY,
          z: newZ,
        }
      );
    }

    if (
      fixed.current &&
      j1.current &&
      j2.current &&
      j3.current &&
      card.current
    ) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) {
          ref.current.lerped =
            new THREE.Vector3().copy(
              ref.current.translation()
            );
        }

        const d = Math.max(
          0.1,
          Math.min(
            1,
            ref.current.lerped.distanceTo(
              ref.current.translation()
            )
          )
        );

        ref.current.lerped.lerp(
          ref.current.translation(),
          delta *
          (minSpeed +
            d *
            (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(
        j3.current.translation()
      );

      curve.points[1].copy(
        j2.current.lerped
      );

      curve.points[2].copy(
        j1.current.lerped
      );

      curve.points[3].copy(
        fixed.current.translation()
      );

      if (band.current?.geometry) {
        band.current.geometry.setPoints(
          curve.getPoints(32)
        );
      }

      ang.copy(card.current.angvel());

      rot.copy(card.current.rotation());

      card.current.setAngvel({
        x: ang.x,
        y: ang.y - rot.y * 0.25,
        z: ang.z,
      });
    }
  });

  curve.curveType = "chordal";

  return (
    <>
      <group
        position={
          isMobile
            ? [1.2, 3, 0]
            : [3, 4, 0]
        }
      >
        <RigidBody
          ref={fixed}
          {...segmentProps}
          type="fixed"
        />

        <RigidBody
          position={[0.5, 0, 0]}
          ref={j1}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[1, 0, 0]}
          ref={j2}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[1.5, 0, 0]}
          ref={j3}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged
              ? "kinematicPosition"
              : "dynamic"
          }
        >
          <CuboidCollider
            args={[0.8, 1.125, 0.01]}
          />

          <group
            scale={
              isMobile ? 1.7 : 2.25
            }
            position={[0, -1.2, -0.05]}
            onPointerOver={() =>
              canDrag && hover(true)
            }
            onPointerOut={() =>
              canDrag && hover(false)
            }
            onPointerUp={(e: any) => {
              if (!canDrag) return;

              e.stopPropagation();

              e.target.releasePointerCapture(
                e.pointerId
              );

              drag(false);
            }}
            onPointerDown={(e: any) => {
              if (!canDrag) return;

              e.target.setPointerCapture(
                e.pointerId
              );

              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(
                    vec.copy(
                      card.current.translation()
                    )
                  )
              );
            }}
          >
            {nodes?.card?.geometry && (
              <mesh
                geometry={
                  nodes.card.geometry
                }
              >
                <meshPhysicalMaterial
                  {...materials.base}
                  map={cardTexture}
                  roughness={0.35}
                  metalness={0.1}
                  clearcoat={1}
                  clearcoatRoughness={0.15}
                />
              </mesh>
            )}

            {nodes?.clip?.geometry && (
              <mesh
                geometry={
                  nodes.clip.geometry
                }
                material={materials.metal}
              />
            )}

            {nodes?.clamp?.geometry && (
              <mesh
                geometry={
                  nodes.clamp.geometry
                }
                material={materials.metal}
              />
            )}
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        {/* @ts-expect-error meshline */}
        <meshLineGeometry />

        {/* @ts-expect-error meshline */}
        <meshLineMaterial
          transparent
          opacity={0.9}
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={strapTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}