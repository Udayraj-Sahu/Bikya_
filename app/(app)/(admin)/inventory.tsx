import Button from "@/components/Button";
import Colors from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	deleteBike,
	fetchBikes,
	setSelectedBike,
} from "@/redux/slices/bikeSlice";
import { Bike } from "@/types";
import { useRouter } from "expo-router";
import debounce from "lodash/debounce";
import {
	Edit,
	MapPin,
	PlusCircle,
	Search,
	SlidersHorizontal,
	Trash2,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	FlatList,
	Image,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function InventoryScreen() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { bikes, isLoading, error } = useAppSelector((state) => state.bikes);
	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const hasFetchedBikes = useRef(false);

	useEffect(() => {
		if (!hasFetchedBikes.current) {
			console.log("Fetching bikes");
			dispatch(fetchBikes());
			hasFetchedBikes.current = true;
		}
	}, [dispatch]);

	const onRefresh = async () => {
		setRefreshing(true);
		await dispatch(fetchBikes());
		setRefreshing(false);
	};

	const handleAddBike = () => {
		router.push("/(app)/(admin)/inventory/add-bike" as any);
	};

	const handleEditBike = useCallback(
		(bike: Bike) => {
			console.log("Editing bike:", bike.id);
			dispatch(setSelectedBike(bike));
			router.push("/(app)/(admin)/inventory/edit-bike" as any);
		},
		[dispatch]
	);
	const handleDeleteBike = useCallback(
		debounce((bike: Bike) => {
			console.log("Triggering delete alert for bike:", bike.id);
			Alert.alert(
				"Delete Bike",
				`Are you sure you want to delete ${bike.model}?`,
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						onPress: () => {
							console.log("Deleting bike:", bike.id);
							dispatch(deleteBike(bike.id));
						},
						style: "destructive",
					},
				]
			);
		}, 300),
		[dispatch]
	);
	const renderBikeItem = useCallback(
		({ item }: { item: Bike }) => (
			<View style={styles.bikeCard}>
				<Image
					source={{ uri: item.images[0] }}
					style={styles.bikeImage}
				/>
				<View style={styles.bikeContent}>
					<View style={styles.bikeHeader}>
						<Text style={styles.bikeModel} numberOfLines={1}>
							{item.model}
						</Text>
						<View style={styles.categoryContainer}>
							<Text style={styles.categoryText}>
								{item.category}
							</Text>
						</View>
					</View>

					<View style={styles.locationContainer}>
						<MapPin size={14} color={Colors.light.grey4} />
						<Text style={styles.locationText} numberOfLines={1}>
							{item.location.address || "Location unavailable"}
						</Text>
					</View>

					<View style={styles.priceContainer}>
						<Text style={styles.price}>
							₹{item.pricePerHour}/hour
						</Text>
						<Text style={styles.price}>
							₹{item.pricePerDay}/day
						</Text>
					</View>

					<View style={styles.availabilityContainer}>
						<View
							style={[
								styles.availabilityBadge,
								{
									backgroundColor: item.available
										? `${Colors.light.tertiary}15`
										: `${Colors.light.danger}15`,
								},
							]}>
							<Text
								style={[
									styles.availabilityText,
									{
										color: item.available
											? Colors.light.tertiary
											: Colors.light.danger,
									},
								]}>
								{item.available ? "Available" : "Unavailable"}
							</Text>
						</View>
					</View>

					<View style={styles.actionsContainer}>
						<TouchableOpacity
							style={[styles.actionButton, styles.editButton]}
							onPress={() => handleEditBike(item)}>
							<Edit size={16} color={Colors.light.secondary} />
							<Text style={styles.editButtonText}>Edit</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.deleteButton]}
							onPress={() => handleDeleteBike(item)}>
							<Trash2 size={16} color={Colors.light.danger} />
							<Text style={styles.deleteButtonText}>Delete</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		),
		[handleEditBike, handleDeleteBike]
	);

	const filteredBikes = searchQuery
		? bikes.filter(
				(bike) =>
					bike.model
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					bike.category
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
		  )
		: bikes;

	// const renderBikeItem = ({ item }: { item: Bike }) => (
	// 	<View style={styles.bikeCard}>
	// 		<Image source={{ uri: item.images[0] }} style={styles.bikeImage} />
	// 		<View style={styles.bikeContent}>
	// 			<View style={styles.bikeHeader}>
	// 				<Text style={styles.bikeModel} numberOfLines={1}>
	// 					{item.model}
	// 				</Text>
	// 				<View style={styles.categoryContainer}>
	// 					<Text style={styles.categoryText}>{item.category}</Text>
	// 				</View>
	// 			</View>

	// 			<View style={styles.locationContainer}>
	// 				<MapPin size={14} color={Colors.light.grey4} />
	// 				<Text style={styles.locationText} numberOfLines={1}>
	// 					{item.location.address || "Location unavailable"}
	// 				</Text>
	// 			</View>

	// 			<View style={styles.priceContainer}>
	// 				<Text style={styles.price}>₹{item.pricePerHour}/hour</Text>
	// 				<Text style={styles.price}>₹{item.pricePerDay}/day</Text>
	// 			</View>

	// 			<View style={styles.availabilityContainer}>
	// 				<View
	// 					style={[
	// 						styles.availabilityBadge,
	// 						{
	// 							backgroundColor: item.available
	// 								? `${Colors.light.tertiary}15`
	// 								: `${Colors.light.danger}15`,
	// 						},
	// 					]}>
	// 					<Text
	// 						style={[
	// 							styles.availabilityText,
	// 							{
	// 								color: item.available
	// 									? Colors.light.tertiary
	// 									: Colors.light.danger,
	// 							},
	// 						]}>
	// 						{item.available ? "Available" : "Unavailable"}
	// 					</Text>
	// 				</View>
	// 			</View>

	// 			<View style={styles.actionsContainer}>
	// 				<TouchableOpacity
	// 					style={[styles.actionButton, styles.editButton]}
	// 					onPress={() => handleEditBike(item)}>
	// 					<Edit size={16} color={Colors.light.secondary} />
	// 					<Text style={styles.editButtonText}>Edit</Text>
	// 				</TouchableOpacity>
	// 				<TouchableOpacity
	// 					style={[styles.actionButton, styles.deleteButton]}
	// 					onPress={() => handleDeleteBike(item)}>
	// 					<Trash2 size={16} color={Colors.light.danger} />
	// 					<Text style={styles.deleteButtonText}>Delete</Text>
	// 				</TouchableOpacity>
	// 			</View>
	// 		</View>
	// 	</View>
	// );

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Bike Inventory</Text>
			</View>

			<View style={styles.searchContainer}>
				<View style={styles.searchBar}>
					<Search size={20} color={Colors.light.grey4} />
					<TextInput
						style={styles.searchInput}
						placeholder="Search bikes..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholderTextColor={Colors.light.grey4}
					/>
				</View>
				<TouchableOpacity style={styles.filterButton}>
					<SlidersHorizontal size={20} color={Colors.light.text} />
				</TouchableOpacity>
			</View>

			<View style={styles.listHeader}>
				<Text style={styles.listTitle}>
					All Bikes ({filteredBikes.length})
				</Text>
				<Button
					title="Add Bike"
					onPress={handleAddBike}
					icon={<PlusCircle size={18} color="white" />}
				/>
			</View>

			<FlatList
				data={filteredBikes}
				renderItem={renderBikeItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.bikesList}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[Colors.light.primary]}
						tintColor={Colors.light.primary}
					/>
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							{searchQuery
								? "No bikes match your search"
								: "No bikes in inventory"}
						</Text>
						<Button
							title="Add New Bike"
							onPress={handleAddBike}
							icon={<PlusCircle size={18} color="white" />}
						/>
					</View>
				}
			/>
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
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: Colors.light.text,
	},
	searchContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingBottom: 16,
		backgroundColor: "white",
	},
	searchBar: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.light.divider,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		fontSize: 16,
		color: Colors.light.text,
	},
	filterButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.light.divider,
		borderRadius: 8,
	},
	listHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	listTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.light.text,
	},
	bikesList: {
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	bikeCard: {
		backgroundColor: "white",
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 2,
		overflow: "hidden",
	},
	bikeImage: {
		width: "100%",
		height: 150,
	},
	bikeContent: {
		padding: 12,
	},
	bikeHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	bikeModel: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.light.text,
		flex: 1,
		marginRight: 8,
	},
	categoryContainer: {
		backgroundColor: "#F0F0F0",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	categoryText: {
		fontSize: 12,
		fontWeight: "500",
		color: Colors.light.grey2,
	},
	locationContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	locationText: {
		fontSize: 12,
		color: Colors.light.grey4,
		marginLeft: 4,
	},
	priceContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	price: {
		fontSize: 14,
		fontWeight: "600",
		color: Colors.light.primary,
	},
	availabilityContainer: {
		marginBottom: 12,
	},
	availabilityBadge: {
		alignSelf: "flex-start",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	availabilityText: {
		fontSize: 12,
		fontWeight: "600",
	},
	actionsContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
		marginLeft: 8,
	},
	editButton: {
		backgroundColor: `${Colors.light.secondary}15`,
	},
	deleteButton: {
		backgroundColor: `${Colors.light.danger}15`,
	},
	editButtonText: {
		fontSize: 12,
		fontWeight: "600",
		color: Colors.light.secondary,
		marginLeft: 4,
	},
	deleteButtonText: {
		fontSize: 12,
		fontWeight: "600",
		color: Colors.light.danger,
		marginLeft: 4,
	},
	emptyContainer: {
		padding: 24,
		alignItems: "center",
	},
	emptyText: {
		fontSize: 16,
		color: Colors.light.grey3,
		marginBottom: 16,
		textAlign: "center",
	},
});
