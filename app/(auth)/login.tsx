// app/(auth)/login.tsx
import Button from "@/components/Button";
import Input from "@/components/Input";
import Colors from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login, clearAuthError } from "@/redux/slices/authSlice"; // Import clearAuthError
import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert, // Import Alert
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    // Select isAuthenticated as well
    const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    // Effect to handle navigation after successful login (user object changes)
    useEffect(() => {
        if (isAuthenticated && user) {
            // Clear any login errors from Redux state upon successful navigation
            if (error) {
                dispatch(clearAuthError());
            }
            if (user.role === "user") router.replace("/(app)/(user)");
            else if (user.role === "admin") router.replace("/(app)/(admin)");
            else if (user.role === "owner") router.replace("/(app)/(owner)");
        }
    }, [user, isAuthenticated, router, dispatch, error]); // Add error to dependencies

    // Effect to clear Redux error when component mounts or inputs change, if desired
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);


    const handleLogin = async () => {
        console.log('LOGIN BUTTON CLICKED - handleLogin called ONCE'); // For checking multiple dispatches
        // Basic validation
        if (!email || !password) {
            setValidationError("Please fill in all fields");
            return;
        }
        if (!email.includes("@")) {
            setValidationError("Please enter a valid email");
            return;
        }
        setValidationError(null);
        if (error) { // Clear previous Redux error before new attempt
            dispatch(clearAuthError());
        }

        // Dispatch the login thunk
        // The navigation is now handled by the useEffect hook above
        const resultAction = await dispatch(login({ email, password }));

        if (login.rejected.match(resultAction)) {
            // Error is already set in Redux state by the thunk's rejected case
            // You can show an Alert here if you prefer immediate feedback over just the error text display
            // Alert.alert("Login Failed", resultAction.payload as string || "An unknown error occurred.");
        }
    };
    
    const handleDemoLogin = (role: "user" | "admin" | "owner") => {
        console.log(`DEMO LOGIN ATTEMPT: ${role}`);
        let demoEmail = "";
        const demoPassword = "password"; // Assuming this is the demo password

        if (role === "user") demoEmail = "user@example.com";
        else if (role === "admin") demoEmail = "admin@example.com";
        else if (role === "owner") demoEmail = "owner@example.com";

        setEmail(demoEmail); // Update UI fields for clarity
        setPassword(demoPassword);

        if (error) { // Clear previous Redux error
            dispatch(clearAuthError());
        }
        // Dispatch login with demo credentials
        dispatch(login({ email: demoEmail, password: demoPassword }));
        // Navigation will be handled by the useEffect listening to 'user' and 'isAuthenticated'
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
                    <ArrowLeft size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Login to your account</Text>
                </View>

                <View style={styles.formContainer}>
                    {(validationError || error) && ( // Display local validation error or Redux error
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                {validationError || error}
                            </Text>
                        </View>
                    )}

                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        leftIcon={<Mail size={20} color={Colors.light.grey4} />}
                        
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        leftIcon={<Lock size={20} color={Colors.light.grey4} />}
                    />

                    <TouchableOpacity style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPassword}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={isLoading}
                        fullWidth
                    />
                    <View style={styles.demoButtonGroup}>
                        <Button
                            title="Login as User"
                            onPress={() => handleDemoLogin("user")}
                            type="secondary"
                            fullWidth
                        />
                        <Button
                            title="Login as Admin"
                            onPress={() => handleDemoLogin("admin")}
                            type="secondary"
                            fullWidth
                        />
                        <Button
                            title="Login as Owner"
                            onPress={() => handleDemoLogin("owner")}
                            type="secondary"
                            fullWidth
                        />
                    </View>
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>
                            Don't have an account?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(auth)/signup")}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.demoCredentials}>
                    <Text style={styles.demoTitle}>Demo Credentials (Password: password)</Text>
                    <View style={styles.credentialItem}>
                        <Text style={styles.credentialRole}>User:</Text>
                        <Text style={styles.credentialText}>user@example.com</Text>
                    </View>
                    <View style={styles.credentialItem}>
                        <Text style={styles.credentialRole}>Admin:</Text>
                        <Text style={styles.credentialText}>admin@example.com</Text>
                    </View>
                    <View style={styles.credentialItem}>
                        <Text style={styles.credentialRole}>Owner:</Text>
                        <Text style={styles.credentialText}>owner@example.com</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    demoButtonGroup: {
        marginTop: 16,
        gap: 12, 
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        // backgroundColor: '#f0f0f0', // Optional: for better visibility
        // borderRadius: 20,
    },
    headerContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.grey3,
    },
    formContainer: {
        marginBottom: 32,
    },
    errorContainer: {
        backgroundColor: `${Colors.light.danger}1A`, // Danger color with opacity
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.light.danger,
    },
    errorText: {
        color: Colors.light.danger,
        fontSize: 14,
        fontWeight: '500',
    },
    forgotPasswordContainer: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPassword: {
        color: Colors.light.primary,
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    signupText: {
        color: Colors.light.grey3,
        fontSize: 14,
    },
    signupLink: {
        color: Colors.light.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    demoCredentials: {
        padding: 16,
        backgroundColor: Colors.light.divider,
        borderRadius: 8,
        marginTop: 20, // Adjusted margin
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.light.text,
        marginBottom: 8,
    },
    credentialItem: {
        flexDirection: "row",
        marginBottom: 4,
    },
    credentialRole: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.light.grey2,
        width: 50,
    },
    credentialText: {
        fontSize: 12,
        color: Colors.light.grey2,
    },
});
