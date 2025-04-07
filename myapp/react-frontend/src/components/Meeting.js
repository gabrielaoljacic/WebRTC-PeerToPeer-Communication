import VideoTag from './VideoTag';

export default function Meeting({
  meetingInfo,
  localVideoStream,
  remoteTracks,
  onlineUsers,
  handleMicBtn,
  handleCameraBtn,
  handleScreenBtn,
  handleLeaveBtn
}) {
  const renderRemoteVideos = () => {
    const userStreamMap = {};
    remoteTracks.forEach(track => {
      if (!userStreamMap[track.participantSessionId]) {
        userStreamMap[track.participantSessionId] = [];
      }
      userStreamMap[track.participantSessionId].push(track);
    });

    return onlineUsers.map(user => {
      if (user._id === meetingInfo?.participantSessionId) return null;
      
      const tracks = userStreamMap[user._id] || [];
      const videoTracks = tracks.filter(t => t.type === 'video');
      
      return (
        <div key={user._id} className="participant-video">
          {videoTracks.map(track => {
            const stream = new MediaStream();
            stream.addTrack(track.track);
            return <VideoTag key={track.streamId} srcObject={stream} />;
          })}
          <div className="participant-name">{user.name}</div>
        </div>
      );
    });
  };

  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <h3>Meeting ID: {meetingInfo?.roomName}</h3>
      </div>

      <div className="video-grid">
        {renderRemoteVideos()}
        
        {localVideoStream && (
          <div className="local-video">
            <VideoTag srcObject={localVideoStream} muted />
            <div className="participant-name">You ({meetingInfo?.name})</div>
          </div>
        )}
      </div>

      <div className="controls-container">
        <button onClick={handleMicBtn} className="control-btn">
          {localVideoStream?.getAudioTracks()[0]?.enabled ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={handleCameraBtn} className="control-btn">
          {localVideoStream?.getVideoTracks()[0]?.enabled ? 'Stop Video' : 'Start Video'}
        </button>
        <button onClick={handleScreenBtn} className="control-btn">
          Share Screen
        </button>
        <button onClick={handleLeaveBtn} className="control-btn leave">
          Leave
        </button>
      </div>
    </div>
  );
}