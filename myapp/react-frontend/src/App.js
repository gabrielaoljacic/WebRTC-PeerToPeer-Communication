import { useState, useEffect } from 'react';
import axios from 'axios';
import Join from './components/Join';
import Meeting from './components/Meeting';
import MeetingEnded from './components/MeetingEnded';
import './styles/meeting.css';

const API_LOCATION = process.env.REACT_APP_API_URL;

function App() {
  const [meetingJoined, setMeetingJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [meetingEnded, setMeetingEnded] = useState(false);

  // Initialize Metered Meeting
  useEffect(() => {
    const meteredMeeting = new window.Metered.Meeting();
    window.meteredMeeting = meteredMeeting;

    const handleRemoteTrackStarted = (trackItem) => {
      setRemoteTracks(prev => [...prev, trackItem]);
    };

    const handleRemoteTrackStopped = (trackItem) => {
      setRemoteTracks(prev => prev.filter(t => t.streamId !== trackItem.streamId));
    };

    const handleOnlineParticipants = (participants) => {
      setOnlineUsers(participants);
    };

    const handleLocalTrackUpdated = (trackItem) => {
      const stream = new MediaStream([trackItem.track]);
      setLocalVideoStream(stream);
    };

    meteredMeeting.on("remoteTrackStarted", handleRemoteTrackStarted);
    meteredMeeting.on("remoteTrackStopped", handleRemoteTrackStopped);
    meteredMeeting.on("onlineParticipants", handleOnlineParticipants);
    meteredMeeting.on("localTrackUpdated", handleLocalTrackUpdated);

    return () => {
      meteredMeeting.removeListener("remoteTrackStarted", handleRemoteTrackStarted);
      meteredMeeting.removeListener("remoteTrackStopped", handleRemoteTrackStopped);
      meteredMeeting.removeListener("onlineParticipants", handleOnlineParticipants);
      meteredMeeting.removeListener("localTrackUpdated", handleLocalTrackUpdated);
      if (localVideoStream) {
        localVideoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localVideoStream]);

  const handleCreateMeeting = async (username) => {
    try {
      const { data } = await axios.post(`${API_LOCATION}/api/create/room`);
      const { data: domainData } = await axios.get(`${API_LOCATION}/api/metered-domain`);
      
      const joinResponse = await window.meteredMeeting.join({
        name: username,
        roomURL: `${domainData.METERED_DOMAIN}/${data.roomName}`
      });

      setUsername(username);
      setRoomName(data.roomName);
      setMeetingInfo(joinResponse);
      setMeetingJoined(true);
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting');
    }
  };

  const handleJoinMeeting = async (roomName, username) => {
    try {
      const { data } = await axios.get(`${API_LOCATION}/api/validate-meeting?roomName=${roomName}`);
      
      if (!data.roomFound) {
        alert('Invalid meeting ID');
        return;
      }

      const { data: domainData } = await axios.get(`${API_LOCATION}/api/metered-domain`);
      const joinResponse = await window.meteredMeeting.join({
        name: username,
        roomURL: `${domainData.METERED_DOMAIN}/${roomName}`
      });

      setUsername(username);
      setRoomName(roomName);
      setMeetingInfo(joinResponse);
      setMeetingJoined(true);
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting');
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      await window.meteredMeeting.leaveMeeting();
      setMeetingEnded(true);
      setLocalVideoStream(null);
      setRemoteTracks([]);
      setOnlineUsers([]);
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  };

  const handleMicBtn = async () => {
    try {
      const audioOn = !localVideoStream?.getAudioTracks()[0]?.enabled;
      if (audioOn) {
        await window.meteredMeeting.startAudio();
      } else {
        await window.meteredMeeting.stopAudio();
      }
    } catch (error) {
      console.error('Error toggling mic:', error);
    }
  };

  const handleCameraBtn = async () => {
    try {
      const videoOn = !localVideoStream?.getVideoTracks()[0]?.enabled;
      if (videoOn) {
        await window.meteredMeeting.startVideo();
        const stream = await window.meteredMeeting.getLocalVideoStream();
        setLocalVideoStream(stream);
      } else {
        await window.meteredMeeting.stopVideo();
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const handleScreenBtn = async () => {
    try {
      await window.meteredMeeting.startScreenShare();
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  return (
    <div className="App">
      {meetingJoined ? (
        meetingEnded ? (
          <MeetingEnded onRejoin={() => {
            setMeetingEnded(false);
            setMeetingJoined(false);
          }} />
        ) : (
          <Meeting
            handleMicBtn={handleMicBtn}
            handleCameraBtn={handleCameraBtn}
            handleScreenBtn={handleScreenBtn}
            handleLeaveBtn={handleLeaveMeeting}
            localVideoStream={localVideoStream}
            onlineUsers={onlineUsers}
            remoteTracks={remoteTracks}
            username={username}
            roomName={roomName}
            meetingInfo={meetingInfo}
          />
        )
      ) : (
        <Join
          handleCreateMeeting={handleCreateMeeting}
          handleJoinMeeting={handleJoinMeeting}
        />
      )}
    </div>
  );
}

export default App;