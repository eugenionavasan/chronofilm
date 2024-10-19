import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        '1-color': { 400: '#FCA5A5', 600: '#EF4444' },  // Red
        '2-color': { 400: '#FCD34D', 600: '#F59E0B' },  // Yellow
        '3-color': { 400: '#60A5FA', 600: '#3B82F6' },  // Blue
        '4-color': { 400: '#A78BFA', 600: '#8B5CF6' },  // Purple
        '5-color': { 400: '#34D399', 600: '#10B981' },  // Green
        '6-color': { 400: '#FB923C', 600: '#F97316' },  // Orange
        '7-color': { 400: '#F472B6', 600: '#EC4899' },  // Pink
        '8-color': { 400: '#C084FC', 600: '#A855F7' },  // Violet
        '9-color': { 400: '#4ADE80', 600: '#22C55E' },  // Lime Green
        '10-color': { 400: '#F87171', 600: '#DC2626' }, // Dark Red
      },
      fontFamily: {
        corleone:["var(--font-corleone)"] 
      },
    },
  },
  plugins: [],
};
export default config;
