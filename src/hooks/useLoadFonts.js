import { useFonts } from 'expo-font';


export default function useLoadFonts() {
    const [fontsLoaded] = useFonts({
        'Montserrat-Variable': require('../../assets/fonts/Montserrat-VariableFont_wght.ttf'),
        'Montserrat-Italic': require('../../assets/fonts/Montserrat-Italic-VariableFont_wght.ttf'),
        'Montserrat-Regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
      });
  

  return fontsLoaded;
}
