/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      screens: {
        '2xs': '360px',
      },
      transitionDuration: {
        '500': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      colors: {
        green__:
          "#89C540",
        gren: "#89C443",
        black_: "#202124",
        green_: "#C1DAD6",
        gray_: "#EEEEEE",
        text_color: "#B4B8BC",
        gray_light: '#F5F5F5',
        lightyellow: '#FFEE22',
        lightgreen: '#90EE90',
        lightcoral: '#F08080',
        lightblue: '#ADD8E6',
        lightsalmon: '#FFA07A',
        grn: "#BBF7D0"
      },
      keyframes: {
        foldIn: {
          '0%': {
            transform: 'scale(0) rotateX(90deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(0.9) rotateX(10deg)',
            opacity: '0.5',
          },
          '100%': {
            transform: 'scale(1) rotateX(0deg)',
            opacity: '1',
          },
        },
      },
      animation: {
        foldIn: 'foldIn 1s ease-out',
      },
    },
  },
  plugins: [],
}