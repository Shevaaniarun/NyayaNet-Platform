/// <reference types="vite/client" />

// Explicitly declare common Vite env keys used across the frontend
interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_API_URL?: string;
	// add other VITE_ keys here as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
