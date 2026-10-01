import React from 'react';
import {Composition} from 'remotion';
import {BikolArchive30} from './BikolArchive30';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BikolArchive30"
      component={BikolArchive30}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
