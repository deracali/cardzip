"use client";

import { useEffect, useState } from "react";

const services = [
  { id: "pipe", name: "Pipe repair", price: 129 },
  { id: "drain", name: "Drain cleaning", price: 99 },
  { id: "cooling", name: "AC maintenance", price: 149 },
  { id: "heating", name: "Heating", price: 159 },
];
const urgencies = [
  { id: "standard", name: "Standard", label: "2-3 days", surcharge: 0 },
  { id: "emergency", name: "Emergency", label: "Under 80 min", surcharge: 60 },
  { id: "weekend", name: "Weekend", label: "Sat / Sun", surcharge: 30 },
];

export default function PriceEstimator() {
  const [serviceId, setServiceId] = useState("pipe");
  const [urgencyId, setUrgencyId] = useState("standard");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("service");
    if (services.some((item) => item.id === requested)) setServiceId(requested!);
  }, []);
  const service = services.find((item) => item.id === serviceId) || services[0];
  const urgency = urgencies.find((item) => item.id === urgencyId) || urgencies[0];

  return (
    <section className="estimate-section" id="estimate">
      <div className="section-heading">
        <div><span className="eyebrow">INSTANT COST ESTIMATOR</span><h2>See your flat rate in 30 seconds</h2></div>
        <p>Estimate only; the technician confirms the price before work begins.</p>
      </div>
      <div className="estimate-card">
        <label>What needs repair?
          <select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            {services.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>When do you need help?
          <select value={urgencyId} onChange={(event) => setUrgencyId(event.target.value)}>
            {urgencies.map((item) => <option value={item.id} key={item.id}>{item.name} - {item.label}</option>)}
          </select>
        </label>
        <div className="estimate-total"><span>Estimated visit</span><strong>${service.price + urgency.surcharge}</strong></div>
        <a className="button button-orange" href={`/book-now?service=${service.id}&urgency=${urgency.id}`}>Request this service</a>
      </div>
    </section>
  );
}
