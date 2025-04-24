import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react"
import Navbar from "./components/Navbar"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import EventDetails from "./pages/EventDetails"
import CreateEvent from "./pages/CreateEvent"
import EditEvent from "./pages/EditEvent"
import "./App.css"

// Reemplazar con tu clave pública de Clerk
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/dashboard"
                element={
                  <>
                    <SignedIn>
                      <Dashboard />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/" replace />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/events/create"
                element={
                  <>
                    <SignedIn>
                      <CreateEvent />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/" replace />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/events/edit/:id"
                element={
                  <>
                    <SignedIn>
                      <EditEvent />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/" replace />
                    </SignedOut>
                  </>
                }
              />
              <Route path="/events/:id" element={<EventDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ClerkProvider>
  )
}

export default App

