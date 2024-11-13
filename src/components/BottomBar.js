import React, { useEffect, useState, useContext } from 'react';
import RulesModal from './RulesModal';
import { FaInfoCircle } from 'react-icons/fa';

const BottomBar = () => {

    const [showRulesModal, setShowRulesModal] = useState(false);

    return (
        <div>
            <div className="bottom-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#151619', padding: '10px', boxShadow: '0 -2px 5px rgba(0,0,0,0.5)' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'default' }}>
                    <FaInfoCircle size={24} color="#151619" />
                </button>
                <div className="rainbow-glow" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'Source Code Pro', fontWeight: 'bold', color: '#eaeaea', fontSize: '1.25rem' }}>created by <a target='_blank' href="https://github.com/curious-droid" style={{ fontFamily: 'Source Code Pro', fontWeight: 'bold', color: '#eaeaea', fontSize: '1.25rem', textDecoration: 'none' }}>curious-droid</a></div>
                </div>
                <button onClick={() => setShowRulesModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FaInfoCircle size={24} color="#eaeaea" />
                </button>
            </div>
            <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
        </div>
    );
}

export default BottomBar;