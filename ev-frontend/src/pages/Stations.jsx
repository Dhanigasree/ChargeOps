import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { adminApi, stationApi } from "../services/api.js";

const initialFilters = {
  state: "",
  district: "",
  chargerType: "",
  address: ""
};

const PAGE_SIZE = 6;

const Stations = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [stations, setStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStations = async (nextFilters = filters) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const params = Object.fromEntries(
        Object.entries({
          ...nextFilters,
          isApproved: user?.role === "admin" ? undefined : true
        }).filter(([, value]) => value !== "" && value !== undefined)
      );
      const { data } = await stationApi.list(params);
      setStations(data.data || []);
      setCurrentPage(1);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to load stations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const totalPages = Math.max(1, Math.ceil(stations.length / PAGE_SIZE));
  const paginatedStations = stations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleApprove = async (stationId) => {
    await adminApi.approveStation(stationId, true);
    loadStations();
  };

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />

      <div className="flex-1 space-y-6">
        <Card title="Stations" subtitle="Live Network">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              placeholder="Filter by state"
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
            <input
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              placeholder="Filter by district"
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
            <input
              name="chargerType"
              value={filters.chargerType}
              onChange={handleFilterChange}
              placeholder="Charger type"
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
            <input
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Search address"
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadStations()}
              className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters(initialFilters);
                loadStations(initialFilters);
              }}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200"
            >
              Reset
            </button>
          </div>
        </Card>

        {isLoading ? <Loader label="Loading stations..." /> : null}
        {errorMessage ? <Card><p className="text-rose-300">{errorMessage}</p></Card> : null}

        {!isLoading && !errorMessage ? (
          <Card title="All Stations" subtitle="Available Results">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
              <p>
                Showing <span className="font-semibold text-white">{paginatedStations.length}</span> of{" "}
                <span className="font-semibold text-white">{stations.length}</span> stations
              </p>
              <p>
                Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </p>
            </div>
          </Card>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          {paginatedStations.map((station) => (
            <Card key={station.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{station.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {station.location.locality || station.location.district}, {station.location.state}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      station.isApproved ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {station.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-300">
                  <p>{station.location.address}</p>
                  <p>Charger: {station.chargerType}</p>
                  <p>Price: Rs. {station.pricePerUnit} / unit</p>
                  <p>Slots: {station.availability.slots}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/stations/${station.id}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  View Details
                </Link>
                {user?.role === "admin" && !station.isApproved ? (
                  <button
                    type="button"
                    onClick={() => handleApprove(station.id)}
                    className="rounded-full border border-emerald-400/30 px-4 py-2 text-sm font-semibold text-emerald-300"
                  >
                    Approve
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
        </section>

        {!isLoading && !errorMessage && stations.length > 0 ? (
          <Card title="Pagination" subtitle="Browse Results">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 text-white"
                        : "border border-white/10 text-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
};

export default Stations;
