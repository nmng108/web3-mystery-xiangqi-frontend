import type { Config } from 'tailwindcss'
import withMT from '@material-tailwind/react/utils/withMT';
// import withMT from '@material-tailwind/html/utils/withMT';

export default withMT({
  content: ["index.html", "src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'main-img': "url('https://d2g1zxtf4l76di.cloudfront.net/images/new-ui/light-bg.svg')"
      }
    },
  },
  plugins: [],
  important: '#root',
  corePlugins: {
    preflight: false, // Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
  }
} as Config)

