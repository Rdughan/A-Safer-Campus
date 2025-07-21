import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import InputField from "../../components/TextInput";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from '../../context/AuthContext';


const SignUpScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const [Confirmpassword, setConfirmPassword] = useState("");
  const [Phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // API Configuration - Make sure this matches your server
  const API_BASE_URL = process.env.IP_ADDRESS || "http://192.168.118.95:5000";
  const API_TIMEOUT = 30000; // 30 seconds

  // Enhanced validation function
  const validateInput = () => {
    console.log("=== VALIDATING INPUT ===");
    setMessage("");

    if (!username || !email || !password || !Confirmpassword) {
      console.log("Validation failed: All fields are required");
      setMessage("All fields are required");
      return false;
    }

    // Username validation
    if (!username.trim()) {
      console.log("Validation failed: Username is required");
      setMessage("Username is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      console.log("Validation failed: Email is required");
      setMessage("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      console.log("Validation failed: Invalid email format");
      setMessage("Please enter a valid email address");
      return false;
    }

    // Password strength validation
    if (!password) {
      console.log("Validation failed: Password is required");
      setMessage("Password is required");
      return false;
    }
    if (password.length < 8) {
      console.log("Validation failed: Password too short");
      setMessage("Password must be at least 8 characters long");
      return false;
    }

    // Password confirmation
    if (!Confirmpassword) {
      console.log("Validation failed: Confirm password is required");
      setMessage("Please confirm your password");
      return false;
    }
    if (password !== Confirmpassword) {
      console.log("Validation failed: Passwords do not match");
      setMessage("Passwords do not match");
      return false;
    }

    // Phone validation (optional but if provided, must be valid)
    if (Phone && Phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(Phone)) {
        console.log("Validation failed: Invalid phone format");
        setMessage("Please enter a valid phone number");
        return false;
      }
    }

    console.log("✅ Validation passed");
    return true;
  };

  // Enhanced fetch with timeout
  const fetchWithTimeout = async (url, options, timeout = API_TIMEOUT) => {
    console.log(`Making request to: ${url}`);
    console.log(`Request options:`, {
      ...options,
      body: options.body ? "[REQUEST BODY]" : undefined,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Request timeout reached");
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, response.headers);

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Fetch error:", error);
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  };

  // Retry mechanism
  const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== ATTEMPT ${attempt}/${maxRetries} ===`);
        return await fetchWithTimeout(url, options);
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Enhanced handleSignUp function
  const handleSignUp = async () => {
    console.log("=== STARTING REGISTRATION ===");

    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    setMessage("Creating account...");

    try {
      const requestBody = {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        studentId: studentID.trim(),
        phone: Phone.trim() || null,
      };

      console.log("Request body:", { ...requestBody, password: "[HIDDEN]" });

      // First, test the connection
      console.log("Testing server connection...");
      setMessage("Testing server connection...");

      // Proceed with registration
      console.log("Proceeding with registration...");
      const response = await fetchWithRetry(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Registration response status:", response.status);
      console.log("Registration response headers:", response.headers);

      let data;
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("Registration response data:", data);
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.log("Non-JSON response text:", text);
        data = { message: text || "Unknown response format" };
      }

      if (response.ok) {
        console.log("✅ Registration successful!");
        setMessage("Registration successful!");

        // Show success alert
        Alert.alert(
          "Success",
          "Account created successfully! Redirecting to login...",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );

        navigation.navigate("Login");
        
        
      } else {
        // Handle HTTP error responses
        const errorMessage =
          data.message || `Registration failed (${response.status})`;
        console.error("❌ Registration failed:", errorMessage);
        setMessage(errorMessage);

        // Show detailed error
        Alert.alert(
          "Registration Failed",
          `Error: ${errorMessage}\n\nStatus: ${response.status}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("=== REGISTRATION ERROR ===");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      let errorMessage = "Registration failed. Please try again.";

      if (error.message === "Request timeout") {
        errorMessage =
          "Server is taking too long to respond. Please check your internet connection and try again.";
      } else if (
        error.message.includes("Network request failed") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Cannot connect to server. Please check:\n• Your internet connection\n• Server is running at " +
          API_BASE_URL +
          "\n• Server address is correct";
      } else if (
        error.name === "TypeError" &&
        error.message.includes("Network")
      ) {
        errorMessage =
          "Network error. Please check your connection and server status.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      setMessage(errorMessage);

      // Show detailed error alert
      Alert.alert(
        "Registration Failed",
        `${errorMessage}\n\nTechnical details:\n• Server: ${API_BASE_URL}\n• Error: ${error.name}: ${error.message}`,
        [
          { text: "Retry", onPress: handleSignUp },
          { text: "Test Connection", onPress: testConnection },
          { text: "Cancel" },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced connection test function
  const testConnection = async () => {
    console.log("=== TESTING CONNECTION ===");
    setMessage("Testing connection...");

    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/auth/test`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Connection test successful:", data);
        setMessage("Server is reachable!");
        Alert.alert("Connection Test", "Server is reachable!", [
          { text: "OK" },
        ]);
      } else {
        const errorText = await response.text();
        console.error("Connection test failed:", errorText);
        setMessage(`Connection failed (${response.status}): ${errorText}`);
        Alert.alert("Connection Test Failed", `Error: ${errorText}`, [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error during connection test:", error);
      setMessage(`Connection test failed: ${error.message}`);
      Alert.alert("Connection Test Failed", `Error: ${error.message}`, [
        { text: "OK" },
      ]);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("./media/abstract.png")}
          style={styles.abstractImage}
        />

        <ScrollView style={styles.drawerContainer}>
          <TouchableOpacity
            style={styles.backToLoginView}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
            <Text style={styles.backText}>Back to login</Text>
          </TouchableOpacity>

          <Text style={styles.signUpText}>Sign Up</Text>

          {message ? (
            <Text
              style={[
                styles.messageText,
                {
                  color:
                    message === "Registration successful!"
                      ? "green"
                      : message.includes("Creating account") ||
                        message.includes("Testing") ||
                        message.includes("connected")
                      ? "#239DD6"
                      : "red",
                },
              ]}
            >
              {message}
            </Text>
          ) : null}

          <View style={styles.inputView}>
            <InputField
              name="username"
              placeholder="Username"
              iconName="account-outline"
              value={username}
              onChangeText={setUsername}
              style={styles.inputOverride}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              name="email"
              placeholder="Email"
              iconName="email-outline"
              value={email}
              onChangeText={setEmail}
              style={styles.inputOverride}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              name="studentID"
              placeholder="Student ID"
              iconName="account-outline"
              value={studentID}
              onChangeText={setStudentID}
              style={styles.inputOverride}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              name="password"
              placeholder="Password"
              iconName="key-outline"
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
              style={styles.inputOverride}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              name="confirmPassword"
              placeholder="Confirm Password"
              iconName="key-outline"
              value={Confirmpassword}
              secureTextEntry={true}
              onChangeText={setConfirmPassword}
              style={styles.inputOverride}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              name="phone"
              placeholder="Phone (Optional)"
              iconName="phone-outline"
              value={Phone}
              onChangeText={setPhone}
              style={styles.inputOverride}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginContainer, { opacity: isLoading ? 0.6 : 1 }]}
            activeOpacity={0.7}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Debug/Test button */}

          {/* Debug info */}
        </ScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#91D8F7",
    width: "100%",
  },
  drawerContainer: {
    width: "100%",
    backgroundColor: "white",
    position: "absolute",
    // height: "80%",
    bottom: 0,
    borderRadius: 20,
    paddingBottom: 40,
  },
  backText: {
    fontFamily: "Montserrat-Regular",
  },
  signUpText: {
    color: "black",
    fontFamily: "Montserrat-Bold",
    fontSize: 40,
    padding: "20px",
    left: 10,
    top: 50,
    position: "absolute",
  },
  messageText: {
    textAlign: "center",
    marginTop: 10,
    marginHorizontal: 20,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  inputView: {
    marginTop: 90,
    marginBottom: 20,
  },
  inputOverride: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  loginContainer: {
    backgroundColor: "#239DD6",
    marginHorizontal: 40,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 20,
    fontFamily: "Montserrat-Regular",
  },
  backToLoginView: {
    flexDirection: "row",
    alignItems: "center",
    left: 20,
    top: 20,
    gap: 10,
  },
  abstractImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  debugContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Montserrat-Regular",
    marginBottom: 2,
  },
});
