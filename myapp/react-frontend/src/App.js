import { useState, useEffect } from 'react';
import axios from 'axios';
import Join from './components/Join';
import Meeting from './components/Meeting';
import MeetingEnded from './components/MeetingEnded';
import './styles/meeting.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [meetingState, setMeetingState] = useState('join'); // join, meeting, ended
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Initialize Metered Meeting
  useEffect(() => {
    window.meteredMeeting = new window.Metered.Meeting();
    setupEventListeners();
    return () => cleanupEventListeners();
  }, []);

  const setupEventListeners = () => {
    window.meteredMeeting.on('remoteTrackStarted', (track) => {
      setRemoteTracks(prev => [...prev, track]);
    });

    window.meteredMeeting.on('remoteTrackStopped', (track) => {
      setRemoteTracks(prev => prev.filter(t => t.streamId !== track.streamId));
    });

    window.meteredMeeting.on('onlineParticipants', (participants) => {
      setOnlineUsers(participants);
    });

    window.meteredMeeting.on('localTrackUpdated', (trackItem) => {
      const stream = new MediaStream([trackItem.track]);
      setLocalStream(stream);
    });
  };

  const cleanupEventListeners = () => {
    window.meteredMeeting.removeAllListeners();
  };

  const createMeeting = async (username) => {
    try {
      const roomRes = await axios.post(`${API_BASE_URL}/api/create/room`);
      const domainRes = await axios.get(`${API_BASE_URL}/api/metered-domain`);
      
      const joinRes = await window.meteredMeeting.join({
        name: username,
        roomURL: `${domainRes.data.METERED_DOMAIN}/${roomRes.data.roomName}`
      });

      setMeetingInfo({
        ...joinRes,
        roomName: roomRes.data.roomName,
        name: username
      });
      setMeetingState('meeting');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting');
    }
  };

  const joinMeeting = async (roomName, username) => {
    try {
      const validateRes = await axios.get(
        `${API_BASE_URL}/api/validate-meeting?roomName=${roomName}`
      );

      if (!validateRes.data.roomFound) {
        alert('Invalid meeting ID');
        return;
      }

      const domainRes = await axios.get(`${API_BASE_URL}/api/metered-domain`);
      const joinRes = await window.meteredMeeting.join({
        name: username,
        roomURL: `${domainRes.data.METERED_DOMAIN}/${roomName}`
      });

      setMeetingInfo({
        ...joinRes,
        roomName,
        name: username
      });
      setMeetingState('meeting');
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting');
    }
  };

  const leaveMeeting = async () => {
    try {
      await window.meteredMeeting.leaveMeeting();
      setMeetingState('ended');
      setLocalStream(null);
      setRemoteTracks([]);
      setOnlineUsers([]);
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  };

  const toggleMic = async () => {
    try {
      if (isMuted) {
        await window.meteredMeeting.startAudio();
      } else {
        await window.meteredMeeting.stopAudio();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mic:', error);
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOff) {
        await window.meteredMeeting.startVideo();
        const stream = await window.meteredMeeting.getLocalVideoStream();
        setLocalStream(stream);
      } else {
        await window.meteredMeeting.stopVideo();
        setLocalStream(null);
      }
      setIsCameraOff(!isCameraOff);
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await window.meteredMeeting.stopVideo();
      } else {
        await window.meteredMeeting.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  return (
    <div className="app">
      {meetingState === 'join' && (
        <Join 
          onCreateMeeting={createMeeting}
          onJoinMeeting={joinMeeting}
        />
      )}

      {meetingState === 'meeting' && meetingInfo && (
        <Meeting
          meetingInfo={meetingInfo}
          localStream={localStream}
          remoteTracks={remoteTracks}
          onlineUsers={onlineUsers}
          onLeave={leaveMeeting}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
        />
      )}

      {meetingState === 'ended' && (
        <MeetingEnded onRejoin={() => setMeetingState('join')} />
      )}
    </div>
  );
}

export default App;