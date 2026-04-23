import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { bookingApi, paymentApi } from "../services/api.js";

const defaultForm = {
  stationId: "",
  slotTime: "",
  amount: ""
};

const Bookings = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const [bookingForm, setBookingForm] = useState(defaultForm);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (state?.selectedStation) {
      setBookingForm({
        stationId: state.selectedStation.id,
        slotTime: "",
        amount: String(state.selectedStation.pricePerUnit)
      });
    }
  }, [state]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const { data } = await bookingApi.mine();
      setBookings(data.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const createBooking = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await bookingApi.create({
        stationId: bookingForm.stationId,
        slotTime: bookingForm.slotTime,
        amount: Number(bookingForm.amount)
      });
      setSuccessMessage("Booking created successfully.");
      setBookingForm(defaultForm);
      loadBookings();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    await bookingApi.cancel(bookingId);
    loadBookings();
  };

  const payBooking = async (booking) => {
    await paymentApi.create({
      bookingId: booking.id,
      amount: booking.amount,
      paymentMethod: "card"
    });
    setSuccessMessage("Payment completed successfully.");
    loadBookings();
  };

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />

      <div className="flex-1 space-y-6">
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card title="Book a Charging Slot" subtitle="New Booking">
            <form className="space-y-4" onSubmit={createBooking}>
              <input
                value={bookingForm.stationId}
                onChange={(event) => setBookingForm((current) => ({ ...current, stationId: event.target.value }))}
                placeholder="Station ID"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500"
                required
              />
              <input
                type="datetime-local"
                value={bookingForm.slotTime}
                onChange={(event) => setBookingForm((current) => ({ ...current, slotTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
                required
              />
              <input
                type="number"
                min="0"
                value={bookingForm.amount}
                onChange={(event) => setBookingForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="Amount"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white"
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </button>
            </form>

            {state?.selectedStation ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                Booking for: <span className="font-semibold text-white">{state.selectedStation.name}</span>
              </div>
            ) : null}
            {successMessage ? <p className="mt-4 text-sm text-emerald-300">{successMessage}</p> : null}
            {errorMessage ? <p className="mt-4 text-sm text-rose-300">{errorMessage}</p> : null}
          </Card>

          <Card title="My Booking History" subtitle="Customer Records">
            {isLoading ? <Loader label="Loading bookings..." /> : null}
            <div className="space-y-4">
              {bookings.length === 0 && !isLoading ? <p className="text-slate-400">No bookings yet.</p> : null}
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">Station ID: {booking.stationId}</p>
                      <p className="mt-1 text-sm text-slate-400">{new Date(booking.slotTime).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="font-semibold capitalize text-white">
                        {booking.status} / {booking.paymentStatus}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">Amount: Rs. {booking.amount}</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {booking.status === "booked" ? (
                      <button
                        type="button"
                        onClick={() => cancelBooking(booking.id)}
                        className="rounded-full border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-300"
                      >
                        Cancel
                      </button>
                    ) : null}
                    {booking.paymentStatus !== "paid" && booking.status === "booked" && (user?.role === "customer" || user?.role === "admin") ? (
                      <button
                        type="button"
                        onClick={() => payBooking(booking)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                      >
                        Pay Now
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card title="Quick Access" subtitle="Explore More">
          <div className="flex flex-wrap gap-3">
            <Link to="/stations" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
              Browse Stations
            </Link>
            <Link to="/plans" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
              View Plans
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Bookings;
