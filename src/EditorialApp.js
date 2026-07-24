// EditorialApp.js — Editorial design wrapper for the entire app

import React, { useState, useMemo } from 'react';
import './EditorialTheme.css';
import EditorialSidebar from './EditorialSidebar';
import EditorialMain from './EditorialMain';
import { PARKING_RULES } from './parkingData';

const EditorialApp = ({
  buildingsData,
  selectedBuilding,
  onBuildingSelect,
  selectedRoomId,
  onRoomSelect,
  selectedStartDateTime,
  selectedEndDateTime,
  viewMode,
  darkMode,
  toggleDarkMode,
  designMode,
  toggleDesignMode,
  favoriteBuildings,
  favoriteRooms,
  diningHalls,
  selectedDining,
  onDiningSelect,
  navigateTarget,
  onNavigateComplete,
  userLocation,
  mapResetToken,
  mapVisibility,
  durationFilter,
  onParkingSelect,
  onEndDateTimeChange,
  onStartDateTimeChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('classrooms');

  const handleRoomClick = (roomId) => {
    console.log('Room clicked:', roomId);
    if (onRoomSelect) {
      onRoomSelect(roomId);
    }
  };

  const handleBuildingClick = (building) => {
    console.log('Building clicked:', building?.code, building?.name);
    if (onBuildingSelect) {
      onBuildingSelect(building);
    }
  };

  // Prepare parking data
  const parkingData = useMemo(() => {
    const freeLots = Object.entries(PARKING_RULES.free_lots || {}).map(([name, data]) => ({
      id: name,
      name,
      ...data,
      type: 'free',
    }));
    const paidGarages = Object.entries(PARKING_RULES.paid_visitor_garages || {}).map(([name, data]) => ({
      id: name,
      name,
      ...data,
      type: 'paid',
    }));
    return [...freeLots, ...paidGarages];
  }, []);

  return (
    <div className={`editorial-theme ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>
      <div className="ed-shell">
        <EditorialSidebar
          buildingsData={buildingsData}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onBuildingSelect={handleBuildingClick}
          selectedBuilding={selectedBuilding}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          designMode={designMode}
          toggleDesignMode={toggleDesignMode}
          selectedStartDateTime={selectedStartDateTime}
          selectedEndDateTime={selectedEndDateTime}
          viewMode={viewMode}
          parkingData={parkingData}
          diningHalls={diningHalls}
        />

        <EditorialMain
          buildingsData={buildingsData}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStartDateTime={selectedStartDateTime}
          selectedEndDateTime={selectedEndDateTime}
          viewMode={viewMode}
          onRoomSelect={handleRoomClick}
          onParkingSelect={onParkingSelect}
          onDiningSelect={onDiningSelect}
          favoriteRooms={favoriteRooms}
          favoriteBuildings={favoriteBuildings}
          parkingData={parkingData}
          diningHalls={diningHalls}
          selectedBuilding={selectedBuilding}
          onBuildingSelect={handleBuildingClick}
          selectedRoomId={selectedRoomId}
          darkMode={darkMode}
          userLocation={userLocation}
          navigateTarget={navigateTarget}
          onNavigateComplete={onNavigateComplete}
          mapResetToken={mapResetToken}
          mapVisibility={mapVisibility}
        />

      </div>
    </div>
  );
};

export default EditorialApp;
