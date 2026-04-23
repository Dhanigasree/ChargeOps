import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { adminApi, reviewApi, stationApi } from "../services/api.js";

const StationDetails = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStationDetails = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [{ data: stationData }, { data: reviewData }] = await Promise.all([
        stationApi.getById(stationId),
        reviewApi.listByStation(stationId)
      ]);
      setStation(stationData.data);
      setReviews(reviewData.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to load station details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStationDetails();
  }, [stationId]);

  const submitReview = async (event) => {
    event.preventDefault();
    await reviewApi.create({
      stationId,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment
    });
    setReviewForm({ rating: 5, comment: "" });
    loadStationDetails();
  };

  const deleteReview = async (reviewId) => {
    await reviewApi.remove(reviewId);
    loadStationDetails();
  };

  const approveStation = async () => {
    await adminApi.approveStation(stationId, true);
    loadStationDetails();
  };

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />

      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/stations" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
            Back to Stations
          </Link>
          {station && (user?.role === "customer" || user?.role === "admin") ? (
            <button
              type="button"
              onClick={() => navigate("/bookings", { state: { selectedStation: station } })}
              className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-2 text-sm font-semibold text-white"
            >
              Book This Station
            </button>
          ) : null}
        </div>

        {isLoading ? <Loader label="Loading station details..." /> : null}
        {errorMessage ? <Card><p className="text-rose-300">{errorMessage}</p></Card> : null}

        {station ? (
          <>
            <Card title={station.name} subtitle="Station Details">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3 text-sm text-slate-300">
                  <p>{station.location.address}</p>
                  <p>State: {station.location.state}</p>
                  <p>District: {station.location.district}</p>
                  <p>Locality: {station.location.locality}</p>
                  <p>Charger: {station.chargerType}</p>
                  <p>Price: Rs. {station.pricePerUnit} / unit</p>
                  <p>Available slots: {station.availability.slots}</p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
                  <p className="text-sm text-slate-400">Approval Status</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{station.isApproved ? "Approved" : "Pending"}</p>
                  {user?.role === "admin" && !station.isApproved ? (
                    <button
                      type="button"
                      onClick={approveStation}
                      className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                    >
                      Approve Station
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card title="Add Review" subtitle="Customer Feedback">
                {(user?.role === "customer" || user?.role === "admin") ? (
                  <form className="space-y-4" onSubmit={submitReview}>
                    <select
                      value={reviewForm.rating}
                      onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} Stars
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                      rows={5}
                      placeholder="Share your charging experience"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <p className="text-slate-400">Only customers and admins can add reviews.</p>
                )}
              </Card>

              <Card title="Reviews" subtitle="Community Voice">
                <div className="space-y-4">
                  {reviews.length === 0 ? <p className="text-slate-400">No reviews yet.</p> : null}
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{review.rating} / 5</p>
                        {(user?.role === "admin" || user?.id === review.userId) ? (
                          <button
                            type="button"
                            onClick={() => deleteReview(review.id)}
                            className="text-sm font-medium text-rose-300"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{review.comment || "No comment provided."}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
};

export default StationDetails;
