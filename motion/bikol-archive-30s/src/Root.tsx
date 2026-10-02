import React from 'react';
import {Audio} from '@remotion/media';
import {Composition, Folder, Sequence, staticFile} from 'remotion';
import {BikolArchive30Final as BikolArchive30Continuous} from './BikolArchive30Final';
import {BikolArchive30V3} from './BikolArchive30V3';
import {BikolArchiveVertical30} from './BikolArchiveVertical30';
import {PracticeOverlay} from './PracticeOverlay';
import {CloseScene} from './vertical/CloseScene';
import {CommunityScene} from './vertical/CommunityScene';
import {DialectScene} from './vertical/DialectScene';
import {EntryScene} from './vertical/EntryScene';
import {GrammarScene} from './vertical/GrammarScene';
import {HookScene} from './vertical/HookScene';
import {PracticeScene} from './vertical/PracticeScene';

const BikolArchive30Master: React.FC = () => {
  return (
    <>
      <BikolArchive30V3 />
      <Sequence from={510} durationInFrames={172}>
        <PracticeOverlay />
      </Sequence>
      <Audio src={staticFile('audio/bikol-motion.wav')} volume={0.9} />
    </>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BikolArchive30"
        component={BikolArchive30Master}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BikolArchive30Continuous"
        component={BikolArchive30Continuous}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BikolArchive30ResearchV3"
        component={BikolArchive30V3}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BikolArchiveVertical30"
        component={BikolArchiveVertical30}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="BikolArchiveVertical30-Scenes">
        <Composition id="VerticalHook" component={HookScene} durationInFrames={120} fps={30} width={1080} height={1920} />
        <Composition id="VerticalEntry" component={EntryScene} durationInFrames={120} fps={30} width={1080} height={1920} />
        <Composition id="VerticalDialect" component={DialectScene} durationInFrames={120} fps={30} width={1080} height={1920} />
        <Composition id="VerticalGrammar" component={GrammarScene} durationInFrames={150} fps={30} width={1080} height={1920} />
        <Composition id="VerticalPractice" component={PracticeScene} durationInFrames={150} fps={30} width={1080} height={1920} />
        <Composition id="VerticalCommunity" component={CommunityScene} durationInFrames={120} fps={30} width={1080} height={1920} />
        <Composition id="VerticalClose" component={CloseScene} durationInFrames={120} fps={30} width={1080} height={1920} />
      </Folder>
    </>
  );
};
