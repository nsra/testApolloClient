const Event = require('../models/event');
const User = require('../models/user');
const Booking = require('../models/booking');
const { transformEvent } = require('./merge');

const eventResolver = {
  Query: {
    events: async () => {
      try {
        const events = await Event.find();
        return events.map(event => {
          return transformEvent(event);
        });
      } catch (err) {
        throw err;
      }
    }
  },
  Mutation: {
    createEvent: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated.');
      }
      const ExistingEvent = await Event.findOne({ title: args.eventInput.title });
      if (ExistingEvent) {
        throw new Error('Event with this title already exist');
      }
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: context.user._id,
      });

      let createdEvent;
      try {
        const result = await event.save();
        createdEvent = transformEvent(result);
        const creator = await User.findById(context.user._id);

        if (!creator) {
          throw new Error('User not found.');
        }
        creator.createdEvents.push(event);
        await creator.save();
        return createdEvent;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    editEvent: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated.');
      }
      try {
        const event = await Event.findById(args.eventId);
        const eventHasBookers = await Booking.find({ event: event });
        if (eventHasBookers.length > 0) {
          throw new Error('Can not edit event has bookers.');
        }
        return await Event.findOneAndUpdate(
          { _id: args.eventId },
          {
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: context.user._id,
          });
      } catch (err) {
        throw err;
      }
    },
    deleteEvent: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not Authenticated.');
      }
      try {
        const event = await Event.findById(args.eventId)
        const eventHasBookers = await Booking.find({ event: event });
        if (eventHasBookers.length > 0) {
          throw new Error('Can not delete event has bookers.');
        }
        let eventId = args.eventId;
        const result = await Event.deleteOne({ _id: eventId });
        console.log(result);
        const NewEventsSet = await Event.find({});
        return NewEventsSet
      } catch (err) {
        throw err;
      }
    }
  }
};

module.exports = { eventResolver };
