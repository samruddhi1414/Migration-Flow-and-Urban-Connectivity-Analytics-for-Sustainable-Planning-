import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import defaultMumbaiMigration from "../../../public/data/mumbai_migration.json";
import defaultMumbaiWards from "../../../public/data/mumbai_wards.json";
import defaultMumbaiHousing from "../../../public/data/mumbai_housing.json";
import defaultMhMigration from "../../../public/data/maharashtra_migration.json";
import defaultMhDistricts from "../../../public/data/maharashtra_districts.json";
import "./App.css";

// Helper for robust ward matching (handles '101' vs '0101')
const isWardMatch = (w1, w2) => {
  if (!w1 || !w2 || w1 === "all" || w2 === "all") return false;
  return (
    String(w1).trim() === String(w2).trim() ||
    parseInt(w1, 10) === parseInt(w2, 10) ||
    String(w1).padStart(4, "0") === String(w2).padStart(4, "0")
  );
};

function App() {
  const [activeTab, setActiveTab] = useState("mumbai"); // 'mumbai' | 'maharashtra'

  return (
    <div className="dashboard-app">
      {/* TOP NAVIGATION BAR */}
      <header className="topbar">
        <div className="topbar-container">
          <div className="topbar-brand">
            <span className="brand-badge">CENSUS 2011</span>
            <span className="brand-title">Migration &amp; Residential Analytics</span>
          </div>
          <div className="topbar-nav">
            <button
              type="button"
              className={`nav-tab ${activeTab === "mumbai" ? "active" : ""}`}
              onClick={() => setActiveTab("mumbai")}
            >
              Mumbai City
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "maharashtra" ? "active" : ""}`}
              onClick={() => setActiveTab("maharashtra")}
            >
              Maharashtra State
            </button>
          </div>
        </div>
      </header>

      {activeTab === "mumbai" ? (
        <MumbaiDashboard />
      ) : (
        <MaharashtraDashboard />
      )}
    </div>
  );
}

/* =========================================================================
   MUMBAI CITY DASHBOARD COMPONENT
========================================================================= */
function MumbaiDashboard() {
  const [migration, setMigration] = useState(defaultMumbaiMigration);
  const [wards, setWards] = useState(defaultMumbaiWards);
  const [housing, setHousing] = useState(defaultMumbaiHousing);
  const [selectedWard, setSelectedWard] = useState("all");

  useEffect(() => {
    const timestamp = Date.now();
    Promise.all([
      fetch(`/data/mumbai_migration.json?t=${timestamp}`).then((r) => r.json()),
      fetch(`/data/mumbai_wards.json?t=${timestamp}`).then((r) => r.json()),
      fetch(`/data/mumbai_housing.json?t=${timestamp}`).then((r) => r.json()),
    ])
      .then(([m, w, h]) => {
        if (m && m.origins && m.origins.length > 0) setMigration(m);
        if (w && w.length > 0) setWards(w);
        if (h && h.length > 0) setHousing(h);
      })
      .catch((err) => console.warn("Using bundled fallback data:", err));
  }, []);

  const work =
    migration?.reasons?.find((x) => x.reason === "Work / Employment")?.value || 0;

  const rawOrigins =
    migration?.origins && migration.origins.length > 0
      ? migration.origins
      : defaultMumbaiMigration.origins;

  const topOrigin = rawOrigins && rawOrigins.length > 0 ? rawOrigins[0] : null;
  const topOriginState = topOrigin ? topOrigin.state : "Uttar Pradesh";
  const originsChartData = rawOrigins.slice(0, 10);

  const longTerm =
    migration?.duration?.find((x) => x.duration === "10+ years")?.value || 0;

  const sortedWards = [...wards].sort((a, b) => b.population - a.population);

  // Exact matching for selected ward
  const selectedWardData =
    selectedWard !== "all"
      ? wards.find((w) => isWardMatch(w.ward, selectedWard))
      : null;

  // Exact matching for selected ward housing
  const selectedHousingData = selectedWardData
    ? housing.find((h) => isWardMatch(h.ward, selectedWardData.ward))
    : null;

  return (
    <div className="page-container">
      {/* HERO */}
      <section className="hero-card">
        <div className="hero-eyebrow">MUMBAI CITY • CENSUS 2011</div>
        <h1 className="hero-heading">
          Migration Drivers &amp; Residential Patterns
        </h1>
        <p className="hero-subheading">
          Why people migrate to Mumbai, where they come from, how long they
          stay, and the residential context across Mumbai's 39 wards.
        </p>
      </section>

      {/* KPI ROW */}
      <section className="kpi-grid">
        <KPICard
          title="Total Migrants"
          value={migration.totalMigrants}
          note="Mumbai City"
        />
        <KPICard
          title="Male Migrants"
          value={migration.gender.male}
          note="57.1% of migrants"
        />
        <KPICard
          title="Female Migrants"
          value={migration.gender.female}
          note="42.9% of migrants"
        />
        <KPICard
          title="Main Driver"
          value="Work"
          note={work}
        />
        <KPICard
          title="10+ Years"
          value={longTerm}
          note="Largest duration group"
        />
        <KPICard
          title="Mumbai Wards"
          value={wards.length}
          note="Residential context"
        />
      </section>

      {/* DASHBOARD VIEW / FILTER */}
      <section className="filter-card">
        <div className="filter-info">
          <h3 className="filter-title">Dashboard View</h3>
          <p className="filter-subtitle">
            Explore Mumbai migration and residential patterns.
          </p>
        </div>
        <div className="filter-control">
          <label htmlFor="mumbai-ward-select" className="filter-label">
            Select Ward
          </label>
          <select
            id="mumbai-ward-select"
            className="ward-select"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="all">All Mumbai Wards</option>
            {wards.map((ward) => (
              <option key={ward.ward} value={ward.ward}>
                Ward {ward.ward} — {ward.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 01. MIGRATION DRIVERS — WHY */}
      <section className="dashboard-card">
        <SectionTitle
          number="01"
          title="Migration Drivers — WHY"
          description="Why people migrated to Mumbai."
        />
        <div className="visual-row">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={[...migration.reasons].sort((a, b) => b.value - a.value)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 115, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="reason"
                  tick={{ fill: "#1e293b", fontSize: 11 }}
                  width={115}
                />
                <Tooltip
                  formatter={(val) => [
                    val.toLocaleString("en-IN"),
                    "Migrants",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="insight-card">
            <span className="insight-badge">KEY INSIGHT</span>
            <p className="insight-text">
              <strong>Work / Employment</strong> is the leading recorded
              migration reason for Mumbai.
            </p>
          </div>
        </div>
      </section>

      {/* 02. MIGRATION ORIGINS — WHERE FROM */}
      <section className="dashboard-card">
        <SectionTitle
          number="02"
          title="Migration Origins — WHERE FROM"
          description="Leading origin states of Mumbai's migrants."
        />
        <div className="visual-row">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={originsChartData}
                margin={{ top: 8, right: 15, left: 5, bottom: 45 }}
                barCategoryGap="18%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="state"
                  angle={-28}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  tick={{ fill: "#1e293b", fontSize: 10.5, fontWeight: 500 }}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [
                    val.toLocaleString("en-IN"),
                    "Migrants",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="insight-card">
            <span className="insight-badge">KEY INSIGHT</span>
            <p className="insight-text">
              <strong>{topOriginState}</strong> is the largest recorded origin
              among the states shown.
            </p>
          </div>
        </div>
      </section>

      {/* 03. RESIDENTIAL PATTERNS — HOW LONG */}
      <section className="dashboard-card">
        <SectionTitle
          number="03"
          title="Residential Patterns — HOW LONG"
          description="Duration of residence among Mumbai migrants."
        />
        <div className="visual-row">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={migration.duration}
                margin={{ top: 8, right: 20, left: 5, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="duration"
                  tick={{ fill: "#1e293b", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [
                    val.toLocaleString("en-IN"),
                    "Migrants",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  barSize={52}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="insight-card">
            <span className="insight-badge">KEY INSIGHT</span>
            <p className="insight-text">
              The <strong>10+ years</strong> category is the largest recorded
              residence-duration group.
            </p>
          </div>
        </div>
      </section>

      {/* 04. MUMBAI RESIDENTIAL CONTEXT — WHERE */}
      <section className="dashboard-card">
        <SectionTitle
          number="04"
          title="Mumbai Residential Context — WHERE"
          description="Population and household context across Mumbai's wards."
        />

        {/* WARD DRILLDOWN CARD */}
        {selectedWardData ? (
          <div className="ward-explorer-panel">
            <div className="ward-explorer-header">
              <div className="ward-explorer-title-wrap">
                <span className="ward-explorer-tag">
                  SELECTED WARD: {selectedWardData.ward}
                </span>
                <h3 className="ward-explorer-name">
                  {selectedWardData.name}
                </h3>
              </div>
              <button
                type="button"
                className="ward-reset-btn"
                onClick={() => setSelectedWard("all")}
              >
                Reset to All Wards ✕
              </button>
            </div>

            <div className="ward-explorer-grid">
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Population</span>
                <strong className="explorer-card-value">
                  {selectedWardData.population.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Households</span>
                <strong className="explorer-card-value">
                  {selectedWardData.households.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Male</span>
                <strong className="explorer-card-value">
                  {selectedWardData.male.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Female</span>
                <strong className="explorer-card-value">
                  {selectedWardData.female.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {selectedHousingData && selectedHousingData.houseCondition && (
              <div className="ward-housing-bar">
                <span className="housing-bar-title">Housing Condition (HH-14):</span>
                <div className="housing-bar-chips">
                  <span className="housing-chip good-chip">
                    <span className="chip-dot good-dot"></span> Good:{" "}
                    <strong>{selectedHousingData.houseCondition.good}%</strong>
                  </span>
                  <span className="housing-chip livable-chip">
                    <span className="chip-dot livable-dot"></span> Livable:{" "}
                    <strong>{selectedHousingData.houseCondition.livable}%</strong>
                  </span>
                  <span className="housing-chip dilapidated-chip">
                    <span className="chip-dot dilapidated-dot"></span> Dilapidated:{" "}
                    <strong>{selectedHousingData.houseCondition.dilapidated}%</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="ward-table-hint">
            <span className="hint-icon">ⓘ</span>
            <span>Click on any ward row below or use the top dropdown to drill into specific residential indicators.</span>
          </div>
        )}

        <div className="table-wrapper">
          <table className="ward-table">
            <thead>
              <tr>
                <th>Ward No.</th>
                <th>Ward Name</th>
                <th className="text-right">Population</th>
                <th className="text-right">Households</th>
              </tr>
            </thead>
            <tbody>
              {sortedWards.map((ward) => (
                <tr
                  key={ward.ward}
                  className={
                    isWardMatch(ward.ward, selectedWard) ? "active-row" : ""
                  }
                  onClick={() =>
                    setSelectedWard(
                      isWardMatch(ward.ward, selectedWard) ? "all" : ward.ward
                    )
                  }
                >
                  <td className="ward-id">Ward {ward.ward}</td>
                  <td className="ward-name">{ward.name}</td>
                  <td className="text-right">
                    {ward.population.toLocaleString("en-IN")}
                  </td>
                  <td className="text-right">
                    {ward.households.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 05. HOUSING & RESIDENTIAL CONDITIONS */}
      <section className="dashboard-card">
        <div className="section-header-row">
          <SectionTitle
            number="05"
            title="Housing & Residential Conditions"
            description="House-condition indicators from Census HH-14."
          />
          <div className="housing-legend">
            <span className="legend-chip">
              <span className="legend-color good-color"></span> Good
            </span>
            <span className="legend-chip">
              <span className="legend-color livable-color"></span> Livable
            </span>
            <span className="legend-chip">
              <span className="legend-color dilapidated-color"></span> Dilapidated
            </span>
          </div>
        </div>
        <div className="chart-area full-chart">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={housing.slice(0, 20)}
              margin={{ top: 5, right: 15, left: -10, bottom: 15 }}
              barGap={2}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="ward"
                tick={{ fill: "#1e293b", fontSize: 10 }}
              />
              <YAxis unit="%" tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(val, name) => [`${val}%`, name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="houseCondition.good"
                name="Good"
                fill="#16a34a"
                radius={[2, 2, 0, 0]}
                barSize={11}
              />
              <Bar
                dataKey="houseCondition.livable"
                name="Livable"
                fill="#eab308"
                radius={[2, 2, 0, 0]}
                barSize={11}
              />
              <Bar
                dataKey="houseCondition.dilapidated"
                name="Dilapidated"
                fill="#dc2626"
                radius={[2, 2, 0, 0]}
                barSize={11}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 06. MUMBAI MIGRATION STORY */}
      <section className="dashboard-card">
        <SectionTitle
          number="06"
          title="Mumbai Migration Story"
          description="One evidence-based story from the data."
        />
        <div className="story-flow-row">
          <Story title="WHY" value="Work / Employment" />
          <div className="story-flow-arrow">→</div>
          <Story title="WHERE FROM" value={topOriginState} />
          <div className="story-flow-arrow">→</div>
          <Story title="HOW LONG" value="10+ years" />
          <div className="story-flow-arrow">→</div>
          <Story title="RESIDENTIAL CONTEXT" value="39 Mumbai wards" />
        </div>
      </section>

      {/* 3 STRONGEST INSIGHTS */}
      <section className="insights-section">
        <h2 className="section-heading-plain">3 Strongest Insights</h2>
        <div className="three-cards-grid">
          <InsightBox>
            Work / Employment is the leading recorded migration driver for Mumbai.
          </InsightBox>
          <InsightBox>
            {topOriginState} is the largest recorded origin state in the dataset.
          </InsightBox>
          <InsightBox>
            10+ years is the largest residence-duration category.
          </InsightBox>
        </div>
      </section>

      {/* 3 EVIDENCE-BASED RECOMMENDATIONS */}
      <section className="recommendations-section">
        <h2 className="section-heading-plain">
          3 Evidence-Based Recommendations
        </h2>
        <div className="three-cards-grid">
          <Recommendation>
            Strengthen employment-linked urban services in Mumbai.
          </Recommendation>
          <Recommendation>
            Plan housing and infrastructure for long-term residential settlement.
          </Recommendation>
          <Recommendation>
            Use ward-level population, household and housing indicators for targeted planning.
          </Recommendation>
        </div>
      </section>

      {/* DATA & SOURCES */}
      <footer className="footer-source">
        Source: Census of India 2011 — D-03 Migration, Primary Census Abstract, and HH-14 Housing Data.
      </footer>
    </div>
  );
}

/* =========================================================================
   MAHARASHTRA STATE DASHBOARD COMPONENT
========================================================================= */
function MaharashtraDashboard() {
  const [migration, setMigration] = useState(defaultMhMigration);
  const [districts, setDistricts] = useState(defaultMhDistricts);
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  useEffect(() => {
    const timestamp = Date.now();
    Promise.all([
      fetch(`/data/maharashtra_migration.json?t=${timestamp}`).then((r) => r.json()),
      fetch(`/data/maharashtra_districts.json?t=${timestamp}`).then((r) => r.json()),
    ])
      .then(([m, d]) => {
        if (m && m.totalMigrants) setMigration(m);
        if (d && d.length > 0) setDistricts(d);
      })
      .catch((err) => console.warn("Using bundled fallback MH data:", err));
  }, []);

  const work =
    migration?.reasons?.find((x) => x.reason === "Work / Employment")?.value || 0;

  const topOrigin = migration?.origins?.[0];
  const topOriginState = topOrigin ? topOrigin.state : "Uttar Pradesh";
  const originsChartData = migration?.origins?.slice(0, 10) || [];

  const longTerm =
    migration?.duration?.find((x) => x.duration === "10+ years")?.value || 0;

  // Selected district details
  const selectedDistrictData =
    selectedDistrict !== "all"
      ? districts.find((d) => d.district.toLowerCase() === selectedDistrict.toLowerCase())
      : null;

  return (
    <div className="page-container">
      {/* HERO */}
      <section className="hero-card">
        <div className="hero-eyebrow">MAHARASHTRA • CENSUS 2011</div>
        <h1 className="hero-heading">
          Migration Drivers &amp; Residential Patterns
        </h1>
        <p className="hero-subheading">
          Why people migrate to Maharashtra, where they come from, how long they stay, and the residential distribution across Maharashtra's 35 districts.
        </p>
      </section>

      {/* KPI ROW */}
      <section className="kpi-grid">
        <KPICard
          title="Total Migrants"
          value={migration.totalMigrants}
          note="Maharashtra State"
        />
        <KPICard
          title="Male Migrants"
          value={migration.gender.male}
          note="42.2% of migrants"
        />
        <KPICard
          title="Female Migrants"
          value={migration.gender.female}
          note="57.8% of migrants"
        />
        <KPICard
          title="Main Driver"
          value="Work / Employment"
          note={work}
        />
        <KPICard
          title="10+ Years"
          value={longTerm}
          note="51.1% of duration"
        />
        <KPICard
          title="Districts Covered"
          value={districts.length || 35}
          note="Statewide Coverage"
        />
      </section>

      {/* DASHBOARD VIEW / FILTER */}
      <section className="filter-card">
        <div className="filter-info">
          <h3 className="filter-title">Statewide District View</h3>
          <p className="filter-subtitle">
            Explore Maharashtra migration flows and district-level residential contexts.
          </p>
        </div>
        <div className="filter-control">
          <label htmlFor="district-select" className="filter-label">
            Select District
          </label>
          <select
            id="district-select"
            className="ward-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="all">All 35 Districts</option>
            {districts.map((d) => (
              <option key={d.district} value={d.district}>
                {d.district} ({d.migrants.toLocaleString("en-IN")} migrants)
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 01. MIGRATION DRIVERS — WHY */}
      <section className="dashboard-card">
        <SectionTitle
          number="01"
          title="Maharashtra Migration Drivers — WHY"
          description="Primary reasons recorded for migration across Maharashtra."
        />
        <div className="visual-row">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={[...migration.reasons].sort((a, b) => b.value - a.value)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 115, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}M`
                      : v >= 1000
                      ? `${(v / 1000).toFixed(0)}k`
                      : v
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="reason"
                  tick={{ fill: "#1e293b", fontSize: 11 }}
                  width={115}
                />
                <Tooltip
                  formatter={(val) => [
                    val.toLocaleString("en-IN"),
                    "Migrants",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="insight-card">
            <span className="insight-badge">KEY INSIGHT</span>
            <p className="insight-text">
              <strong>Work / Employment</strong> (7.9M) and <strong>Business</strong> (6.8M) are the leading economic drivers across Maharashtra.
            </p>
          </div>
        </div>
      </section>

      {/* 02. MIGRATION ORIGINS — WHERE FROM */}
      <section className="dashboard-card">
        <SectionTitle
          number="02"
          title="Maharashtra Migration Origins — WHERE FROM"
          description="Leading interstate origins of migrants residing in Maharashtra."
        />
        <div className="visual-row">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={originsChartData}
                margin={{ top: 8, right: 15, left: 5, bottom: 45 }}
                barCategoryGap="18%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="state"
                  angle={-28}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  tick={{ fill: "#1e293b", fontSize: 10.5, fontWeight: 500 }}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}M`
                      : `${(v / 1000).toFixed(0)}k`
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [
                    val.toLocaleString("en-IN"),
                    "Migrants",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="insight-card">
            <span className="insight-badge">KEY INSIGHT</span>
            <p className="insight-text">
              <strong>{topOriginState}</strong> (2.75M), <strong>Karnataka</strong> (1.40M), and <strong>Gujarat</strong> (0.98M) are Maharashtra's top origin states.
            </p>
          </div>
        </div>
      </section>

      {/* 03. RESIDENTIAL DURATION — HOW LONG */}
      <section className="dashboard-card">
        <SectionTitle
          number="03"
          title="Residential Duration — HOW LONG"
          description="Duration of stay among migrants across Maharashtra."
        />
        <div className="visual-row">
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={migration.duration}
                margin={{ top: 8, right: 20, left: 5, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="duration"
                  tick={{ fill: "#1e293b", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(0)}M`
                      : `${(v / 1000).toFixed(0)}k`
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [
                    val.toLocaleString("en-IN"),
                    "Migrants",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  barSize={52}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="insight-card">
            <span className="insight-badge">KEY INSIGHT</span>
            <p className="insight-text">
              Over <strong>29.3 Million</strong> migrants (51.1%) have lived in Maharashtra for 10+ years, indicating permanent settlement.
            </p>
          </div>
        </div>
      </section>

      {/* 04. DISTRICT CONTEXT — WHERE */}
      <section className="dashboard-card">
        <SectionTitle
          number="04"
          title="District &amp; Regional Context — WHERE"
          description="Migration distribution across Maharashtra's 35 districts."
        />

        {/* DISTRICT DRILLDOWN CARD */}
        {selectedDistrictData ? (
          <div className="ward-explorer-panel">
            <div className="ward-explorer-header">
              <div className="ward-explorer-title-wrap">
                <span className="ward-explorer-tag">
                  SELECTED DISTRICT
                </span>
                <h3 className="ward-explorer-name">
                  District {selectedDistrictData.district}
                </h3>
              </div>
              <button
                type="button"
                className="ward-reset-btn"
                onClick={() => setSelectedDistrict("all")}
              >
                Reset to All Districts ✕
              </button>
            </div>

            <div className="ward-explorer-grid">
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Total Migrants</span>
                <strong className="explorer-card-value">
                  {selectedDistrictData.migrants.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Male Migrants</span>
                <strong className="explorer-card-value">
                  {selectedDistrictData.male.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="ward-explorer-card">
                <span className="explorer-card-label">Female Migrants</span>
                <strong className="explorer-card-value">
                  {selectedDistrictData.female.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="ward-explorer-card">
                <span className="explorer-card-label">State Share</span>
                <strong className="explorer-card-value">
                  {((selectedDistrictData.migrants / migration.totalMigrants) * 100).toFixed(1)}%
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="ward-table-hint">
            <span className="hint-icon">ⓘ</span>
            <span>Click any district row below or choose from the dropdown to inspect district-level migration metrics.</span>
          </div>
        )}

        <div className="table-wrapper">
          <table className="ward-table">
            <thead>
              <tr>
                <th>District</th>
                <th className="text-right">Total Migrants</th>
                <th className="text-right">Male</th>
                <th className="text-right">Female</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => (
                <tr
                  key={d.district}
                  className={
                    selectedDistrict.toLowerCase() === d.district.toLowerCase()
                      ? "active-row"
                      : ""
                  }
                  onClick={() =>
                    setSelectedDistrict(
                      selectedDistrict.toLowerCase() === d.district.toLowerCase()
                        ? "all"
                        : d.district
                    )
                  }
                >
                  <td className="ward-id">{d.district}</td>
                  <td className="text-right">
                    {d.migrants.toLocaleString("en-IN")}
                  </td>
                  <td className="text-right">
                    {d.male.toLocaleString("en-IN")}
                  </td>
                  <td className="text-right">
                    {d.female.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 05. HOUSING & RESIDENTIAL CONDITIONS */}
      <section className="dashboard-card">
        <div className="section-header-row">
          <SectionTitle
            number="05"
            title="Housing &amp; Residential Conditions"
            description="Statewide housing condition benchmarks from Census HH-14."
          />
          <div className="housing-legend">
            <span className="legend-chip">
              <span className="legend-color good-color"></span> Good
            </span>
            <span className="legend-chip">
              <span className="legend-color livable-color"></span> Livable
            </span>
            <span className="legend-chip">
              <span className="legend-color dilapidated-color"></span> Dilapidated
            </span>
          </div>
        </div>
        <div className="chart-area full-chart">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={[
                { region: "Thane", good: 78.4, livable: 20.1, dilapidated: 1.5 },
                { region: "Pune", good: 76.8, livable: 21.4, dilapidated: 1.8 },
                { region: "Mumbai Suburban", good: 74.5, livable: 23.8, dilapidated: 1.7 },
                { region: "Nashik", good: 71.2, livable: 26.5, dilapidated: 2.3 },
                { region: "Nagpur", good: 69.8, livable: 27.9, dilapidated: 2.3 },
                { region: "Kolhapur", good: 75.1, livable: 23.2, dilapidated: 1.7 },
                { region: "Aurangabad", good: 68.5, livable: 28.7, dilapidated: 2.8 },
                { region: "Solapur", good: 66.4, livable: 30.5, dilapidated: 3.1 },
                { region: "Amravati", good: 65.2, livable: 31.6, dilapidated: 3.2 },
                { region: "State Average", good: 72.2, livable: 26.2, dilapidated: 1.6 }
              ]}
              margin={{ top: 5, right: 15, left: -10, bottom: 25 }}
              barGap={2}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="region"
                tick={{ fill: "#1e293b", fontSize: 10.5 }}
              />
              <YAxis unit="%" tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(val, name) => [`${val}%`, name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="good"
                name="Good"
                fill="#16a34a"
                radius={[2, 2, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="livable"
                name="Livable"
                fill="#eab308"
                radius={[2, 2, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="dilapidated"
                name="Dilapidated"
                fill="#dc2626"
                radius={[2, 2, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 06. MAHARASHTRA MIGRATION STORY */}
      <section className="dashboard-card">
        <SectionTitle
          number="06"
          title="Maharashtra Migration Story"
          description="One evidence-based statewide story from the data."
        />
        <div className="story-flow-row">
          <Story title="WHY" value="Work (7.9M) & Business (6.8M)" />
          <div className="story-flow-arrow">→</div>
          <Story title="WHERE FROM" value="UP (2.75M) & Karnataka (1.4M)" />
          <div className="story-flow-arrow">→</div>
          <Story title="HOW LONG" value="10+ years (29.3M migrants)" />
          <div className="story-flow-arrow">→</div>
          <Story title="REGIONAL CONTEXT" value="35 Districts (Thane & Pune lead)" />
        </div>
      </section>

      {/* 3 STRONGEST INSIGHTS */}
      <section className="insights-section">
        <h2 className="section-heading-plain">3 Strongest Insights</h2>
        <div className="three-cards-grid">
          <InsightBox>
            Thane (7.43M) and Pune (6.09M) together host over 23.5% of all migrants in Maharashtra.
          </InsightBox>
          <InsightBox>
            Over 51% (29.3 Million) of migrants have resided at their destination for 10+ years.
          </InsightBox>
          <InsightBox>
            Uttar Pradesh (2.75M) and Karnataka (1.40M) are the leading interstate contributor states.
          </InsightBox>
        </div>
      </section>

      {/* 3 EVIDENCE-BASED RECOMMENDATIONS */}
      <section className="recommendations-section">
        <h2 className="section-heading-plain">
          3 Evidence-Based Recommendations
        </h2>
        <div className="three-cards-grid">
          <Recommendation>
            Prioritize infrastructure corridors connecting Mumbai-Thane-Pune growth centers.
          </Recommendation>
          <Recommendation>
            Develop Tier-2 industrial clusters (Nashik, Nagpur, Aurangabad) to balance migration inflows.
          </Recommendation>
          <Recommendation>
            Expand permanent affordable housing and social security for long-term residential migrants.
          </Recommendation>
        </div>
      </section>

      {/* DATA & SOURCES */}
      <footer className="footer-source">
        Source: Census of India 2011 — D-03 Migration, Primary Census Abstract, and HH-14 Housing Data.
      </footer>
    </div>
  );
}

/* =========================================================================
   REUSABLE UI COMPONENTS
========================================================================= */
function KPICard({ title, value, note }) {
  const formatted =
    typeof value === "number" ? value.toLocaleString("en-IN") : value;
  const formattedNote =
    typeof note === "number" ? note.toLocaleString("en-IN") : note;

  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>
      <div className="kpi-number">{formatted}</div>
      <div className="kpi-subtext">{formattedNote}</div>
    </div>
  );
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="section-header">
      <div className="section-badge">{number}</div>
      <div className="section-header-text">
        <h2 className="section-title-text">{title}</h2>
        <p className="section-desc-text">{description}</p>
      </div>
    </div>
  );
}

function InsightBox({ children }) {
  return (
    <div className="insight-card-pill">
      <span className="insight-check">✓</span>
      <p className="insight-pill-text">{children}</p>
    </div>
  );
}

function Recommendation({ children }) {
  return (
    <div className="recommendation-card-pill">
      <span className="rec-arrow">→</span>
      <p className="rec-pill-text">{children}</p>
    </div>
  );
}

function Story({ title, value }) {
  return (
    <div className="story-step-card">
      <span className="story-step-label">{title}</span>
      <strong className="story-step-value">{value}</strong>
    </div>
  );
}

export default App;