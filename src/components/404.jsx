import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
export default function FourOhFour() {
  useEffect(() => {
    setInterval(() => setCtime((t) => t - 1), 1000);
  }, []);
  const [ctime, setCtime] = useState(5);
  return ctime !== 0 ? (
    <div className="fourohfourcontainer">
      <h1>404</h1>
      <h2>Whoops, seems like you're lost!</h2>
      <h2>Let's get you back to the safe zone!</h2>
      <h2>Time Left : {ctime} seconds</h2>
    </div>
  ) : (
    <Navigate replace to="/" />
  );
}
