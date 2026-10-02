import {Easing, interpolate} from 'remotion';

export const C = {
  bg: '#0D0C0B', bg2: '#171512', surface: '#211D19', ink: '#F5F0E7',
  inkDim: '#CFC6B7', muted: '#91887C', paper: '#F5F0E7', paper2: '#E8DECF',
  darkInk: '#1D1915', darkMuted: '#6F665D', line: '#3A332C', paperLine: '#CFC5B6',
  purple: '#8D6AA8', purpleLight: '#C8ACD9', purpleDeep: '#654B77', gold: '#C99A4D', rust: '#A85F42',
};

export const serif = "Georgia, 'Times New Roman', serif";
export const sans = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const appear = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {...clamp, easing: ease});
