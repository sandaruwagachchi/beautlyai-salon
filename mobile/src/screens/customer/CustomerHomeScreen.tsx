import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CustomerStackParamList } from '../../navigation/types';
import { BOOKING_TEXT } from '../../constants/booking';

type Props = NativeStackScreenProps<CustomerStackParamList, 'CustomerHome'>;

const CustomerHomeScreen: React.FC<Props> = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Card>
				<Card.Content>
					<Text variant="headlineSmall">{BOOKING_TEXT.customerHomeTitle}</Text>
					<Text variant="bodyMedium" style={styles.subtitle}>
						{BOOKING_TEXT.customerHomeSubtitle}
					</Text>
				</Card.Content>
				<Card.Actions>
					<Button mode="contained" onPress={() => navigation.navigate('ServiceSelection')}>
						{BOOKING_TEXT.customerHomeStartButton}
					</Button>
				</Card.Actions>
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
		marginTop: 10,
	},
});

export default CustomerHomeScreen;
