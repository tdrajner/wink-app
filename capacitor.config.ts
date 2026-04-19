// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.winkapp.app',
  appName: 'Wink',
  webDir: 'dist',
  server: {
    // Durante desarrollo podés usar tu IP local para ver cambios en tiempo real
    // Descomentá y cambiá por tu IP cuando pruebes en el celular físico:
    // url: 'http://192.168.1.100:5173',
    // cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#D85A30',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#D85A30',
    },
  },
}

export default config
