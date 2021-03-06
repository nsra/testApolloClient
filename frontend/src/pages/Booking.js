import React, { useState, useEffect, useContext } from 'react';
import Spinner from '../components/Spinner';
import AuthContext from '../context/auth-context';
import BookingList from '../components/BookingList';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const value = useContext(AuthContext);

  const fetchBookings = () => {
    setIsLoading(true);
    const requestQuery = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
              price
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
        const { bookings } = resData.data;
        setBookings(bookings);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const cancelBookingHandler = bookingId => {
    const requestQuery = {
      query: `
        mutation CancelBooking($bookingId: ID!){
          cancelBooking(bookingId: $bookingId) {
            _id
            title
          }
        }
      `,
      variables: {
        bookingId,
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
      .then(() => {
        setBookings(bookings.filter(booking => booking._id !== bookingId));
      })
      .catch(err => console.log(err));
  };


  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div>
            <p>Events You Book!</p>
            <BookingList
              bookings={bookings}
              onCancelBooking={cancelBookingHandler}
            />
          </div>
        </>
      )}
    </>
  );
}