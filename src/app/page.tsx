"use client";

import { useState, useEffect } from "react";
import { db, messaging, getToken, onMessage, ref, push, onValue } from "@/lib/firebase";

export default function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [normalizedUsername, setNormalizedUsername] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Restore session
  useEffect(() => {
    const savedUser = localStorage.getItem("normalized_username");
    if (savedUser) {
      setNormalizedUsername(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Main Effect for Firebase Subscriptions
  useEffect(() => {
    if (!isLoggedIn || !normalizedUsername) return;

    console.log(`Subscribed to topic: user_${normalizedUsername}`);
    showToast(`Subscribed to topic user_${normalizedUsername}`, "success");


    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_USERNAME',
        username: normalizedUsername
      });
    }


    const requestPermissionAndListen = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setTimeout(async () => {
            if (messaging) {
              try {
                const token = await getToken(messaging, { vapidKey: "BDwVW-d-te72QspUGyyRH-2BFIpox8albsGPKUtdPRznuU1DNfld7rDqQdvzzLPS9qBNm5xZ-nyWAHLxG-c9oQI" });
                console.log("FCM Token:", token);
              } catch (e) {
                console.error("FCM Token fetch failed", e);
              }
            }
          }, 1000);
        } else {
          showToast("Notification permission denied.", "error");
        }
      } catch (error) {
        console.error("Error asking for permission", error);
      }
    };

    requestPermissionAndListen();

    // Foreground Message listener
    let unsubscribeMessage = () => { };
    // Poll for messaging if it isn't ready instantly
    const initMessaging = () => {
      if (messaging) {
        unsubscribeMessage = onMessage(messaging, (payload) => {
          console.log("Message received. ", payload);
          const title = payload.notification?.title || payload.data?.title || 'New Notification';
          const body = payload.notification?.body || payload.data?.body || '';

          // Push to Realtime Database
          const notifRef = ref(db, `notifications/user_${normalizedUsername}`);
          push(notifRef, {
            title,
            body,
            receivedAt: Date.now()
          }).catch(console.error);

          // Show a local floating toast
          showToast(`New Notification: ${title}`, "success");
        });
      } else {
        setTimeout(initMessaging, 500);
      }
    };
    initMessaging();

    // Listen to Firebase RTDB for Realtime Inbox updates
    const notificationsRef = ref(db, `notifications/user_${normalizedUsername}`);
    const unsubscribeDb = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedNotifs = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.receivedAt - a.receivedAt);
        setNotifications(parsedNotifs);
      } else {
        setNotifications([]);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeDb();
    };
  }, [isLoggedIn, normalizedUsername]);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);


    const normalized = username.toLowerCase().replace(/\s/g, "");

    setTimeout(() => {
      setNormalizedUsername(normalized);
      setIsLoggedIn(true);
      localStorage.setItem("normalized_username", normalized);
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    console.log(`Unsubscribed from topic: user_${normalizedUsername}`);
    localStorage.removeItem("normalized_username");
    setIsLoggedIn(false);
    setNormalizedUsername("");
    setUsername("");
    setNotifications([]);
    showToast("Logged out successfully.", "success");
  };


  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };


  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 selection:bg-blue-500/30">
        {toast && (
          <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-2xl z-50 transition-all font-medium border ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-red-900/90 border-red-500/50 text-red-100'
            }`}>
            {toast.message}
          </div>
        )}
        <div className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 transform -rotate-3 hover:rotate-0 transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Notification <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Hub</span></h1>
            <p className="text-gray-400 font-medium">Log in to sync your messages</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">@</span>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600 font-medium disabled:opacity-50"
                  placeholder="john doe"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full group relative flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Login to Inbox</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-500/30">
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-2xl z-50 transition-all font-medium border ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-red-900/90 border-red-500/50 text-red-100'
          }`}>
          {toast.message}
        </div>
      )}

      {/* Premium Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
                {normalizedUsername.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Welcome back</h1>
              <p className="text-sm font-medium text-blue-400">@{normalizedUsername}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-all border border-gray-700 hover:border-gray-600 hover:text-white flex items-center space-x-2"
          >
            <span>Logout</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>


      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8 relative">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Realtime Inbox</h2>
            <p className="text-gray-400 font-medium">Your notifications instantly sync here</p>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-sm font-bold">
              {notifications.length} <span className="text-gray-500 font-medium">Messages</span>
            </span>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-gray-900/40 rounded-3xl border border-gray-800/50 p-16 text-center text-gray-400 group relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 border border-gray-700/50 shadow-inner">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-300 mb-2">It's quiet... too quiet</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">Your inbox is empty right now. Waiting for new notifications to arrive via Firebase Cloud Messaging.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <div
                key={notif.id}
                className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800 hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 group relative overflow-hidden backdrop-blur-sm"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg text-gray-100 group-hover:text-blue-400 transition-colors truncate pr-4">{notif.title}</h3>
                      <div className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-950/50 px-2.5 py-1 rounded-md border border-gray-800/50">
                        {timeAgo(notif.receivedAt)}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed pr-8">{notif.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
