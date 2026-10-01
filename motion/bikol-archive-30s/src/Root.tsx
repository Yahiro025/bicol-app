import React from 'react';
import {Composition, Sequence} from 'remotion';
import {BikolArchive30V2} from './BikolArchive30V2';
import {PracticeOverlay} from './PracticeOverlay';

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
    <Composition
      id="BikolArchive30"
      component={BikolArchive30Final}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
