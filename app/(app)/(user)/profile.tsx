// app/(app)/(user)/profile.tsx
import Button from "@/components/Button";
import Input from "@/components/Input";
import Colors from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	fetchUserProfile,
	logout,
	updateProfile,
} from "@/redux/slices/authSlice";
import { fetchUserDocumentsThunk } from "@/redux/slices/documentSlice"; // Import this
import { User } from "@/types";
import { Link, router } from "expo-router"; // Import Link
import React, {
	useEffect,
	useState, // ... other imports
} from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function ProfileScreen() {
	const dispatch = useAppDispatch();
	const {
		user,
		isLoading: authLoading,
		error: authError,
	} = useAppSelector((state) => state.auth);
	// Get document status from user object, or from documentSlice if you prefer more detail
	const { userDocuments, isLoading: docsLoading } = useAppSelector(
		(state) => state.documents
	);

	const [fullName, setFullName] = useState(user?.fullName || "");
	const [phone, setPhone] = useState(user?.phone || "");

	useEffect(() => {
		if (!user) {
			dispatch(fetchUserProfile());
		} else {
			setFullName(user.fullName || "");
			setPhone(user.phone || "");
		}
		// Fetch user's documents to display status or list
		dispatch(fetchUserDocumentsThunk());
	}, [dispatch, user]);

	useEffect(() => {
		if (user) {
			setFullName(user.fullName || "");
			setPhone(user.phone || "");
		}
	}, [user]);

	const handleUpdateProfile = async () => {
		const profileData: Partial<User> = {};
		if (fullName !== user?.fullName) profileData.fullName = fullName;
		if (phone !== user?.phone) profileData.phone = phone;

		if (Object.keys(profileData).length > 0) {
			const resultAction = await dispatch(updateProfile(profileData));
			if (updateProfile.fulfilled.match(resultAction)) {
				Alert.alert("Success", "Profile updated successfully!");
			} else {
				Alert.alert(
					"Error",
					resultAction.payload || "Failed to update profile."
				);
			}
		} else {
			Alert.alert("Info", "No changes to update.");
		}
	};

	const handleLogout = () => {
		dispatch(logout());
		router.replace("/(auth)/login");
	};

	const getOverallDocumentStatus = () => {
		if (user?.idProofApproved)
			return <Text style={{ color: "green" }}>Approved</Text>;
		if (user?.idProofSubmitted) {
			// Submitted but not yet approved
			const pendingDoc = userDocuments.find(
				(doc) => doc.status === "pending"
			);
			if (pendingDoc)
				return (
					<Text style={{ color: "orange" }}>Pending Approval</Text>
				);
			const rejectedDoc = userDocuments.find(
				(doc) => doc.status === "rejected"
			);
			if (rejectedDoc)
				return (
					<Text style={{ color: "red" }}>
						Rejected (Please re-upload)
					</Text>
				);
			return <Text style={{ color: "orange" }}>Processing</Text>; // Fallback if submitted but no specific status found
		}
		return <Text style={{ color: "red" }}>Not Submitted</Text>;
	};

	if (authLoading && !user) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color={Colors.light.tint} />
			</View>
		);
	}

	if (authError && !user) {
		return (
			<View style={styles.container}>
				<Text>Error loading profile: {authError}</Text>
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.container}>
				<Text>
					No user data available. Please try logging in again.
				</Text>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}>
			<Text style={styles.title}>My Profile</Text>

			<View style={styles.infoContainer}>
				<Text style={styles.label}>Email:</Text>
				<Text style={styles.value}>{user.email}</Text>
			</View>

			<View style={styles.infoContainer}>
				<Text style={styles.label}>Role:</Text>
				<Text style={styles.value}>{user.role}</Text>
			</View>

			<Input
				label="Full Name"
				value={fullName}
				onChangeText={setFullName}
				placeholder="Enter your full name"
			/>
			<Input
				label="Phone Number"
				value={phone}
				onChangeText={setPhone}
				placeholder="Enter your phone number"
				keyboardType="phone-pad"
			/>

			{authLoading && <Text style={styles.loadingText}>Updating...</Text>}
			{authError && <Text style={styles.errorText}>{authError}</Text>}

			<Button
				title="Update Profile"
				onPress={handleUpdateProfile}
				disabled={authLoading}
			/>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>ID Verification</Text>
				<View style={styles.statusContainer}>
					<Text style={styles.statusLabel}>Status: </Text>
					{docsLoading && !user.idProofSubmitted ? (
						<ActivityIndicator size="small" />
					) : (
						getOverallDocumentStatus()
					)}
				</View>
				{/* This is the Link causing the TypeScript error if the route isn't recognized */}
				<Link href={"/(app)/(user)/upload-documents" as any} asChild>
					<Button
						title={
							user.idProofSubmitted
								? "View/Update Documents"
								: "Upload Documents"
						}
						style={styles.docButton}
					/>
				</Link>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Wallet</Text>
				<Text>
					Balance: ₹{user.walletBalance?.toFixed(2) || "0.00"}
				</Text>
			</View>

			<View style={{ marginTop: 30, marginBottom: 20 }}>
				<Button title="Logout" onPress={handleLogout} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	contentContainer: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
		color: Colors.light.tint,
	},
	infoContainer: {
		flexDirection: "row",
		marginBottom: 10,
		alignItems: "center",
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginRight: 10,
		width: 80,
	},
	value: {
		fontSize: 16,
	},
	section: {
		marginTop: 20,
		paddingVertical: 15,
		borderTopWidth: 1,
		borderTopColor: "#eee",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	statusLabel: {
		fontSize: 16,
		fontWeight: "600",
	},
	docButton: {
		marginTop: 10,
		backgroundColor: Colors.light.secondary || "#5cb85c", // Example secondary color
	},
	loadingText: {
		textAlign: "center",
		marginVertical: 10,
		color: "blue",
	},
	errorText: {
		textAlign: "center",
		marginVertical: 10,
		color: "red",
	},
});
