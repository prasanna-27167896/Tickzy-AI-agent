import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { APP_ID, SERVER_SECRET } from '../video/constant.js';

const VideoPage = () => {
  const [form, setForm] = useState({ link: "", recieverEmail: "", message: "", id: "" });
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false); // 👈 State to toggle UI

  const { id } = useParams();
  const roomID = id;
  const containerRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const location = useLocation();
  const { recieverEmail, ticketId } = location.state || {};

  const userID = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const username = `Guest-${userID.slice(-7)}`;


  useEffect(() => {
    setForm({
      link: `${window.location.origin}/room/${roomID}`,
      recieverEmail: recieverEmail || "",
      message: "",
      id: ticketId,
    });
  }, [roomID, recieverEmail, ticketId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/meeting/room/${roomID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Invite sent successfully!");
      } else {
        alert(data.message || "❌ Invite failed");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasJoinedRef.current && containerRef.current) {
      hasJoinedRef.current = true;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomID,
        Date.now().toString(),
        username
        // decodeURIComponent(roomID)
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Copy Link',
            url: `${window.location.origin}/room/${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        onJoinRoom: () => {
          setJoined(true);
        },
      });
    }
  }, [roomID]);

  return (
    <div className={`w-full ${joined ? 'h-screen' : 'grid grid-rows-[auto_auto] lg:grid-rows-1 lg:grid-cols-[65%_35%]'}`}>
     
      <div
        ref={containerRef}
        className={`${
          joined
            ? 'w-full h-screen bg-black z-50'
            : 'w-full h-[60vh] lg:h-full lg:min-h-screen lg:-mt-16 rounded-lg overflow-hidden'
        }`}
      />

      {/* Invite Form */}
      {!joined && (
        <div className="w-full h-full p-4 text-white lg:mt-7">
          <form onSubmit={handleInvite} className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">📤 Share Room</h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">Room Link</label>
              <input
                type="text"
                name="link"
                value={form.link}
                readOnly
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">To Email</label>
              <input
                type="email"
                name="recieverEmail"
                value={form.recieverEmail}
                readOnly
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Message</label>
              <textarea
                rows="3"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Type your message..."
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-md font-medium transition"
            >
              {loading ? "Sending Invite..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
