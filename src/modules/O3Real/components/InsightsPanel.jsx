import React from 'react';
import { Lightbulb, Target } from 'lucide-react';

export default function InsightsPanel({
  insights,
  priorities
}) {
  return (
    <section id="section-recommendations" className="insights-panel-section" aria-label="Key Findings and Planning Priorities">
      {/* Dynamic Data Insights */}
      <div className="insights-block">
        <div className="section-title-wrap">
          <Lightbulb size={22} className="text-amber" />
          <div>
            <h2 className="section-main-title">What the Data Tells Us</h2>
            <p className="section-sub-title">
              Core findings from comparing Mumbai's 24 municipal wards
            </p>
          </div>
        </div>

        <div className="insights-grid">
          {insights?.map((item, idx) => (
            <article key={idx} className={`insight-card type-${item.type}`}>
              <div className="insight-card-top">
                <span className="insight-type-badge">{item.title}</span>
                {item.highlight && <span className="insight-stat-pill">{item.highlight}</span>}
              </div>
              <p className="insight-card-body">{item.text}</p>
              {item.keyTakeaway && (
                <div className="insight-takeaway-box">
                  <span className="insight-takeaway-label">Key Takeaway:</span> {item.keyTakeaway}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Evidence-Based Planning Priorities */}
      <div className="priorities-block">
        <div className="section-title-wrap">
          <Target size={22} className="text-teal" />
          <div>
            <h2 className="section-main-title">Recommendations for Urban Planners</h2>
            <p className="section-sub-title">
              Simple points to explain: Problem, Solution &amp; Benefit
            </p>
          </div>
        </div>

        <div className="priorities-list">
          {priorities?.map((item, idx) => (
            <div key={idx} className="priority-card">
              <div className="priority-number-badge">{idx + 1}</div>
              <div className="priority-content">
                <h4 className="priority-action-title">{item.action}</h4>
                {item.problem ? (
                  <div className="priority-points-list">
                    <div className="priority-point-item">
                      <span className="point-tag tag-problem">Problem</span>
                      <span className="point-text">{item.problem}</span>
                    </div>
                    <div className="priority-point-item">
                      <span className="point-tag tag-action">Solution</span>
                      <span className="point-text">{item.actionPlan}</span>
                    </div>
                    <div className="priority-point-item">
                      <span className="point-tag tag-impact">Benefit</span>
                      <span className="point-text">{item.expectedImpact}</span>
                    </div>
                  </div>
                ) : (
                  <p className="priority-rationale-text">{item.rationale}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
