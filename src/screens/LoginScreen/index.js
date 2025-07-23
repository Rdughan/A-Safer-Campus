import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ActivityIndicator } from "react-native";
import InputField from "../../components/TextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import authService from "../../services/authService";
import storage from "../../utils/storage";
import { API_BASE_URL } from '@env';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.replace("Main");
      }
    };
    checkToken();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("LoginScreen");
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    //Add Validation here
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await storage.storeAuthData(data.token, data.user);
        Alert.alert("Login Successful", "You have successfully logged in.", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        navigation.replace("Main");
      } else {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Image
        source={require("./media/abstract.png")}
        style={styles.abstractImage}
      />
      <View style={styles.textContainer}>
        <Text style={styles.helloText}>Hello!</Text>
        <Text style={styles.welcomeText}>Welcome to SaferCampus</Text>
      </View>

      <Image
        source={require("./media/illustration.png")}
        style={styles.illustrationImage}
      />

      <View style={styles.drawerContainer}>
        <Text style={styles.loginText}>Login</Text>

        <View style={styles.inputView}>
          <InputField
            placeholder="Email"
            iconName="email-outline"
            value={email}
            onChangeText={setEmail}
            style={styles.inputOverride}
          />

          <InputField
            placeholder="Password"
            iconName="key-outline"
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
            style={styles.inputOverride}
          />
        </View>

        {error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : null}

        <Text style={styles.forgotText}> Forgot password?</Text>

        <TouchableOpacity
          style={styles.loginContainer}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={styles.signUpTextContainer}>
          <Text style={styles.plainText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#91D8F7',
    width: '100%',
  },
  textContainer: {
    flexDirection: 'column',
    gap: 10,
    top: '10%',
    marginLeft: '10%',
    position: 'absolute',
  },
  helloText: {
    color: 'white',
    fontSize: 40,
    fontFamily: 'Montserrat-Bold',
  },
  welcomeText: {
    color: 'white',
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
  },
  abstractImage: {
    top: -5,
    left: -25,
  },
  drawerContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    height: 660,
    bottom: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    height: 150,
    width: 150,
    right: 10,
    position: 'absolute',
    zIndex: 15,
    top: '20%',
  },
  loginText: {
    color: 'black',
    fontFamily: 'Montserrat-Bold',
    fontSize: 40,
    padding: 5,
    left: 10,
    top: 30,
    position: 'absolute',
  },
  inputOverride: {
    height: 55,
  },
  forgotText: {
    color: '#239DD6',
    marginTop: 130,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 30,
  },
  inputView: {
    gap: 25,
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    top: '20%',
  },
  loginContainer: {
    backgroundColor: '#239DD6',
    width: '60%',
    height: '7%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginTop: 30,
    padding: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
  },
  signUpTextContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  plainText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  linkText:  {
    fontSize: 16,
    color: '#239DD6',
    fontFamily: 'Montserrat-Regular',
  },
});
