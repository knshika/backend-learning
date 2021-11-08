import { useState } from "react";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function registerUser(event) {
    event.preventDefault();

    const response = await fetch("http://localhost:1337/api/login ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.user) {
      localStorage.setItem("token", data.user);
      alert("Successfully logged in");
      window.location.href = "/dashboard";
    } else {
      alert("Something is wrong!! Check your email or password");
    }

    console.log(data);
  }

  return (
    <div className="App">
      <h1 className="Heading">Login </h1>
      <form className="App-header" onSubmit={registerUser}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" placeholder="Submit" />
      </form>
    </div>
  );
}

export default Login;
