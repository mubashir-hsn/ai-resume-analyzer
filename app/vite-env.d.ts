/// <reference types="vite/client" />

// This declaration tells TypeScript how to handle imports ending with '?url'
// which are special imports in Vite for assets.
declare module '*?url' {
    const content: string;
    export default content;
  }
  
  // Optional: If you also use '?raw' for importing text files as strings
  declare module '*?raw' {
    const content: string;
    export default content;
  }