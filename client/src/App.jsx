import { useEffect, useState } from 'react'
import './App.css'

const SERVER_URL = import.meta.env?.VITE_SERVER_URL ?? 'http://localhost:5000'

function App() {
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDetails = () => {
    void fetch(`${SERVER_URL}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setUserName(data.latestUserName || '')
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setUserName('')
      })
      .finally(() => setLoading(false))
  }

  const refresh = () => {
    setLoading(true)
    void fetchDetails()
  }

  useEffect(() => {
    void fetchDetails()
  }, [])

  return (
    <section id="center">
      <div>
        <h1>Latest user</h1>
        {loading && <p>Loading…</p>}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && userName && <p>The latest user is: <strong>{userName}</strong></p>}
        {!loading && !error && !userName && <p>No users found yet.</p>}
      </div>
      <button type="button" className="counter" onClick={refresh}>
        Refresh
      </button>
    </section>
  )
}

export default App
