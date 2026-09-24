import { useEffect, useState } from "react";

import {
  getOrganizations,
  getFactories,
  getProductionLines,
  getMachines,
  getSensors,
} from "../../services/adminService";

export default function Dashboard() {

  const [stats, setStats] = useState({
    organizations: 0,
    factories: 0,
    productionLines: 0,
    machines: 0,
    sensors: 0,
  });

  useEffect(() => {

    const loadStats = async () => {

      try {

        const [
          organizations,
          factories,
          productionLines,
          machines,
          sensors,
        ] = await Promise.all([
          getOrganizations(),
          getFactories(),
          getProductionLines(),
          getMachines(),
          getSensors(),
        ]);

        setStats({
          organizations: organizations.length,
          factories: factories.length,
          productionLines: productionLines.length,
          machines: machines.length,
          sensors: sensors.length,
        });

      } catch (error) {
        console.error(error);
      }

    };

    loadStats();

  }, []);

  const cards = [
    {
      title: "Organizations",
      value: stats.organizations,
    },
    {
      title: "Factories",
      value: stats.factories,
    },
    {
      title: "Production Lines",
      value: stats.productionLines,
    },
    {
      title: "Machines",
      value: stats.machines,
    },
    {
      title: "Sensors",
      value: stats.sensors,
    },
  ];

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Industrial infrastructure overview
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">

        {cards.map((card) => (

          <div
            key={card.title}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >

            <p className="text-sm text-slate-500">
              {card.title}
            </p>

            <p className="text-3xl font-bold mt-3">
              {card.value}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}