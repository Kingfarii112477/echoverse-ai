import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.echoverse.app',
  appName: 'EchoVerse AI',
  webDir: 'out',   // Next.js static export goes to /out
  server: {
    androidScheme: 'https',
    // For development, use the live-reload server:
    // url: 'http://10.0.2.2:3000',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a1013',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a1013',
    },
  },
};

export default config;
