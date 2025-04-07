import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhoneSlash } from 'react-icons/fa';

export default function Controls({
  onLeave,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  isMuted = false,
  isCameraOff = false,
  isScreenSharing = false
}) {
  return (
    <div className="controls-container">
      <button 
        onClick={onToggleMic}
        className={`control-btn ${isMuted ? 'off' : ''}`}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </button>
      
      <button 
        onClick={onToggleCamera}
        className={`control-btn ${isCameraOff ? 'off' : ''}`}
        aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
      >
        {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
      </button>
      
      <button 
        onClick={onToggleScreenShare}
        className={`control-btn ${isScreenSharing ? 'active' : ''}`}
        aria-label={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
      >
        <FaDesktop />
      </button>
      
      <button 
        onClick={onLeave}
        className="control-btn leave"
        aria-label="Leave meeting"
      >
        <FaPhoneSlash />
      </button>
    </div>
  );
}