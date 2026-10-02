import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {CloseScene} from './vertical/CloseScene';
import {CommunityScene} from './vertical/CommunityScene';
import {DialectScene} from './vertical/DialectScene';
import {EntryScene} from './vertical/EntryScene';
import {GrammarScene} from './vertical/GrammarScene';
import {HookScene} from './vertical/HookScene';
import {PracticeScene} from './vertical/PracticeScene';
import {C} from './vertical/theme';

export const BikolArchiveVertical30: React.FC = () => (
  <AbsoluteFill style={{background:C.bg}}>
    <Series>
      <Series.Sequence name="Hook" durationInFrames={120}><HookScene /></Series.Sequence>
      <Series.Sequence name="Entry" durationInFrames={120}><EntryScene /></Series.Sequence>
      <Series.Sequence name="Dialect" durationInFrames={120}><DialectScene /></Series.Sequence>
      <Series.Sequence name="Grammar" durationInFrames={150}><GrammarScene /></Series.Sequence>
      <Series.Sequence name="Practice" durationInFrames={150}><PracticeScene /></Series.Sequence>
      <Series.Sequence name="Community" durationInFrames={120}><CommunityScene /></Series.Sequence>
      <Series.Sequence name="Close" durationInFrames={120}><CloseScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
