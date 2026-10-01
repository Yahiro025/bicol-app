import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BikolArchive30} from './BikolArchive30';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const serif = "Georgia, 'Times New Roman', serif";
const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const BikolArchive30Final: React.FC = () => {
  const frame = useCurrentFrame();

  // Search -> dialect: keep the word itself as the visual anchor while the
  // background changes from nocturne UI to paper archive.
  const ghostOpacity = interpolate(frame, [238, 246, 258, 276], [0, 0.18, 0.12, 0], clamp);
  const ghostScale = interpolate(frame, [238, 276], [0.92, 1.08], {...clamp, easing: ease});

  // Dialect -> conjugation: the central word collapses into a dark ink dot,
  // then that dot becomes the full nocturne field. This masks the previous
  // oversized type and makes the match cut feel intentional.
  const iris = interpolate(frame, [356, 386], [0, 1], {...clamp, easing: ease});
  const irisOpacity = interpolate(frame, [354, 360, 386, 398], [0, 1, 1, 0], clamp);
  const bakalOpacity = interpolate(frame, [374, 382, 392, 400], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#0E0D0B'}}>
      <BikolArchive30 />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: ghostOpacity,
          scale: ghostScale,
          color: '#6F4D87',
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 255,
          letterSpacing: '-0.065em',
          textTransform: 'lowercase',
        }}
      >
        magayon
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 330,
          height: 330,
          borderRadius: '50%',
          background: '#0E0D0B',
          translate: '-50% -50%',
          scale: interpolate(iris, [0, 1], [0.72, 9.2]),
          opacity: irisOpacity,
          pointerEvents: 'none',
          boxShadow: '0 0 90px rgba(14,13,11,.18)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: bakalOpacity,
          color: '#F7F3EA',
          fontFamily: serif,
          fontSize: 126,
          letterSpacing: '-0.055em',
          fontWeight: 700,
        }}
      >
        bakal
        <span
          style={{
            fontFamily: sans,
            fontSize: 16,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: '#EBCB86',
            marginLeft: 30,
            marginTop: 28,
          }}
        >
          root · buy
        </span>
      </div>
    </AbsoluteFill>
  );
};
