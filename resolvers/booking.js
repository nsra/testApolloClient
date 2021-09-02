const Event = require('../models/event');
const Booking = require('../models/booking');
const { transformBooking, transformEvent } = require('./merge');

const bookingResolver = {
  Query: {
    bookings: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not Authenticated.');
      }

      try {
        const bookings = await Booking.find({ user: context.user._id });
        console.log(bookings)
        console.log(context.user._id)
        console.log(context.user)
        return bookings.map(booking => {
          return transformBooking(booking);
        });
      } catch (err) {
        throw err;
      }
    }
  },
  Mutation: {
    bookEvent: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not Authenticated.');
      }
      // const bookedEvent = await Event.findById(args.eventId);
      const existingBooking = await Booking.find({ event: args.eventId }).find({ user: context.user });
      if (existingBooking.length > 0) {
        throw new Error('You already book this event.');
      }
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: context.user._id,
        event: fetchedEvent
      });
      const result = await booking.save();
      return transformBooking(result);
    },
    cancelBooking: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not Authenticated.');
      }
      try {
        const booking = await Booking.findById(args.bookingId).populate('event');
        const event = transformEvent(booking.event);
        await Booking.deleteOne({ _id: args.bookingId });
        return event;
      } catch (err) {
        throw err;
      }
    }
  }
};

module.exports = { bookingResolver };

