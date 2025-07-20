import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from 'stripe';


// Check availability of selected seats for movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;
        const {origin} = req.headers;

        // Check if seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.json({success: false, message: "Selected seats are not available."});
        }

        // Get show details
        const showData = await Show.findById(showId).populate('movie');

        // Create new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        });

        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified('occupiedSeats');

        await showData.save();

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Line items for stripe
        const lineItems = [{
            price_data: {
                currency: process.env.STRIPE_SECRET_KEY_CURRENCY_CODE,
                product_data: {
                    name: showData.movie.title,
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }];


        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: lineItems,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60 // Expires in 30 minutes
        });

        booking.paymentLink = session.url;

        await booking.save();

        // Run Ingest Scheduler Function to check payment status after 10 minutes
        await inngest.send({
            name: 'app/check-payment',
            data: {
                bookingId: booking._id.toString()
            }
        });

        res.json({success: true, url: session.url});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Get occupied seats
export const getOccupiedSeats = async (req, res) => {
    try {

        const {showId} = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        res.json({success: true, occupiedSeats});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}