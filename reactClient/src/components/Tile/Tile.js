import './Tile.scss';
import { DailyVideo, useVideoTrack } from '@daily-co/daily-react';
import Username from '../Username/Username';
import { useEffect } from 'react';
/* import UserInfo from '../UserInfo/UserInfo' */
export default function Tile({ id, isScreenShare, isLocal, isAlone, isOwner, me, clicker, top_header }) {

  useEffect(() => {
    if ('pictureInPictureEnabled' in document) {
      const video = document.querySelector('.notOwner'); // Get your video element

      document.addEventListener('visibilitychange', function () {

        if (document.hidden) {

          // The window is minimized or tab is switched away
          if (video && !document.pictureInPictureElement) {
            // Request Picture-in-Picture only if it's not already in PiP mode
            video.requestPictureInPicture().catch(err => {
              console.error('Error requesting Picture-in-Picture:', err);
            });
          }
        } else {

          // The tab is restored or window is unminimized
          if (document.pictureInPictureElement) {
            // Exit Picture-in-Picture mode when returning to the tab
            document.exitPictureInPicture().catch(err => {
              console.error('Error exiting Picture-in-Picture:', err);
            });
          }
        }
      });
    } else {
      console.log('Your browser does not support Picture-in-Picture');
    }
  }, []);

  const videoState = useVideoTrack(id);

  let containerCssClasses = isScreenShare ? 'tile-screenshare ' : 'tile-video ' + isOwner;

  if (isLocal) {
    containerCssClasses += ` self-view switchBorrower ${top_header ? 'top_header' : ''}`;
    if (isAlone) {
      containerCssClasses += ' alone';
    }
  }

  /* If a participant's video is muted, hide their video and
  add a different background color to their tile. */
  if (videoState.isOff) {
    containerCssClasses += ' no-video';
  }

  return (
    <div className={containerCssClasses} onClick={clicker}>
      {/*       {!isScreenShare && <UserInfo id={id} isLocal={isLocal} />} */}
      <DailyVideo automirror sessionId={id} type={isScreenShare ? 'screenVideo' : 'video'} className={`${!me ? 'notOwner' : ''}`} />
      {!isScreenShare && <Username id={id} isLocal={isLocal} me={me} />}
    </div>
  );
}
