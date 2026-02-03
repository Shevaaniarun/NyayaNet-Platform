import { useState } from 'react';

export default function App() {
  const [dummy] = useState(0);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">NyayaNet - App (temporary simplified)</h1>
    </div>
  );
}