/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'sos-blue': '#0066FF',
        'sos-slate-50': '#F8FAFC',
        'sos-slate-100': '#F1F5F9',
        'sos-slate-200': '#E2E8F0',
        'sos-slate-300': '#CBD5E1',
        'sos-slate-400': '#94A3B8',
        'sos-slate-500': '#64748B',
        'sos-slate-600': '#475569',
        'sos-slate-700': '#334155',
        'sos-slate-800': '#1E293B',
        'sos-slate-900': '#0F172A',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
