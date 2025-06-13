import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function App() {
  const message = useQuery(api.messages.list);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      {message || "Loading..."}
    </div>
  );
}

export default App;