'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ShipmentModal from '@/components/ShipmentModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import NoDataAlert from '@/components/NoDataAlert';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(50)

  // manages modals
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    destination: '',
    mode: '',
    carrier: '',
    status: '',
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    return params.toString();
  };

  const requestShipments = async () => {
    // retrieves paginated shipment data from sqlite db
    setLoading(true);
    try {
      const res = await axios.get(`api/shipments?${buildQueryParams()}`);
      if (res.data.error) {
        setShowNoData(true);
      } else {
        setShipments(res.data.data);
        setTotalPages(res.data.total_pages);
      }
    } catch (error) {
      setShowNoData(true);
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  }

  const fetchShipmentDetails = async (shipmentId: number) => {
    try {
      const res = await axios.get(`api/shipments/${shipmentId}`);
      setSelectedShipment(res.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch shipment details:', error);
    }
  };


  useEffect(() => {
    // Reset to page 1 on filter change
    setPage(1);
  }, [filters]);

  useEffect(() => {
    requestShipments();
  }, [page, perPage, filters]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setPerPage(value);
    // reset to first page when perPage changes
    setPage(1);
  };

  if (showNoData) return <NoDataAlert />

  return (
    <div>
      {/* header row  */}
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold mb-4">All Shipments</h1>

        {/* Per Page Dropdown */}
        <div className="mb-4">
          <label className="mr-2">Show:</label>
          <select value={perPage} onChange={handlePerPageChange} className="border px-2 py-1 rounded">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2">per page</span>
        </div>
      </div>


      {loading ? (
        <LoadingSpinner label="Fetching shipments..." />
      ) : (
        <>
          {/* filter row */}
          <div className="mb-4 grid grid-cols-5 gap-4">
            <select
              value={filters.destination}
              onChange={e => setFilters({ ...filters, destination: e.target.value })}
              className="border px-2 py-1 rounded"
            >
              <option value="">All Destinations</option>
              <option value="SLU">SLU</option>
              <option value="BIM">BIM</option>
              <option value="SVG">SVG</option>
              <option value="ANU">ANU</option>
              {/* Add all destination codes */}
            </select>

            <select
              value={filters.mode}
              onChange={e => setFilters({ ...filters, mode: e.target.value })}
              className="border px-2 py-1 rounded"
            >
              <option value="">All Modes</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
            </select>

            <select
              value={filters.carrier}
              onChange={e => setFilters({ ...filters, carrier: e.target.value })}
              className="border px-2 py-1 rounded"
            >
              <option value="">All Carriers</option>
              <option value="FEDEX">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="UPS">UPS</option>
              <option value="USPS">USPS</option>
              <option value="AMAZON">Amazon</option>
            </select>

            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="border px-2 py-1 rounded"
            >
              <option value="">All Statuses</option>
              <option value="received">Received</option>
              <option value="intransit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>

            {/* Export to csv button */}
            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (filters.destination) params.append('destination', filters.destination);
                if (filters.mode) params.append('mode', filters.mode);
                if (filters.carrier) params.append('carrier', filters.carrier);
                if (filters.status) params.append('status', filters.status);

                window.open(`http://127.0.0.1:5000/shipments/export?${params.toString()}`, '_blank');
              }}
              className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded"
            >
              Export CSV
            </button>
          </div>

          {/* table view */}
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>Carrier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {shipments.map(s => (
                <tr key={s['shipment_id']}
                  className="border-t cursor-pointer hover:bg-gray-100"
                  onClick={() => fetchShipmentDetails(s['shipment_id'])}>
                  <td>{s['shipment_id']}</td>
                  <td>{s['destination']}</td>
                  <td>{s['mode']}</td>
                  <td>{s['carrier']}</td>
                  <td>{s['status']}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center my-5">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Shipment detail modal */}
          <ShipmentModal
            isOpen={modalOpen}
            shipment={selectedShipment}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}




    </div >
  );
}
