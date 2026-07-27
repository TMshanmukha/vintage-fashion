import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import useAuth from "../../hooks/useAuth";
import useSocket from "../../hooks/UseSocket";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { logoutLocal } = useAuth();

  // Mounted on every page (Layout wraps the whole app), so a logout that
  // happens in another tab is reflected immediately no matter which page
  // the user is currently on — not just when they're on My Account.
  useSocket({
    "session:changed": ({ event }) => {
      if (event === "logout") {
        logoutLocal();
        navigate("/auth", { replace: true });
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}