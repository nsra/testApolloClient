import React, { useState, useRef, useContext, useEffect } from 'react';
import Modal from '../components/Modal';
import Backdrop from '../components/Backdrop';
import AuthContext from '../context/auth-context';
import EventList from '../components/EventList';
import Spinner from '../components/Spinner';
import { NavLink } from 'react-router-dom';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const titleEl = useRef(null);
  const priceEl = useRef(null);
  const dateEl = useRef(null);
  const descriptionEl = useRef(null);
  const value = useContext(AuthContext);

  const eventConfirmHandler = () => {
    console.log(value);
    const title = titleEl.current.value;
    const price = +priceEl.current.value;
    const date = dateEl.current.value;
    const description = descriptionEl.current.value;
    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const requestQuery = {
      query: `
        mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
          createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
            _id
            title
            description
            price
            date
          }
        }
      `,
      variables: {
        title,
        description,
        price,
        date,
      },
    };
    // request to the backend
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${value.token}`,
      },
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed.');
        }
        return res.json();
      })
      .then(resData => {
        setEvents([
          ...events,
          { ...resData.data.createEvent, creator: { _id: value.userId } },
        ])
        // console.log(resData);
      })
      .catch(err => console.log(err));

    setCreating(false);
  };

  const fetchEvents = () => {
    setIsLoading(true);
    const requestQuery = {
      query: `
        query {
          events{
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `,
    };
    // request to the backend
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        console.log(res);
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed.');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        const events = resData.data.events;
        setEvents(events);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const showDetailHandler = eventId => {
    const clickedEvent = events.find(event => event._id === eventId);
    setSelectedEvent(clickedEvent);
  };

  const bookEventHandler = () => {
    if (!value.token) {
      setSelectedEvent(null);
      return;
    }
    const requestQuery = {
      query: `
        mutation BookEvent($eventId: ID!) {
          bookEvent(eventId: $eventId) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        eventId: selectedEvent._id,
      },
    };
    // request to the backend
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestQuery),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${value.token}`,
      },
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed.');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        setSelectedEvent(null);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <React.Fragment>
      {(creating || selectedEvent) && <Backdrop />}
      {creating && (
        <Modal
          title='Add Event'
          canCancel
          canConfirm
          onCancel={() => setCreating(false)}
          onConfirm={eventConfirmHandler}
          confirmText='Confirm'
        >
          <form>
            <div className='form-control'>
              <label htmlFor='title'>Title</label>
              <input required type='text' id='title' ref={titleEl} />
            </div>
            <div className='form-control'>
              <label htmlFor='price'>Price</label>
              <input required type='number' id='price' ref={priceEl} />
            </div>
            <div className='form-control'>
              <label htmlFor='date'>Date</label>
              <input required type='datetime-local' id='date' ref={dateEl} />
            </div>
            <div className='form-control'>
              <label htmlFor='description'>Description</label>
              <textarea required id='description' rows='4' ref={descriptionEl} />
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        <Modal
          title='Book Event'
          canCancel
          canConfirm
          onCancel={() => {
            setCreating(false);
            setSelectedEvent(false);
          }}
          onConfirm={bookEventHandler}
          confirmText={value.token ? 'Book' : <NavLink to='/auth'>Login to book</NavLink>}>
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{' '}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {value.token && (
        <div className='events-control'>
          <p>Share your own events!</p>
          <button className='btn' onClick={() => setCreating(true)}>
            Create Event
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={value.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </React.Fragment>
  );
}
