import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, clamp, ease} from './theme';

type Props = {light?: boolean; opacity?: number; compact?: boolean};

export const MayonMark: React.FC<Props> = ({light = false, opacity = 1, compact = false}) => {
  const frame = useCurrentFrame();
  const stroke = light ? C.darkInk : C.ink;
  const accent = light ? C.purpleDeep : C.purpleLight;
  return (
    <svg viewBox="0 0 1080 760" style={{
      width: '100%', height: compact ? 620 : 780, opacity,
      scale: interpolate(frame, [0, 120], [1.02, 1.06], {...clamp, easing: ease}),
    }}>
      <path d="M75 620 C190 590 260 535 338 448 C415 362 480 242 540 114 C602 246 665 362 742 449 C824 540 902 589 1004 620" fill="none" stroke={stroke} strokeWidth="5" />
      <path d="M272 620 C345 590 411 548 470 483 C497 453 520 418 540 377 C563 421 588 458 619 491 C674 550 738 591 811 620" fill="none" stroke={accent} strokeWidth="3" opacity="0.82" />
      <path d="M84 621 H996" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <circle cx="540" cy="113" r="8" fill={accent} />
    </svg>
  );
};
