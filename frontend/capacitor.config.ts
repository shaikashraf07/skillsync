import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skillsync.app',
  appName: 'SkillSync',
  webDir: 'dist',
  server: {
    // For development: point to your local dev server
    // Uncomment the line below when testing locally with `npm run dev`
    // url: 'http://YOUR_LOCAL_IP:8080',

    // For production: the app loads from the bundled dist/ files
    // and API calls go to your deployed backend
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content for development
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
    },
  },
};

export default config;
