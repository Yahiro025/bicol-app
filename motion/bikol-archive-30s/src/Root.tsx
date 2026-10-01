import React from 'react';
import {Composition} from 'remotion';
import {BikolArchive30V2} from './BikolArchive30V2';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BikolArchive30"
      component={BikolArchive30V2}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
