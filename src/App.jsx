import { useEffect, useState } from "react";
import Chat from "./components/Chat/Chat";
import Detail from "./components/Detail/Detail";
import List from "./components/list/List";
import Login from "./components/Login/Login";
import Notification from "./components/Notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import { useUserStore } from "./store/userStore";
import { useChatStore } from "./store/chatStore";

const App = () => {
  const [user, setUser] = useState(false);
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState("list"); // 'list', 'chat', or 'detail'

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Auth effect
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => unSub();
  }, [fetchUserInfo]);

  // When chatId changes, switch view to chat on mobile
  useEffect(() => {
    if (chatId && isMobile) {
      setActiveView("chat");
    }
  }, [chatId, isMobile]);

  if (isLoading) return <div className="loading-container">Loading...</div>;

  // Handle mobile view navigation
  const navigateTo = (view) => {
    setActiveView(view);
  };

  return (
    <div className="app-container">
      {currentUser ? (
        <div
          className="layout-container"
          style={{
            display: "flex",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          {(!isMobile || (isMobile && activeView === "list")) && (
            <div
              className="sidebar"
              style={{
                width: isMobile ? "100%" : "300px",
                borderRight: "1px solid #e0e0e0",
                overflow: "auto",
              }}
            >
              <List />
              {isMobile && chatId && (
                <button
                  className="mobile-nav-button"
                  onClick={() => navigateTo("chat")}
                  style={{
                    padding: "10px",
                    margin: "10px",
                    backgroundColor: "#4a89dc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    display: chatId ? "block" : "none",
                  }}
                >
                  Open Chat
                </button>
              )}
            </div>
          )}

          {/* Main content area */}
          {(!isMobile || (isMobile && activeView === "chat")) && chatId && (
            <div
              className="main-content"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
              }}
            >
              <Chat />
              {isMobile && (
                <div
                  className="mobile-navigation"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    borderTop: "1px solid #e0e0e0",
                  }}
                >
                  <button
                    onClick={() => navigateTo("list")}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f1f1f1",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Back to List
                  </button>
                  {chatId && (
                    <button
                      onClick={() => navigateTo("detail")}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f1f1f1",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Detail panel */}
          {(!isMobile || (isMobile && activeView === "detail")) && chatId && (
            <div
              className="detail-panel"
              style={{
                width: isMobile ? "100%" : "300px",
                borderLeft: isMobile ? "none" : "1px solid #e0e0e0",
                overflow: "auto",
              }}
            >
              <Detail />
              {isMobile && (
                <button
                  onClick={() => navigateTo("chat")}
                  style={{
                    display: "block",
                    padding: "10px",
                    margin: "10px",
                    backgroundColor: "#4a89dc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    width: "calc(100% - 20px)",
                  }}
                >
                  Back to Chat
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <Login />
      )}

      <Notification />
    </div>
  );
};

export default App;
