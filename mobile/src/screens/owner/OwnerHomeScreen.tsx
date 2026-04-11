import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

const OwnerHomeScreen: React.FC = () => {
	return (
		<View style={styles.container}>
			<Card>
				<Card.Content>
					<Text variant="headlineSmall">Owner Dashboard</Text>
					<Text variant="bodyMedium" style={styles.subtitle}>
						Track analytics, staff performance, and business settings.
					</Text>
				</Card.Content>
			</Card>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 16,
	},
	subtitle: {
		marginTop: 8,
	},
});

export default OwnerHomeScreen;
