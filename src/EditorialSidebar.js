// EditorialSidebar.js — Editorial design sidebar navigation

import React, { useMemo } from 'react';
import './EditorialTheme.css';
import { EditorialIcon } from './EditorialComponents';
import { getBuildingRenderState } from './availability';

const EditorialSidebar = ({
  buildingsData,
  selectedCategory = 'classrooms',
  onCategoryChange,
  onBuildingSelect,
  selectedBuilding,
  darkMode,
  toggleDarkMode,
  designMode,
  toggleDesignMode,
  selectedStartDateTime,
  selectedEndDateTime,
  viewMode,
  parkingData = [],
  diningHalls = [],
}) => {
  // Calculate live counts for each category
  const stats = useMemo(() => {
    const classroomBuildings = buildingsData.filter(b =>
      b.classrooms?.some(r => !r.source || r.source === '25live')
    );
    const libraryBuildings = buildingsData.filter(b =>
      b.classrooms?.some(r => r.source === 'libcal')
    );

    const isNow = viewMode === 'now';
    const startTime = isNow ? new Date() : selectedStartDateTime;
    const endTime = isNow ? null : selectedEndDateTime;

    let classroomsFree = 0;
    let classroomsTotal = 0;
    classroomBuildings.forEach(b => {
      const rooms = b.classrooms.filter(r => !r.source || r.source === '25live');
      classroomsTotal += rooms.length;
      rooms.forEach(r => {
        const state = getBuildingRenderState([r], { startTime, endTime, isNow });
        if (state.status === 'available') classroomsFree++;
      });
    });

    let libraryFree = 0;
    let libraryTotal = 0;
    libraryBuildings.forEach(b => {
      const rooms = b.classrooms.filter(r => r.source === 'libcal');
      libraryTotal += rooms.length;
      rooms.forEach(r => {
        const state = getBuildingRenderState([r], { startTime, endTime, isNow, sourceFilter: ['libcal'] });
        if (state.status === 'available') libraryFree++;
      });
    });

    const parkingFree = parkingData.filter(p => p.type === 'free').length;
    const parkingTotal = parkingData.length;
    const diningOpen = diningHalls.length; // Simplified for now
    const diningTotal = diningHalls.length;

    return {
      classroomsFree,
      classroomsTotal,
      libraryFree,
      libraryTotal,
      parkingFree,
      parkingTotal,
      diningOpen,
      diningTotal,
    };
  }, [buildingsData, viewMode, selectedStartDateTime, selectedEndDateTime, parkingData, diningHalls]);

  // Get buildings with their free/total counts
  const buildingsWithCounts = useMemo(() => {
    const isNow = viewMode === 'now';
    const startTime = isNow ? new Date() : selectedStartDateTime;
    const endTime = isNow ? null : selectedEndDateTime;

    return buildingsData
      .map(b => {
        const rooms = b.classrooms || [];
        const total = rooms.length;
        let free = 0;

        rooms.forEach(r => {
          const state = getBuildingRenderState([r], {
            startTime,
            endTime,
            isNow,
            sourceFilter: r.source === 'libcal' ? ['libcal'] : undefined
          });
          if (state.status === 'available') free++;
        });

        return { ...b, freeCount: free, totalCount: total };
      })
      .filter(b => b.totalCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [buildingsData, viewMode, selectedStartDateTime, selectedEndDateTime]);

  return (
    <div className="ed-sidebar">
      {/* Brand */}
      <div className="ed-brand">
        <div className="mark">
          UMD<em>rooms.</em>
        </div>
        <div className="umd-tag">UMD</div>
      </div>

      <hr className="ed-hair" />

      {/* Browse Navigation */}
      <nav className="ed-nav">
        <h6>Browse</h6>
        <button
          className="ed-nav-item"
          aria-current={selectedCategory === 'classrooms' ? 'true' : 'false'}
          onClick={() => onCategoryChange?.('classrooms')}
        >
          <span>Classrooms</span>
          <span className="count">{stats.classroomsFree}/{stats.classroomsTotal}</span>
        </button>
        <button
          className="ed-nav-item"
          aria-current={selectedCategory === 'library' ? 'true' : 'false'}
          onClick={() => onCategoryChange?.('library')}
        >
          <span>Library</span>
          <span className="count">{stats.libraryFree}/{stats.libraryTotal}</span>
        </button>
        <button
          className="ed-nav-item"
          aria-current={selectedCategory === 'parking' ? 'true' : 'false'}
          onClick={() => onCategoryChange?.('parking')}
        >
          <span>Parking</span>
          <span className="count">{stats.parkingTotal}</span>
        </button>
        <button
          className="ed-nav-item"
          aria-current={selectedCategory === 'dining' ? 'true' : 'false'}
          onClick={() => onCategoryChange?.('dining')}
        >
          <span>Dining</span>
          <span className="count">{stats.diningTotal}</span>
        </button>
      </nav>

      <hr className="ed-hair" />

      {/* Buildings Navigation */}
      <nav className="ed-nav" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <h6>Buildings</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {buildingsWithCounts.map(building => (
            <button
              key={building.code}
              className="ed-nav-item"
              aria-current={selectedBuilding?.code === building.code ? 'true' : 'false'}
              onClick={() => onBuildingSelect?.(building)}
            >
              <span>{building.code}</span>
              <span className="count">{building.freeCount}/{building.totalCount}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Settings & User */}
      <div className="me">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <button
            className="ed-mode-toggle"
            onClick={toggleDarkMode}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <span className="ed-mode-toggle-icon">
              {darkMode ? EditorialIcon.user() : EditorialIcon.user()}
            </span>
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button
            className="ed-mode-toggle"
            onClick={toggleDesignMode}
            title="Switch design"
            style={{ fontSize: 10, opacity: 0.5, padding: '4px 8px' }}
          >
            <span className="ed-mode-toggle-icon">{EditorialIcon.toggle()}</span>
            <span>Switch UI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorialSidebar;
