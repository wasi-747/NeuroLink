import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";

const VideoRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const myMeeting = async (element) => {
    if (!element) return;

    // REPLACE THESE WITH YOUR OWN ZEGOCLOUD APP ID AND SERVER SECRET
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 123456789;
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "PLACEHOLDER_SECRET";
    
    // Generate Kit Token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      user?._id || Date.now().toString(),
      user?.name || "Guest Student"
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Start the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // To implement 1-on-1 calls
      },
      showPreJoinView: true,
      turnOnMicrophoneWhenJoining: false,
      turnOnCameraWhenJoining: false,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showUserList: true,
      onLeaveRoom: () => {
        navigate("/bookings");
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col animate-in fade-in duration-500">
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center shrink-0">
        <button 
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <div className="flex-1 text-center">
          <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-mono font-medium border border-slate-700">
            Room ID: {roomId}
          </span>
        </div>
        <div className="w-[120px]"></div> {/* spacer for centering */}
      </div>

      <div className="flex-1 relative w-full h-full">
        {/* ZegoCloud mounts here */}
        <div ref={myMeeting} className="w-full h-full absolute inset-0" />
      </div>
    </div>
  );
};

export default VideoRoom;
