import React from 'react';

export default function FarmScene({ compact = false }) {
  return (
    <div className={`farm-scene ${compact ? 'farm-scene-compact' : ''}`} aria-hidden="true">
      <div className="farm-sky">
        <div className="farm-sun" />
        <div className="farm-cloud farm-cloud-1" />
        <div className="farm-cloud farm-cloud-2" />
        <div className="farm-cloud farm-cloud-3" />
        <span className="farm-bird farm-bird-1" />
        <span className="farm-bird farm-bird-2" />
      </div>
      <div className="farm-hill farm-hill-far" />
      <div className="farm-hill farm-hill-near" />
      <div className="farm-barn">
        <span className="barn-roof" />
        <span className="barn-wall" />
        <span className="barn-door" />
      </div>
      <div className="farm-tree">
        <span className="farm-canopy farm-canopy-back" />
        <span className="farm-canopy" />
        <span className="farm-trunk" />
      </div>
      <div className="farm-crops">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="farm-stalk" style={{ '--delay': `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="farm-farmer">
        <span className="farmer-hat" />
        <span className="farmer-head" />
        <span className="farmer-torso" />
        <span className="farmer-arm farmer-arm-l" />
        <span className="farmer-arm farmer-arm-r" />
        <span className="farmer-leg farmer-leg-l" />
        <span className="farmer-leg farmer-leg-r" />
      </div>
      <div className="farm-ground" />
    </div>
  );
}
