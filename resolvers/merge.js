const Event = require('../models/event');
const User = require('../models/user');
const { dateToString } = require('../helpers/index');
const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.sort(
      // sorts the events based on the order of eventIds that DataLoader sends us
      (a, b) =>
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString()),
    );
    return events.map(event => transformEvent(event));
  } catch (error) {
    throw error;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (error) {
    throw error;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user.toJSON(),
      _id: user.id,
      createdEvents: events.bind(this, user.createdEvents),
    };
  } catch (error) {
    throw error;
  }
};

const transformEvent = event => ({
  ...event.toJSON(),
  _id: event.id,
  date: dateToString(event.date),
  creator: user.bind(this, event.creator),
});

const transformBooking = booking => ({
  ...booking.toJSON(),
  _id: booking.id,
  user: user.bind(this, booking.user),
  event: singleEvent.bind(this, booking.event),
  createdAt: dateToString(booking.createdAt),
  updatedAt: dateToString(booking.updatedAt),
});

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
