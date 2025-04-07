import { useEffect, useRef } from 'react';

export default function VideoTag({ srcObject, muted = false, ...props }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && srcObject) {
      videoRef.current.srcObject = srcObject;
    }
  }, [srcObject]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      onCanPlay={() => videoRef.current.play().catch(console.error)}
      {...props}
    />
  );
}