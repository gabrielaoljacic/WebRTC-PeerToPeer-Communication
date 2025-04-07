export default function MeetingEnded({ onRejoin }) {
  return (
    <div className="meeting-ended">
      <h2>Meeting Ended</h2>
      <p>You have left the meeting</p>
      <button onClick={onRejoin}>Rejoin</button>
    </div>
  );
}