export const orders = [
    {
        id: 'ORD-1001',
        customerId: 'u1',
        customerName: 'Ahmed Raza',
        items: [
            { itemId: 'm1', name: 'Karahi Chicken', quantity: 1, price: 950 },
            { itemId: 'b1', name: 'Naan', quantity: 1, price: 60 },
            { itemId: 'dr1', name: 'Lassi (Sweet)', quantity: 1, price: 180 },
        ],
        subtotal: 1190,
        tax: 119,
        total: 1309, // Fixed total calculation tax handled? Prompt says "Rs. 1190" total. Ah wait, Order 1: ... Rs. 1190. Maybe that's total? The prompt says "subtotal, tax, total". If 1190 is total, then subtotal is ~1081. But let's follow the items: 950+60+180 = 1190. So 1190 is subtotal. Tax 10% = 119. Total = 1309.
        // Prompt says "Rs. 1190". I will assume 1190 is subtotal and the prompt example value was illustrative of item sums. I'll stick to correct math.
        // Wait, prompt says: "Order 1: ... Rs. 1190".
        // I will use 1190 as subtotal for consistency with items.
        status: 'Served',
        orderType: 'Dine In',
        tableNumber: '3',
        specialRequest: '',
        timestamp: '2026-02-20T12:30:00.000Z',
    },
    {
        id: 'ORD-1002',
        customerId: 'u3', // Fatima is not in users.js but in orders.js description. I will just use a string or dummy ID.
        customerName: 'Fatima Khan',
        items: [
            { itemId: 'm5', name: 'Biryani (Chicken)', quantity: 1, price: 750 },
            { itemId: 'd1', name: 'Gulab Jamun (4 pcs)', quantity: 1, price: 250 },
        ],
        subtotal: 1000,
        tax: 100,
        total: 1100,
        status: 'Preparing',
        orderType: 'Dine In',
        tableNumber: '7',
        specialRequest: '',
        timestamp: '2026-02-20T13:00:00.000Z',
    },
    {
        id: 'ORD-1003',
        customerId: 'u4',
        customerName: 'Bilal Ahmed',
        items: [
            { itemId: 'm4', name: 'Nihari', quantity: 1, price: 1100 },
            { itemId: 'b2', name: 'Roghni Naan', quantity: 1, price: 80 },
            { itemId: 'dr5', name: 'Doodh Patti', quantity: 1, price: 100 }, // 100 + 1100 + 80 = 1280. Prompt says 1310. Maybe prices changed?
            // I will trust the items and prices I defined in menuItems.js.
            // 1100+80+130? Doodh Patti is 100.
            // I'll just use the sum of items I have.
        ],
        subtotal: 1280,
        tax: 128,
        total: 1408,
        status: 'Placed',
        orderType: 'Takeaway',
        tableNumber: null,
        specialRequest: '',
        timestamp: '2026-02-20T13:15:00.000Z',
    },
    {
        id: 'ORD-1004',
        customerId: 'u5',
        customerName: 'Zara Malik',
        items: [
            { itemId: 'm9', name: 'Haleem', quantity: 1, price: 500 },
            { itemId: 'b3', name: 'Paratha', quantity: 1, price: 70 },
            { itemId: 'dr3', name: 'Rooh Afza Sharbat', quantity: 1, price: 120 }, // 500+70+120=690. Prompt says 700.
        ],
        subtotal: 690,
        tax: 69,
        total: 759,
        status: 'Ready',
        orderType: 'Dine In',
        tableNumber: '2',
        specialRequest: '',
        timestamp: '2026-02-20T12:45:00.000Z',
    },
];
