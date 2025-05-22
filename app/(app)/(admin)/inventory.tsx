// app/(app)/(admin)/inventory.tsx
import Button from "@/components/Button"; // Your Button component
import Input from "@/components/Input"; // Your Input component
import Colors from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	addBikeThunk,
	clearBikeError,
	deleteBikeThunk,
	fetchAllBikesForAdminThunk,
	updateBikeThunk,
} from "@/redux/slices/bikeSlice";
import { Bike } from "@/types";
import { Edit3, PlusCircle, Trash2, XCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// Define the shape of the form data
interface BikeFormData {
	id?: string; // Present when editing
	model: string;
	category: string;
	pricePerHour: string; // Input as string, convert to number on submit
	pricePerDay: string; // Input as string, convert to number on submit
	images: string[]; // Array of image URLs (comma-separated string in input)
	availability: boolean;
	location: {
		latitude: string; // Input as string
		longitude: string; // Input as string
		address?: string;
	};
}

const initialFormState: BikeFormData = {
	model: "",
	category: "",
	pricePerHour: "",
	pricePerDay: "",
	images: [],
	availability: true,
	location: {
		latitude: "",
		longitude: "",
		address: "",
	},
};

export default function AdminInventoryScreen() {
	const dispatch = useAppDispatch();
	const { allBikesAdmin, isLoading, isMutating, error } = useAppSelector(
		(state) => state.bike
	);
	const authUser = useAppSelector((state) => state.auth.user);

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [currentBike, setCurrentBike] =
		useState<BikeFormData>(initialFormState);
	const [imageInput, setImageInput] = useState(""); // For comma-separated image URLs

	useEffect(() => {
		if (authUser?.role === "admin" || authUser?.role === "owner") {
			// Or just admin
			dispatch(fetchAllBikesForAdminThunk());
		}
		dispatch(clearBikeError());
	}, [dispatch, authUser?.role]);

	const handleOpenModalForAdd = () => {
		setIsEditing(false);
		setCurrentBike(initialFormState);
		setImageInput("");
		setModalVisible(true);
		dispatch(clearBikeError());
	};

	const handleOpenModalForEdit = (bike: Bike) => {
		setIsEditing(true);
		setCurrentBike({
			id: bike.id,
			model: bike.model,
			category: bike.category,
			pricePerHour: bike.pricePerHour.toString(),
			pricePerDay: bike.pricePerDay.toString(),
			images: bike.images,
			availability: bike.availability,
			location: {
				latitude: bike.location.latitude.toString(),
				longitude: bike.location.longitude.toString(),
				address: bike.location.address || "",
			},
		});
		setImageInput(bike.images.join(", "));
		setModalVisible(true);
		dispatch(clearBikeError());
	};

	const handleDeleteBike = (bikeId: string) => {
		Alert.alert(
			"Confirm Delete",
			"Are you sure you want to delete this bike?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						const resultAction = await dispatch(
							deleteBikeThunk(bikeId)
						);
						if (deleteBikeThunk.rejected.match(resultAction)) {
							Alert.alert(
								"Error",
								(resultAction.payload as string) ||
									"Failed to delete bike."
							);
						} else {
							Alert.alert(
								"Success",
								"Bike deleted successfully."
							);
						}
					},
				},
			]
		);
	};

	const handleSubmitForm = async () => {
		// Basic Validation
		if (
			!currentBike.model ||
			!currentBike.category ||
			!currentBike.pricePerHour ||
			!currentBike.pricePerDay ||
			!currentBike.location.latitude ||
			!currentBike.location.longitude
		) {
			Alert.alert(
				"Validation Error",
				"Please fill in all required fields (Model, Category, Prices, Location Coordinates)."
			);
			return;
		}
		if (imageInput.trim() === "") {
			Alert.alert(
				"Validation Error",
				"Please provide at least one image URL."
			);
			return;
		}

		const bikeDataPayload = {
			model: currentBike.model,
			category: currentBike.category,
			pricePerHour: parseFloat(currentBike.pricePerHour),
			pricePerDay: parseFloat(currentBike.pricePerDay),
			images: imageInput
				.split(",")
				.map((url) => url.trim())
				.filter((url) => url),
			availability: currentBike.availability,
			location: {
				latitude: parseFloat(currentBike.location.latitude),
				longitude: parseFloat(currentBike.location.longitude),
				address: currentBike.location.address,
			},
		};

		if (
			isNaN(bikeDataPayload.pricePerHour) ||
			isNaN(bikeDataPayload.pricePerDay) ||
			isNaN(bikeDataPayload.location.latitude) ||
			isNaN(bikeDataPayload.location.longitude)
		) {
			Alert.alert(
				"Validation Error",
				"Prices and location coordinates must be valid numbers."
			);
			return;
		}

		let resultAction;
		if (isEditing && currentBike.id) {
			resultAction = await dispatch(
				updateBikeThunk({
					bikeId: currentBike.id,
					bikeData: bikeDataPayload,
				})
			);
		} else {
			resultAction = await dispatch(
				addBikeThunk(
					bikeDataPayload as Omit<
						Bike,
						"id" | "createdBy" | "createdAt"
					>
				)
			);
		}

		if (
			addBikeThunk.fulfilled.match(resultAction) ||
			updateBikeThunk.fulfilled.match(resultAction)
		) {
			Alert.alert(
				"Success",
				`Bike ${isEditing ? "updated" : "added"} successfully!`
			);
			setModalVisible(false);
		} else {
			Alert.alert(
				"Error",
				(resultAction.payload as string) ||
					`Failed to ${isEditing ? "update" : "add"} bike.`
			);
		}
	};

	const handleInputChange = (
		field: keyof BikeFormData,
		value: string | boolean
	) => {
		setCurrentBike((prev) => ({ ...prev, [field]: value }));
	};

	const handleLocationChange = (
		field: "latitude" | "longitude" | "address",
		value: string
	) => {
		setCurrentBike((prev) => ({
			...prev,
			location: { ...prev.location, [field]: value },
		}));
	};

	const renderBikeItem = ({ item }: { item: Bike }) => (
		<View style={styles.bikeItem}>
			<Image
				source={{
					uri:
						item.images[0] ||
						"https://placehold.co/600x400/eee/ccc?text=No+Image",
				}}
				style={styles.bikeImage}
			/>
			<View style={styles.bikeInfo}>
				<Text style={styles.bikeModel}>
					{item.model}{" "}
					<Text style={styles.bikeCategory}>({item.category})</Text>
				</Text>
				<Text>
					Price/Hr: ₹{item.pricePerHour.toFixed(2)} | Price/Day: ₹
					{item.pricePerDay.toFixed(2)}
				</Text>
				<Text>
					Location:{" "}
					{item.location.address ||
						`${item.location.latitude.toFixed(
							4
						)}, ${item.location.longitude.toFixed(4)}`}
				</Text>
				<Text
					style={
						item.availability
							? styles.available
							: styles.unavailable
					}>
					{item.availability ? "Available" : "Unavailable"}
				</Text>
			</View>
			<View style={styles.bikeActions}>
				<TouchableOpacity
					onPress={() => handleOpenModalForEdit(item)}
					style={styles.actionIcon}>
					<Edit3 size={22} color={Colors.light.primary} />
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => handleDeleteBike(item.id)}
					style={styles.actionIcon}>
					<Trash2 size={22} color={Colors.light.danger} />
				</TouchableOpacity>
			</View>
		</View>
	);

	if (isLoading && allBikesAdmin.length === 0) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={Colors.light.primary} />
				<Text>Loading bikes...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Bike Inventory</Text>
				<Button
					title="Add Bike"
					onPress={handleOpenModalForAdd}
					icon={<PlusCircle size={18} color="white" />}
				/>
			</View>

			{error && !modalVisible && (
				<Text style={styles.errorTextList}>Error: {error}</Text>
			)}

			<FlatList
				data={allBikesAdmin}
				renderItem={renderBikeItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContentContainer}
				refreshing={isLoading}
				onRefresh={() => dispatch(fetchAllBikesForAdminThunk())}
				ListEmptyComponent={
					<View style={styles.centered}>
						<Text>No bikes found in inventory.</Text>
					</View>
				}
			/>

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<ScrollView>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>
									{isEditing ? "Edit Bike" : "Add New Bike"}
								</Text>
								<TouchableOpacity
									onPress={() => setModalVisible(false)}>
									<XCircle size={28} />
								</TouchableOpacity>
							</View>

							{error && modalVisible && (
								<Text style={styles.errorTextModal}>
									Error: {error}
								</Text>
							)}

							<Input
								label="Model"
								value={currentBike.model}
								onChangeText={(text) =>
									handleInputChange("model", text)
								}
								placeholder="e.g., Honda Activa 6G"
							/>
							<Input
								label="Category"
								value={currentBike.category}
								onChangeText={(text) =>
									handleInputChange("category", text)
								}
								placeholder="e.g., Scooter, Mountain Bike"
							/>
							<Input
								label="Price Per Hour (₹)"
								value={currentBike.pricePerHour}
								onChangeText={(text) =>
									handleInputChange("pricePerHour", text)
								}
								keyboardType="numeric"
								placeholder="e.g., 50"
							/>
							<Input
								label="Price Per Day (₹)"
								value={currentBike.pricePerDay}
								onChangeText={(text) =>
									handleInputChange("pricePerDay", text)
								}
								keyboardType="numeric"
								placeholder="e.g., 500"
							/>

							<Text style={styles.formLabel}>
								Image URLs (comma-separated)
							</Text>
							<TextInput
								style={styles.textInputLarge}
								value={imageInput}
								onChangeText={setImageInput}
								placeholder="e.g., https://url1.jpg, https://url2.png"
								multiline
								numberOfLines={3}
							/>

							<Text style={styles.formLabel}>
								Location Latitude
							</Text>
							<TextInput
								style={styles.textInput}
								value={currentBike.location.latitude}
								onChangeText={(text) =>
									handleLocationChange("latitude", text)
								}
								keyboardType="numeric"
								placeholder="e.g., 26.8467"
							/>

							<Text style={styles.formLabel}>
								Location Longitude
							</Text>
							<TextInput
								style={styles.textInput}
								value={currentBike.location.longitude}
								onChangeText={(text) =>
									handleLocationChange("longitude", text)
								}
								keyboardType="numeric"
								placeholder="e.g., 80.9462"
							/>

							<Text style={styles.formLabel}>
								Location Address (Optional)
							</Text>
							<TextInput
								style={styles.textInput}
								value={currentBike.location.address}
								onChangeText={(text) =>
									handleLocationChange("address", text)
								}
								placeholder="e.g., 123 Bike Street, City"
							/>

							<View style={styles.switchContainer}>
								<Text style={styles.formLabel}>Available:</Text>
								<Switch
									trackColor={{
										false: "#767577",
										true: Colors.light.primary,
									}}
									thumbColor={
										currentBike.availability
											? Colors.light.tint
											: "#f4f3f4"
									}
									ios_backgroundColor="#3e3e3e"
									onValueChange={(value) =>
										handleInputChange("availability", value)
									}
									value={currentBike.availability}
								/>
							</View>

							<Button
								title={
									isMutating
										? "Saving..."
										: isEditing
										? "Update Bike"
										: "Add Bike"
								}
								onPress={handleSubmitForm}
								disabled={isMutating}
							/>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

// Need to import Switch
import { Switch } from "react-native";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.divider,
		backgroundColor: "white",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.light.tint,
	},
	listContentContainer: {
		padding: 10,
	},
	bikeItem: {
		backgroundColor: "white",
		borderRadius: 8,
		padding: 15,
		marginVertical: 8,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 2,
	},
	bikeImage: {
		width: 70,
		height: 70,
		borderRadius: 8,
		marginRight: 15,
	},
	bikeInfo: {
		flex: 1,
	},
	bikeModel: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.light.text,
	},
	bikeCategory: {
		fontSize: 13,
	},
	available: {
		color: "green",
		fontSize: 13,
		fontWeight: "500",
		marginTop: 3,
	},
	unavailable: {
		color: "red",
		fontSize: 13,
		fontWeight: "500",
		marginTop: 3,
	},
	bikeActions: {
		flexDirection: "column", // Changed to column for better spacing if icons are small
		justifyContent: "space-around", // Distribute space
		marginLeft: 10,
	},
	actionIcon: {
		padding: 8, // Add padding for easier touch
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		width: "90%",
		maxHeight: "85%",
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
	},
	formLabel: {
		fontSize: 15,
		fontWeight: "500",
		color: Colors.light.text,
		marginTop: 10,
		marginBottom: 5,
	},
	textInput: {
		// Style for regular TextInput if not using custom Input component for all
		borderWidth: 1,
		borderColor: Colors.light.divider,
		padding: 10,
		borderRadius: 5,
		marginBottom: 10,
		fontSize: 15,
	},
	textInputLarge: {
		borderWidth: 1,
		borderColor: Colors.light.divider,
		padding: 10,
		borderRadius: 5,
		marginBottom: 10,
		fontSize: 15,
		minHeight: 60,
		textAlignVertical: "top",
	},
	switchContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginVertical: 15,
	},
	errorTextList: {
		color: "red",
		textAlign: "center",
		paddingVertical: 10,
	},
	errorTextModal: {
		color: "red",
		marginBottom: 10,
	},
});
