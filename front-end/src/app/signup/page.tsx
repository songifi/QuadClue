"use client";

import { useRouter } from "next/navigation";
import UsernameSignup from "@/components/UsernameSignup";
import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Redirect to home if already connected
  useEffect(() => {
    if (isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Function to handle Katana connection for development
  const handleKatanaConnect = async () => {
    try {
      // Find the first Katana predeployed account connector
      const katanaConnector = connectors.find(connector => 
        connector.id === "katana" || connector.name?.toLowerCase().includes("katana")
      );
      
      if (katanaConnector) {
        console.log('🔧 Connecting with Katana for development...');
        await connect({ connector: katanaConnector });
      } else {
        console.error('❌ Katana connector not found. Make sure Katana is running.');
        alert('Katana connector not found. Make sure Katana is running on localhost:5050');
      }
    } catch (error) {
      console.error('❌ Failed to connect with Katana:', error);
      alert('Failed to connect with Katana. Please check console for details.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
      <div
        className="relative min-h-screen w-full max-w-sm mx-auto flex flex-col items-center justify-center p-6 overflow-y-auto font-game"
        style={{
          backgroundColor: "#f3f6fa",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px), repeating-linear-gradient(90deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px)",
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {[
            { top: "8%", left: "12%" },
            { top: "22%", right: "10%" },
            { top: "50%", left: "18%" },
            { top: "60%", right: "18%" },
            { bottom: "8%", left: "10%" },
            { bottom: "6%", right: "12%" },
          ].map((pos, i) => (
            <svg
              key={i}
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              className="absolute opacity-20"
              style={pos}
            >
              <path
                d="M28 4l6.928 14.142L50 20.485l-11.036 10.728L41.856 48 28 39.514 14.144 48l2.892-16.787L6 20.485l15.072-2.343L28 4z"
                fill="#7CBAC2"
              />
            </svg>
          ))}
        </div>

        {/* Main content */}
        <div className="z-10 w-full max-w-xs relative flex flex-col items-center">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-bricolage">QuadClue</h1>
            <p className="text-gray-600 text-lg">Join the puzzle revolution</p>
          </div>

          {/* Signup Card */}
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <UsernameSignup />
          </div>

          {/* Development Mode Button */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 w-full">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Development Mode</strong>
                    <br />
                    Use Katana local accounts for testing
                  </div>
                </div>
                <button
                  onClick={handleKatanaConnect}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  🔧 Connect with Katana (Dev)
                </button>
              </div>
            </div>
          )}

          {/* Alternative option */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">Already have a wallet?</p>
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm underline transition-colors"
            >
              Connect with existing wallet instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 