import React from 'react';
import {Composition, Sequence} from 'remotion';
import {BikolArchive30V2} from './BikolArchive30V2';
import {PracticeOverlay} from './PracticeOverlay';
import {BikolArchive30Final as BikolArchive30Continuous} from './BikolArchive30Final';
import {BikolArchive30V3} from './BikolArchive30V3';

const BikolArchive30Final: React.FC = () => {
  return (
    <>
      <BikolArchive30V2 />
      <Sequence from={510} durationInFrames={172}>
        <PracticeOverlay />
      </Sequence>
    </>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BikolArchive30"
        component={BikolArchive30Final}
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
