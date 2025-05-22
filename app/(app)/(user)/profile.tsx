import Button from "@/components/Button";
import DocumentCard from "@/components/DocumentCard";
import UserProfileHeader from "@/components/UserProfileHeader";
import Colors from "@/constants/Colors";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import {
	fetchUserDocuments,
	uploadDocument,
} from "@/redux/slices/documentSlice";
import { router } from "expo-router";
import {
	AlertTriangle,
	FileText,
	IdCard,
	LogOut,
	Upload,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
	Alert,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ProfileScreen() {
	const dispatch = useAppDispatch();
	const { user, documentStatus } = useAppSelector((state) => state.auth);
	const { userDocuments, isLoading } = useAppSelector(
		(state) => state.documents
	);
	const imagePicker = useImagePicker();

	const [uploadType, setUploadType] = useState<
		"idCard" | "drivingLicense" | null
	>(null);
	const [uploadSide, setUploadSide] = useState<"front" | "back" | null>(null);

	useEffect(() => {
		if (user?.id) {
			dispatch(fetchUserDocuments(user.id));
		}
	}, [dispatch, user]);

	const handleLogout = () => {
		dispatch(logout());
		router.replace("/");
	};

	const openImagePicker = async (
		type: "idCard" | "drivingLicense",
		side: "front" | "back"
	) => {
		setUploadType(type);
		setUploadSide(side);
		await imagePicker.pickImage();
	};

	useEffect(() => {
		const shouldUpload =
			imagePicker.uri && uploadType && uploadSide && user?.id;

		if (!shouldUpload) return;

		dispatch(
			uploadDocument({
				userId: user.id,
				uri: imagePicker.uri!,
				type: uploadType,
				side: uploadSide,
			})
		);

		imagePicker.resetImage();
		setUploadType(null);
		setUploadSide(null);

		Alert.alert(
			"Document Uploaded",
			"Your document has been submitted for verification. You will be notified once it's approved.",
			[{ text: "OK" }]
		);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imagePicker.uri, uploadType, uploadSide, user?.id]);

	const getDocumentStatus = () => {
		if (!documentStatus) return null;

		let color, text, icon;
		switch (documentStatus) {
			case "approved":
				color = Colors.light.tertiary;
				text = "Your documents have been approved";
				icon = <FileText size={20} color={Colors.light.tertiary} />;
				break;
			case "pending":
				color = Colors.light.warning;
				text = "Your documents are pending approval";
				icon = <AlertTriangle size={20} color={Colors.light.warning} />;
				break;
			case "rejected":
				color = Colors.light.danger;
				text = "Your documents were rejected. Please upload new ones.";
				icon = <AlertTriangle size={20} color={Colors.light.danger} />;
				break;
			default:
				return null;
		}

		return (
			<View
				style={[
					styles.statusBanner,
					{ backgroundColor: `${color}15` },
				]}>
				{icon}
				<Text style={[styles.statusText, { color }]}>{text}</Text>
			</View>
		);
	};

	const hasUploadedFrontId = userDocuments.some(
		(doc) => doc.type === "idCard" && doc.side === "front"
	);
	const hasUploadedBackId = userDocuments.some(
		(doc) => doc.type === "idCard" && doc.side === "back"
	);
	const hasUploadedFrontLicense = userDocuments.some(
		(doc) => doc.type === "drivingLicense" && doc.side === "front"
	);
	const hasUploadedBackLicense = userDocuments.some(
		(doc) => doc.type === "drivingLicense" && doc.side === "back"
	);

	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Text style={styles.title}>Profile</Text>
					<TouchableOpacity
						style={styles.logoutButton}
						onPress={handleLogout}>
						<LogOut size={20} color={Colors.light.danger} />
					</TouchableOpacity>
				</View>

				{user && (
					<UserProfileHeader user={user} onEditPress={() => {}} />
				)}

				{getDocumentStatus()}

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>ID Verification</Text>
					<Text style={styles.sectionDescription}>
						Please upload clear images of your ID documents. This is
						required for bike rentals.
					</Text>

					<View style={styles.documentUploadContainer}>
						<View style={styles.documentTypeContainer}>
							<View style={styles.documentTypeHeader}>
								<IdCard size={20} color={Colors.light.text} />
								<Text style={styles.documentTypeTitle}>
									ID Card
								</Text>
							</View>

							<View style={styles.documentUploadButtons}>
								<TouchableOpacity
									style={[
										styles.uploadButton,
										hasUploadedFrontId &&
											styles.uploadedButton,
									]}
									onPress={() =>
										openImagePicker("idCard", "front")
									}>
									<Upload
										size={20}
										color={
											hasUploadedFrontId
												? Colors.light.tertiary
												: Colors.light.grey3
										}
									/>
									<Text
										style={[
											styles.uploadButtonText,
											hasUploadedFrontId &&
												styles.uploadedButtonText,
										]}>
										{hasUploadedFrontId
											? "Front Uploaded"
											: "Upload Front"}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.uploadButton,
										hasUploadedBackId &&
											styles.uploadedButton,
									]}
									onPress={() =>
										openImagePicker("idCard", "back")
									}>
									<Upload
										size={20}
										color={
											hasUploadedBackId
												? Colors.light.tertiary
												: Colors.light.grey3
										}
									/>
									<Text
										style={[
											styles.uploadButtonText,
											hasUploadedBackId &&
												styles.uploadedButtonText,
										]}>
										{hasUploadedBackId
											? "Back Uploaded"
											: "Upload Back"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.documentTypeContainer}>
							<View style={styles.documentTypeHeader}>
								<FileText size={20} color={Colors.light.text} />
								<Text style={styles.documentTypeTitle}>
									Driving License
								</Text>
							</View>

							<View style={styles.documentUploadButtons}>
								<TouchableOpacity
									style={[
										styles.uploadButton,
										hasUploadedFrontLicense &&
											styles.uploadedButton,
									]}
									onPress={() =>
										openImagePicker(
											"drivingLicense",
											"front"
										)
									}>
									<Upload
										size={20}
										color={
											hasUploadedFrontLicense
												? Colors.light.tertiary
												: Colors.light.grey3
										}
									/>
									<Text
										style={[
											styles.uploadButtonText,
											hasUploadedFrontLicense &&
												styles.uploadedButtonText,
										]}>
										{hasUploadedFrontLicense
											? "Front Uploaded"
											: "Upload Front"}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.uploadButton,
										hasUploadedBackLicense &&
											styles.uploadedButton,
									]}
									onPress={() =>
										openImagePicker(
											"drivingLicense",
											"back"
										)
									}>
									<Upload
										size={20}
										color={
											hasUploadedBackLicense
												? Colors.light.tertiary
												: Colors.light.grey3
										}
									/>
									<Text
										style={[
											styles.uploadButtonText,
											hasUploadedBackLicense &&
												styles.uploadedButtonText,
										]}>
										{hasUploadedBackLicense
											? "Back Uploaded"
											: "Upload Back"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>

				{userDocuments.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Uploaded Documents
						</Text>
						{userDocuments.map((document) => (
							<DocumentCard
								key={document.id}
								document={document}
							/>
						))}
					</View>
				)}

				<View style={styles.buttonsContainer}>
					<Button
						title="Logout"
						type="danger"
						onPress={handleLogout}
						icon={<LogOut size={18} color="white" />}
						fullWidth
					/>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F9FA",
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 60,
		paddingBottom: 16,
		backgroundColor: "white",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: Colors.light.text,
	},
	logoutButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: `${Colors.light.danger}15`,
		justifyContent: "center",
		alignItems: "center",
	},
	section: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginHorizontal: 16,
		marginTop: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: Colors.light.text,
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		color: Colors.light.grey3,
		marginBottom: 16,
	},
	statusBanner: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		marginHorizontal: 16,
		marginTop: 16,
		borderRadius: 8,
	},
	statusText: {
		fontSize: 14,
		fontWeight: "500",
		marginLeft: 8,
		flex: 1,
	},
	documentUploadContainer: {
		marginBottom: 8,
	},
	documentTypeContainer: {
		marginBottom: 16,
	},
	documentTypeHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	documentTypeTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.light.text,
		marginLeft: 8,
	},
	documentUploadButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	uploadButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F0F0F0",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		width: "48%",
	},
	uploadedButton: {
		backgroundColor: `${Colors.light.tertiary}15`,
	},
	uploadButtonText: {
		fontSize: 14,
		fontWeight: "500",
		color: Colors.light.grey3,
		marginLeft: 8,
	},
	uploadedButtonText: {
		color: Colors.light.tertiary,
	},
	buttonsContainer: {
		padding: 16,
		marginBottom: Platform.OS === "ios" ? 32 : 16,
	},
});
