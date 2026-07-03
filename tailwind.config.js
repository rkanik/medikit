/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,jsx,ts,tsx}',
		'./providers/**/*.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
	],
	darkMode: 'class',
	presets: [require('nativewind/preset')],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1rem',
				lg: '0',
				xl: '0',
			},
		},
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1320px',
		},
		extend: {
			colors: {
				background: 'rgba(var(--background), 1)',
				foreground: 'rgba(var(--foreground), 1)',
				card: {
					DEFAULT: 'rgba(var(--card), 1)',
					foreground: 'rgba(var(--card-foreground), 1)',
				},
				popover: {
					DEFAULT: 'rgba(var(--popover), 1)',
					foreground: 'rgba(var(--popover-foreground), 1)',
				},
				primary: {
					DEFAULT: 'rgba(var(--primary), 1)',
					foreground: 'rgba(var(--primary-foreground), 1)',
				},
				secondary: {
					DEFAULT: 'rgba(var(--secondary), 1)',
					foreground: 'rgba(var(--secondary-foreground), 1)',
				},
				muted: {
					DEFAULT: 'rgba(var(--muted), 1)',
					foreground: 'rgba(var(--muted-foreground), 1)',
				},
				accent: {
					DEFAULT: 'rgba(var(--accent), 1)',
					foreground: 'rgba(var(--accent-foreground), 1)',
				},
				destructive: {
					DEFAULT: 'rgba(var(--destructive), 1)',
					foreground: 'rgba(var(--destructive-foreground), 1)',
				},
				border: 'rgba(var(--border), 1)',
				input: 'rgba(var(--input), 1)',
				ring: 'rgba(var(--ring), 1)',
				chart: {
					1: 'rgba(var(--chart-1), 1)',
					2: 'rgba(var(--chart-2), 1)',
					3: 'rgba(var(--chart-3), 1)',
					4: 'rgba(var(--chart-4), 1)',
					5: 'rgba(var(--chart-5), 1)',
				},
			},
			boxShadow: {
				custom: '0 2px 8px rgba(0, 0, 0, 0.08)',
			},
		},
	},
	plugins: [],
}
