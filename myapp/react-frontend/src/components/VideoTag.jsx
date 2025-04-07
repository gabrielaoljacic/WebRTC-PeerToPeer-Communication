import { useEffect, useRef } from 'react';
import classNames from 'classnames';

export default function VideoTag({ srcObject, className, style, muted = false }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && srcObject) {
      videoRef.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return (
    <video
      ref={videoRef}
      className={classNames('video-tag', className)}
      style={style}
      autoPlay
      playsInline
      muted={muted}
      onCanPlay={() => videoRef.current.play().catch(console.error)}
    />
  );
}