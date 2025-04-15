'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar, Pie, Line
} from "react-chartjs-2";
import {
  ChartData,
  Chart as ChartJS,
  CategoryScale, LinearScale, ArcElement, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend,
} from "chart.js";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoDataAlert from "@/components/NoDataAlert";

ChartJS.register(
  CategoryScale, LinearScale, ArcElement, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend
);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [pieVolumeByMode, setPieVolumeByMode] = useState<any | null>(null);
  const [pieWarehouseUtil, setPieWarehouseUtil] = useState<any | null>(null);
  const [barData, setBarData] = useState<any | null>(null);
  const [lineData, setLineData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNoData, setShowNoData] = useState(false);

  function loadChartData() {
    const pieVolByMode = {
      labels: Object.keys(data.volume_by_mode),
      datasets: [{
        data: Object.values(data.volume_by_mode),
        backgroundColor: ['#36A2EB', '#FF6384']
      }]
    };
    setPieVolumeByMode(pieVolByMode);

    const barPkgByCarrier = {
      labels: Object.keys(data.received_per_carrier_per_day),
      datasets: Object.entries(data.received_per_carrier_per_day).reduce((acc, [date, carriers]: any) => {
        Object.entries(carriers).forEach(([carrier, count]: any) => {
          const existing = acc.find(a => a.label === carrier);
          if (existing) {
            existing.data.push(count);
          } else {
            acc.push({
              label: carrier,
              data: Array(Object.keys(data.received_per_carrier_per_day).indexOf(date)).fill(0).concat([count]),
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            });
          }
        });
        return acc;
      }, [] as any[])
    };

    setBarData(barPkgByCarrier);

    const warehouseUtil = {
      labels: ['Used', 'Available'],
      datasets: [{
        data: [data.warehouse_utilization, 100 - data.warehouse_utilization],
        backgroundColor: ['#4BC0C0', '#CCCCCC']
      }]
    };

    setPieWarehouseUtil(warehouseUtil);

    const linePackages = {
      labels: Object.keys(data.packages_per_day),
      datasets: [{
        label: 'Packages per Day',
        data: Object.values(data.packages_per_day),
        borderColor: '#FF9F40',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
        tension: 0.4,
      }]
    };

    setLineData(linePackages);
  }

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/insights`);

      if (res.data.error || !res.data) {
        setShowNoData(true);
      } else {
        setData(res.data);
      }
    } catch (e) {
      setShowNoData(true);
      console.log('Failed to load shipment insights.', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    if (data) {
      loadChartData();
    }

  }, [data]);

  if (loading) return <LoadingSpinner label="Loading shipment data..." />;
  if (showNoData) return <NoDataAlert />;
  if (!data) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="dashboard-card">
          <h1 className="card-heading">
            {data.total_shipments}
          </h1>
          <p className="card-description">Total Shipments</p>
        </div>
        <div className="dashboard-card">
          <h1 className="card-heading">
            {data.warehouse_utilization}%
          </h1>
          <p className="card-description">Warehouse Usage</p>
        </div>
        <div className="dashboard-card">
          <h1 className="card-heading">
            {data.delivered_on_time}
          </h1>
          <p className="card-description">Delivered On Time</p>
        </div>
        <div className="dashboard-card">
          <h1 className="card-heading">
            {data.delivered_delayed}
          </h1>
          <p className="card-description">Delivered Late</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="charts grid grid-cols-2 gap-6 mt-8">

        {barData &&
          <div className="col-span-full bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-2">Packages Received per Carrier Daily</h3>
            <Bar data={barData} />
          </div>
        }

        {pieVolumeByMode ?
          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-2">Volume of Shipments by Mode</h3>
            <Pie data={pieVolumeByMode} />
          </div>
          : <div>No Volume data</div>
        }


        {pieWarehouseUtil &&
          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-2">Warehouse Utilization</h3>
            <Pie data={pieWarehouseUtil} />
          </div>
        }

        {lineData &&
          <div className="col-span-full bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-2">Packages Per Day</h3>
            <Line data={lineData} />
          </div>
        }
      </div>

    </div>

  );
}
