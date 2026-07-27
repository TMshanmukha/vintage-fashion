// MOCKED courier integration. Every function has the shape a real
// courier API would return — when you get Delhivery/Shiprocket
// credentials, replace the body of each function with a real HTTP
// call. Nothing else in the app needs to change, since every caller
// only depends on this return shape.

const mockTrackingId = (prefix) =>
    `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Called when an order moves pending -> confirmed. Creates the
// shipment on the courier's side and returns tracking info to store
// on the order.
export const createShipment = async (order) => {
    const trackingId = mockTrackingId("TRK");

    return {
        trackingId,
        courierPartner: "MockCourier",
        status: "shipment_created",
        events: [
            {
                status: "shipment_created",
                location: "Warehouse",
                timestamp: new Date().toISOString(),
            },
        ],
    };
};

// Called to refresh a shipment's current status/location.
export const trackShipment = async (trackingId) => {
    return {
        trackingId,
        status: "in_transit",
        events: [
            { status: "shipment_created", location: "Warehouse", timestamp: new Date(Date.now() - 3600_000).toISOString() },
            { status: "in_transit", location: "In transit", timestamp: new Date().toISOString() },
        ],
    };
};

// Called when the shop needs the courier to come collect an
// outbound parcel (not currently required by this flow, since the
// shop hands off in person — kept for completeness/parity with your spec).
export const schedulePickup = async (order) => {
    return {
        pickupScheduled: true,
        pickupDate: new Date(Date.now() + 86_400_000).toISOString(),
    };
};

// Called when a return is approved — schedules a courier pickup
// from the CUSTOMER's address, not the shop's.
export const scheduleReturnPickup = async (returnRequest) => {
    const pickupTrackingId = mockTrackingId("RET");

    return {
        pickupTrackingId,
        status: "pickup_scheduled",
        scheduledFor: new Date(Date.now() + 86_400_000).toISOString(),
    };
};