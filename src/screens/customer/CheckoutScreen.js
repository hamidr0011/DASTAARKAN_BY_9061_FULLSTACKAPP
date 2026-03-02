
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckoutScreen = ({ navigation }) => {
    const { cartItems, getCartTotal, specialRequest, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { subtotal, tax, total } = getCartTotal();
    const [orderType, setOrderType] = useState('Dine In');
    const [tableNumber, setTableNumber] = useState('');
    const [tableStatus, setTableStatus] = useState(null); // null | 'available' | 'occupied'
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [isProcessing, setIsProcessing] = useState(false);

    const paymentMethods = ['Cash on Delivery', 'Easypaisa', 'JazzCash'];

    const checkTableAvailability = async () => {
        if (!tableNumber.trim()) {
            Alert.alert('Error', 'Please enter a table number first.');
            return;
        }

        try {
            // Fetch live data instead of using mock arrays
            const { getAllOrders, getAllReservations } = require('../../services/api');

            const [ordersRes, resRes] = await Promise.all([
                getAllOrders(),
                getAllReservations()
            ]);

            const liveOrders = ordersRes.success ? ordersRes.data : [];
            const liveReservations = resRes.success ? resRes.data : [];

            // Check if any active order has this table
            const occupiedByOrder = liveOrders.some(
                o => o.tableNumber === tableNumber && ['Placed', 'Preparing', 'Ready'].includes(o.status)
            );
            // Check if any confirmed reservation has this table
            const occupiedByReservation = liveReservations.some(
                r => r.tableNumber === tableNumber && r.status === 'Confirmed'
            );

            if (occupiedByOrder || occupiedByReservation) {
                setTableStatus('occupied');
            } else {
                setTableStatus('available');
            }
        } catch (error) {
            console.error('Error checking table status:', error);
            Alert.alert('Error', 'Could not check table availability right now');
        }
    };

    const handleConfirmOrder = async () => {
        if (orderType === 'Dine In' && !tableNumber) {
            Alert.alert('Error', 'Please enter your table number for Dine In.');
            return;
        }
        if (orderType === 'Dine In' && tableStatus !== 'available') {
            Alert.alert('Error', 'Please check table availability before confirming.');
            return;
        }
        if (orderType === 'Takeaway' && !deliveryAddress.trim()) {
            Alert.alert('Error', 'Please enter your delivery address.');
            return;
        }

        setIsProcessing(true);

        try {
            const { placeOrder } = require('../../services/api');
            const orderPayload = {
                items: cartItems,
                subtotal,
                tax,
                total,
                orderType,
                tableNumber: orderType === 'Dine In' ? tableNumber : null,
                deliveryAddress: orderType === 'Takeaway' ? deliveryAddress : null,
                paymentMethod,
                specialRequest
            };

            const response = await placeOrder(orderPayload);

            if (response.success) {
                Alert.alert(
                    'Order Placed Successfully!',
                    `Your order code is #${response.data.orderCode}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                clearCart();
                                navigation.navigate('OrderTracking', { order: response.data });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return <LoadingSpinner label="Placing your order..." />;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Type</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, orderType === 'Dine In' && styles.activeTypeButton]}
                            onPress={() => setOrderType('Dine In')}
                        >
                            <Text style={[styles.typeText, orderType === 'Dine In' && styles.activeTypeText]}>Dine In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, orderType === 'Takeaway' && styles.activeTypeButton]}
                            onPress={() => setOrderType('Takeaway')}
                        >
                            <Text style={[styles.typeText, orderType === 'Takeaway' && styles.activeTypeText]}>Takeaway</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {orderType === 'Dine In' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Table Number</Text>
                        <View style={styles.tableRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                placeholder="e.g. 3"
                                value={tableNumber}
                                onChangeText={(val) => { setTableNumber(val); setTableStatus(null); }}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.checkBtn} onPress={checkTableAvailability}>
                                <Text style={styles.checkBtnText}>Check</Text>
                            </TouchableOpacity>
                        </View>
                        {tableStatus === 'available' && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.availableText}>✓ Table {tableNumber} is Available</Text>
                            </View>
                        )}
                        {tableStatus === 'occupied' && (
                            <View style={[styles.statusBadge, styles.occupiedBadge]}>
                                <Text style={styles.occupiedText}>✗ Table {tableNumber} is Occupied — try another</Text>
                            </View>
                        )}
                    </View>
                )}

                {orderType === 'Takeaway' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Delivery Address</Text>
                        <TextInput
                            style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                            placeholder="Enter your full delivery address"
                            value={deliveryAddress}
                            onChangeText={setDeliveryAddress}
                            multiline
                        />

                        <Text style={[styles.label, { marginTop: 16 }]}>Payment Method</Text>
                        {paymentMethods.map(method => (
                            <TouchableOpacity
                                key={method}
                                style={styles.paymentOption}
                                onPress={() => setPaymentMethod(method)}
                            >
                                <View style={styles.radio}>
                                    {paymentMethod === method && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.paymentLabel}>{method}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.waitText}>Estimated Wait: 25–30 minutes</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {cartItems.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                            <Text style={styles.itemPrice}>Rs. {item.price * item.quantity}</Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax (10%)</Text>
                        <Text style={styles.summaryValue}>Rs. {tax.toFixed(0)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
                    </View>
                </View>

                {specialRequest ? (
                    <View style={styles.section}>
                        <Text style={styles.label}>Special Request:</Text>
                        <Text style={styles.noteText}>{specialRequest}</Text>
                    </View>
                ) : null}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
                    <Text style={styles.confirmButtonText}>Confirm Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.text,
    },
    typeContainer: {
        flexDirection: 'row',
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTypeButton: {
        backgroundColor: colors.primary,
    },
    typeText: {
        fontWeight: '600',
        color: colors.grey,
    },
    activeTypeText: {
        color: colors.white,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.text,
    },
    input: {
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    waitText: {
        fontWeight: 'bold',
        color: colors.accent,
        textAlign: 'center',
        fontSize: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        color: colors.text,
        flex: 1,
    },
    itemPrice: {
        color: colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGrey,
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: colors.grey,
    },
    summaryValue: {
        fontWeight: '600',
        color: colors.text,
    },
    totalRow: {
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    noteText: {
        fontStyle: 'italic',
        color: colors.grey,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    checkBtnText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    statusBadge: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#e6f9ed',
    },
    occupiedBadge: {
        backgroundColor: '#fde8e8',
    },
    availableText: {
        color: '#1a7a40',
        fontWeight: 'bold',
    },
    occupiedText: {
        color: '#c0392b',
        fontWeight: 'bold',
    },

    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    paymentLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lightGrey,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CheckoutScreen;
