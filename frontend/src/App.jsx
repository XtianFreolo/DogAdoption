import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // Optional: restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  const handleLoginSuccess = (username, token) => {
    setUsername(username);
    setToken(token);
    setAuthMessage("");
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
  };

  const handleLogout = () => {
    setUsername("");
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🐶 Dog Adoption Platform</h1>

        {!token ? (
          <AuthPanel
            API_BASE={API_BASE}
            onLoginSuccess={handleLoginSuccess}
            authMessage={authMessage}
            setAuthMessage={setAuthMessage}
          />
        ) : (
          <DogDashboard
            API_BASE={API_BASE}
            token={token}
            username={username}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

function AuthPanel({ API_BASE, onLoginSuccess, authMessage, setAuthMessage }) {
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [logUsername, setLogUsername] = useState("");
  const [logPassword, setLogPassword] = useState("");

  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setLoadingRegister(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthMessage(data.message || "Registration failed");
      } else {
        setAuthMessage("Registration successful! You can now log in.");
        setRegUsername("");
        setRegPassword("");
      }
    } catch (err) {
      setAuthMessage("Error connecting to server.");
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setLoadingLogin(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: logUsername, password: logPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthMessage(data.message || "Login failed");
      } else {
        onLoginSuccess(logUsername, data.token);
        setLogUsername("");
        setLogPassword("");
      }
    } catch (err) {
      setAuthMessage("Error connecting to server.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const isError =
    authMessage &&
    (authMessage.toLowerCase().includes("fail") ||
      authMessage.toLowerCase().includes("error"));

  return (
    <section className="card">
      <h2>Authentication</h2>
      <div className="auth-forms">
        <div>
          <h3>Register</h3>
          <form onSubmit={handleRegister}>
            <label>
              Username
              <input
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loadingRegister}>
              {loadingRegister ? "Registering..." : "Register"}
            </button>
          </form>
        </div>

        <div>
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <label>
              Username
              <input
                value={logUsername}
                onChange={(e) => setLogUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={logPassword}
                onChange={(e) => setLogPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loadingLogin}>
              {loadingLogin ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {authMessage && (
        <p className={`message ${isError ? "error" : ""}`}>{authMessage}</p>
      )}
    </section>
  );
}

function DogDashboard({ API_BASE, token, username, onLogout }) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dogMessage, setDogMessage] = useState("");

  const [adoptDogId, setAdoptDogId] = useState("");
  const [adoptMessage, setAdoptMessage] = useState("");
  const [adoptStatus, setAdoptStatus] = useState("");

  const [registeredStatusFilter, setRegisteredStatusFilter] = useState("");
  const [registeredDogs, setRegisteredDogs] = useState([]);
  const [adoptedDogs, setAdoptedDogs] = useState([]);
  const [loadingRegistered, setLoadingRegistered] = useState(false);
  const [loadingAdopted, setLoadingAdopted] = useState(false);

  const [allDogs, setAllDogs] = useState([]);
  const [allStatusFilter, setAllStatusFilter] = useState("");
  const [loadingAllDogs, setLoadingAllDogs] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadRegisteredDogs = async () => {
    setLoadingRegistered(true);
    setRegisteredDogs([]);
    const params = new URLSearchParams();
    if (registeredStatusFilter) params.set("status", registeredStatusFilter);
    params.set("page", "1");
    params.set("limit", "20");

    try {
      const res = await fetch(
        `${API_BASE}/api/dogs/registered/me?${params.toString()}`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) {
        setDogMessage(data.message || "Failed to load registered dogs");
      } else {
        setRegisteredDogs(data.data || []);
      }
    } catch (err) {
      setDogMessage("Error connecting to server while loading registered dogs.");
    } finally {
      setLoadingRegistered(false);
    }
  };

  const loadAdoptedDogs = async () => {
    setLoadingAdopted(true);
    setAdoptedDogs([]);

    try {
      const res = await fetch(
        `${API_BASE}/api/dogs/adopted/me?page=1&limit=20`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) {
        setAdoptStatus(data.message || "Failed to load adopted dogs");
      } else {
        setAdoptedDogs(data.data || []);
      }
    } catch (err) {
      setAdoptStatus("Error connecting to server while loading adopted dogs.");
    } finally {
      setLoadingAdopted(false);
    }
  };

  const loadAllDogs = async () => {
    setLoadingAllDogs(true);
    setAllDogs([]);
    const params = new URLSearchParams();
    if (allStatusFilter) params.set("status", allStatusFilter);
    params.set("page", "1");
    params.set("limit", "20");

    try {
      const res = await fetch(
        `${API_BASE}/api/dogs?${params.toString()}`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) {
        setDogMessage(data.message || "Failed to load all dogs");
      } else {
        setAllDogs(data.data || []);
      }
    } catch (err) {
      setDogMessage("Error connecting to server while loading all dogs.");
    } finally {
      setLoadingAllDogs(false);
    }
  };

  useEffect(() => {
    loadRegisteredDogs();
    loadAdoptedDogs();
    loadAllDogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegisterDog = async (e) => {
    e.preventDefault();
    setDogMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/dogs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name,
          breed,
          age: age ? Number(age) : undefined,
          description,
          imageUrl: imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDogMessage(data.message || "Failed to register dog");
      } else {
        setDogMessage(`Dog "${data.name}" registered! ID: ${data._id}`);
        setName("");
        setBreed("");
        setAge("");
        setDescription("");
        setImageUrl("");
        loadRegisteredDogs();
        loadAllDogs();
      }
    } catch (err) {
      setDogMessage("Error connecting to server while registering dog.");
    }
  };

  const handleAdoptDog = async (e) => {
    e.preventDefault();
    setAdoptStatus("");

    if (!adoptDogId) {
      setAdoptStatus("Dog ID is required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/dogs/${adoptDogId}/adopt`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: adoptMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdoptStatus(data.message || "Failed to adopt dog");
      } else {
        setAdoptStatus(`You adopted "${data.name}"!`);
        setAdoptDogId("");
        setAdoptMessage("");
        loadRegisteredDogs();
        loadAdoptedDogs();
        loadAllDogs();
      }
    } catch (err) {
      setAdoptStatus("Error connecting to server while adopting dog.");
    }
  };

  const handleAdoptFromList = async (id) => {
    setAdoptStatus("");
    try {
      const res = await fetch(`${API_BASE}/api/dogs/${id}/adopt`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdoptStatus(data.message || "Failed to adopt dog");
      } else {
        setAdoptStatus(`You adopted "${data.name}"!`);
        loadRegisteredDogs();
        loadAdoptedDogs();
        loadAllDogs();
      }
    } catch (err) {
      setAdoptStatus("Error connecting to server while adopting dog.");
    }
  };


  const handleCancelAdoption = async (id) => {
    setAdoptStatus("");

    try {
      const res = await fetch(`${API_BASE}/api/dogs/${id}/cancel-adoption`, {
        method: "POST",
        headers,
        body: JSON.stringify({}), // body isn't required, but it's fine
      });

      const data = await res.json();

      if (!res.ok) {
        setAdoptStatus(data.message || "Failed to cancel adoption");
      } else {
        setAdoptStatus(`You cancelled your adoption of "${data.name}".`);
        loadRegisteredDogs();
        loadAdoptedDogs();
        loadAllDogs();
      }
    } catch (err) {
      setAdoptStatus(
        "Error connecting to server while canceling adoption."
      );
    }
  };


  const handleRemoveDog = async (id) => {
    const confirmRemove = window.confirm("Remove this dog?");
    if (!confirmRemove) return;

    try {
      const res = await fetch(`${API_BASE}/api/dogs/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.status === 204) {
        loadRegisteredDogs();
        loadAllDogs();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to remove dog");
      }
    } catch (err) {
      alert("Error connecting to server while removing dog.");
    }
  };

  const dogMsgIsError =
    dogMessage &&
    (dogMessage.toLowerCase().includes("fail") ||
      dogMessage.toLowerCase().includes("error"));
  const adoptMsgIsError =
    adoptStatus &&
    (adoptStatus.toLowerCase().includes("fail") ||
      adoptStatus.toLowerCase().includes("error"));

  return (
    <section className="card">
      <div className="dashboard-header">
        <h2>Welcome, {username}</h2>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="grid">
        <div>
          <h3>Register a Dog</h3>
          <form onSubmit={handleRegisterDog}>
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Breed
              <input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </label>
            <label>
              Age
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>
            <label>
              Image URL
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/dog.jpg"
              />
            </label>
            <button type="submit">Add Dog</button>
          </form>
          {dogMessage && (
            <p className={`message ${dogMsgIsError ? "error" : ""}`}>
              {dogMessage}
            </p>
          )}
        </div>

        <div>
          <h3>Adopt a Dog by ID</h3>
          <form onSubmit={handleAdoptDog}>
            <label>
              Dog ID
              <input
                value={adoptDogId}
                onChange={(e) => setAdoptDogId(e.target.value)}
                required
              />
            </label>
            <label>
              Message to Owner
              <textarea
                value={adoptMessage}
                onChange={(e) => setAdoptMessage(e.target.value)}
              />
            </label>
            <button type="submit">Adopt</button>
          </form>
          {adoptStatus && (
            <p className={`message ${adoptMsgIsError ? "error" : ""}`}>
              {adoptStatus}
            </p>
          )}
        </div>
      </div>

      <hr />

      <div className="grid">
        <div>
          <h3>My Registered Dogs</h3>
          <div className="filters">
            <label>
              Status
              <select
                value={registeredStatusFilter}
                onChange={(e) => setRegisteredStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="adopted">Adopted</option>
              </select>
            </label>
            <button onClick={loadRegisteredDogs} disabled={loadingRegistered}>
              {loadingRegistered ? "Loading..." : "Refresh"}
            </button>
          </div>
          <ul className="list">
            {registeredDogs.length === 0 ? (
              <li>No registered dogs.</li>
            ) : (
              registeredDogs.map((dog) => (
                <li key={dog._id}>
                  <div>
                    <strong>{dog.name}</strong> ({dog.status}) <br />
                    ID: <code>{dog._id}</code>
                    <br />
                    {dog.description}
                  </div>
                  <div className="actions">
                    {dog.status === "available" && (
                      <button onClick={() => handleRemoveDog(dog._id)}>
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <h3>My Adopted Dogs</h3>
          <button onClick={loadAdoptedDogs} disabled={loadingAdopted}>
            {loadingAdopted ? "Loading..." : "Refresh"}
          </button>
          <ul className="list">
            {adoptedDogs.length === 0 ? (
              <li>No adopted dogs.</li>
            ) : (
              adoptedDogs.map((dog) => (
                <li key={dog._id}>
                  <div>
                    <strong>{dog.name}</strong> ({dog.status}) <br />
                    ID: <code>{dog._id}</code>
                    <br />
                    Message: {dog.adoptionMessage || "—"}
                  </div>
                  <div className="actions">
                    {dog.status === "adopted" && (
                      <button onClick={() => handleCancelAdoption(dog._id)}>
                        Cancel adoption
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>

        </div>
      </div>

      <hr />

      <div>
        <h3>All Dogs on the Platform</h3>
        <div className="filters">
          <label>
            Status
            <select
              value={allStatusFilter}
              onChange={(e) => setAllStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="adopted">Adopted</option>
            </select>
          </label>
          <button onClick={loadAllDogs} disabled={loadingAllDogs}>
            {loadingAllDogs ? "Loading..." : "Refresh"}
          </button>
        </div>
        <ul className="list">
          {allDogs.length === 0 ? (
            <li>No dogs found.</li>
          ) : (
            allDogs.map((dog) => (
              <li key={dog._id}>
                <div className="dog-card">
                  {dog.imageUrl && (
                    <img
                      src={dog.imageUrl}
                      alt={dog.name}
                      className="dog-image"
                    />
                  )}
                  <div>
                    <strong>{dog.name}</strong> ({dog.status}) <br />
                    ID: <code>{dog._id}</code>
                    <br />
                    {dog.description}
                  </div>
                </div>
                <div className="actions">
                  {dog.status === "available" && (
                    <button onClick={() => handleAdoptFromList(dog._id)}>
                      Adopt
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}


export default App;
