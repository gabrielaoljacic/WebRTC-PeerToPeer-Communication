import { useState, useEffect } from 'react';
import VideoTag from './VideoTag';
import Controls from './Controls';

export default function Meeting({
  meetingInfo,
  localStream,
  remoteTracks,
  onlineUsers,
  onLeave,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare
}) {
  const [gridCols, setGridCols] = useState(1);

  useEffect(() => {
    // Adjust grid columns based on participant count
    const count = onlineUsers.length + 1; // +1 for local video
    setGridCols(Math.min(Math.ceil(Math.sqrt(count)), 3));
  }, [onlineUsers]);

  const renderRemoteVideos = () => {
    return onlineUsers.map(user => {
      if (user._id === meetingInfo.participantSessionId) return null;
      
      const userTracks = remoteTracks.filter(t => t.participantSessionId === user._id);
      const videoTracks = userTracks.filter(t => t.type === 'video');
      const audioTracks = userTracks.filter(t => t.type === 'audio');

      return (
        <div key={user._id} className="participant-video">
          {videoTracks.map(track => {
            const stream = new MediaStream();
            stream.addTrack(track.track);
            return <VideoTag key={track.streamId} srcObject={stream} />;
          })}
          {audioTracks.map(track => {
            const stream = new MediaStream();
            stream.addTrack(track.track);
            return <VideoTag key={track.streamId} srcObject={stream} style={{ display: 'none' }} />;
          })}
          <div className="participant-name">{user.name}</div>
        </div>
      );
    });
  };

  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <h3>Meeting ID: {meetingInfo.roomName}</h3>
      </div>

      <div className={`video-grid cols-${gridCols}`}>
        {renderRemoteVideos()}
        
        {localStream && (
          <div className="local-video">
            <VideoTag srcObject={localStream} muted className="local-video-tag" />
            <div className="participant-name">You ({meetingInfo.name})</div>
          </div>
        )}
      </div>

      <Controls
        onLeave={onLeave}
        onToggleMic={onToggleMic}
        onToggleCamera={onToggleCamera}
        onToggleScreenShare={onToggleScreenShare}
      />
    </div>
  );
}