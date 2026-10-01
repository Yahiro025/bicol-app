import React from 'react';
import {Audio} from '@remotion/media';
import {Composition, Sequence, staticFile} from 'remotion';
import {BikolArchive30Final as BikolArchive30Continuous} from './BikolArchive30Final';
import {BikolArchive30V3} from './BikolArchive30V3';
import {PracticeOverlay} from './PracticeOverlay';

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
    </>
  );
};
