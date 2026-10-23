import React from 'react';
import { Sprout } from 'lucide-react';

export default function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark" aria-hidden="true">
        <Sprout size={22} />
      </div>
      <div className="brand-copy">
        <span className="brand-name">KhetMitra</span>
        <span className="brand-tag">Smart Crop Protection</span>
      </div>
    </div>
  );
}
