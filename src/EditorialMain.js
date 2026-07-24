// EditorialMain.js — Editorial design main content area

import React, { useMemo, lazy, Suspense } from 'react';
import './EditorialTheme.css';
import {
  EditorialRoomCard,
  EditorialBuildingSection,
  EditorialPill,
  formatClock,
  formatDay,
} from './EditorialComponents';
import { getRoomRenderState } from './availability';
import { getDiningStatusInfo } from './diningData';

const CampusMap = lazy(() => import('./Map'));

const EditorialMain = ({
  buildingsData = [],
  selectedCategory = 'classrooms',
  onCategoryChange,
  selectedStartDateTime,
  selectedEndDateTime,
  viewMode,
  onRoomSelect,
  onParkingSelect,
  onDiningSelect,
  favoriteRooms = [],
  favoriteBuildings = [],
  parkingData = [],
  diningHalls = [],
  selectedBuilding,
  onBuildingSelect,
  selectedRoomId,
  darkMode,
  userLocation,
  navigateTarget,
  onNavigateComplete,
  mapResetToken,
  mapVisibility,
}) => {
  const now = useMemo(() => new Date(), []);
  const isNow = viewMode === 'now';
  const startTime = isNow ? now : selectedStartDateTime;
  const endTime = isNow ? null : selectedEndDateTime;

  console.log('EditorialMain render:', {
    buildingsDataLength: buildingsData.length,
    selectedCategory,
    viewMode,
    isNow
  });

  // Calculate stats for all categories
  const stats = useMemo(() => {
    const classroomBuildings = buildingsData.filter(b =>
      b.classrooms?.some(r => !r.source || r.source === '25live')
    );
    const libraryBuildings = buildingsData.filter(b =>
      b.classrooms?.some(r => r.source === 'libcal')
    );

    let classroomsFree = 0;
    let classroomsTotal = 0;
    classroomBuildings.forEach(b => {
      const rooms = b.classrooms.filter(r => !r.source || r.source === '25live');
      classroomsTotal += rooms.length;
      rooms.forEach(r => {
        const state = getRoomRenderState(r, { startTime, endTime, isNow });
        if (state.status === 'available') classroomsFree++;
      });
    });

    let libraryFree = 0;
    let libraryTotal = 0;
    libraryBuildings.forEach(b => {
      const rooms = b.classrooms.filter(r => r.source === 'libcal');
      libraryTotal += rooms.length;
      rooms.forEach(r => {
        const state = getRoomRenderState(r, { startTime, endTime, isNow, sourceFilter: ['libcal'] });
        if (state.status === 'available') libraryFree++;
      });
    });

    // Calculate parking stats
    const parkingFree = parkingData.filter(p => p.type === 'free').length;
    const parkingTotal = parkingData.length;

    // Calculate dining stats
    let diningOpen = 0;
    diningHalls.forEach(hall => {
      const status = getDiningStatusInfo(hall, now);
      if (status.status === 'available') diningOpen++;
    });
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
  }, [buildingsData, startTime, endTime, isNow, parkingData, diningHalls, now]);

  // Filter buildings by selected category
  const filteredBuildings = useMemo(() => {
    if (selectedCategory === 'classrooms') {
      return buildingsData.filter(b =>
        b.classrooms?.some(r => !r.source || r.source === '25live')
      );
    } else if (selectedCategory === 'library') {
      return buildingsData.filter(b =>
        b.classrooms?.some(r => r.source === 'libcal')
      );
    }
    return buildingsData;
  }, [buildingsData, selectedCategory]);

  // Create timeline blocks for a room (24 hours)
  const createTimelineBlocks = (room) => {
    const blocks = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourTime = new Date(startTime);
      hourTime.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourTime);
      hourEnd.setHours(hour + 1, 0, 0, 0);

      const state = getRoomRenderState(room, {
        startTime: hourTime,
        endTime: hourEnd,
        isNow: false,
        sourceFilter: room.source === 'libcal' ? ['libcal'] : undefined
      });

      if (state.status === 'available') blocks.push(0);
      else if (state.status === 'tentative') blocks.push(2);
      else blocks.push(1);
    }
    return blocks;
  };

  const currentHour = now.getHours();

  return (
    <div className="ed-main">
      {/* Page Header */}
      <div className="ed-page-head">
        <div>
          <div className="kicker ed-tnum">
            Vol. 04 · University of Maryland · {formatDay(now)}
          </div>
          <h1>
            The campus, <em>right now.</em>
          </h1>
        </div>
        <div className="meta">
          <div className="ed-hstack" style={{ justifyContent: 'flex-end', gap: 8, marginBottom: 6 }}>
            <span className="live-dot" /> <span className="ed-cap">Live from 25Live + LibCal</span>
          </div>
          <div className="now ed-tnum">{formatClock(now)}</div>
          <div className="ed-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
            College Park, MD · updated recently
          </div>
        </div>
      </div>

      <div className="ed-content">
        {/* Category Tabs */}
        <div className="ed-cat-tabs">
          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
          <div
            role="button"
            tabIndex={0}
            className="ed-cat-tab"
            aria-selected={selectedCategory === 'classrooms'}
            onClick={() => onCategoryChange?.('classrooms')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCategoryChange?.('classrooms'); }}
          >
            <div className="k">i. Classrooms</div>
            <div className="big ed-tnum">
              {stats.classroomsFree}<span className="sub"> / {stats.classroomsTotal}</span>
            </div>
            <div className="sub-line">Open now across {filteredBuildings.length} buildings</div>
          </div>

          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
          <div
            role="button"
            tabIndex={0}
            className="ed-cat-tab"
            aria-selected={selectedCategory === 'library'}
            onClick={() => onCategoryChange?.('library')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCategoryChange?.('library'); }}
          >
            <div className="k">ii. Library study rooms</div>
            <div className="big ed-tnum">
              {stats.libraryFree}<span className="sub"> / {stats.libraryTotal}</span>
            </div>
            <div className="sub-line">Bookable via LibCal · McKeldin + 3</div>
          </div>

          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
          <div
            role="button"
            tabIndex={0}
            className="ed-cat-tab"
            aria-selected={selectedCategory === 'parking'}
            onClick={() => onCategoryChange?.('parking')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCategoryChange?.('parking'); }}
          >
            <div className="k">iii. Parking</div>
            <div className="big ed-tnum">
              {stats.parkingFree}<span className="sub"> / {stats.parkingTotal}</span>
            </div>
            <div className="sub-line">Free lots · {stats.parkingTotal - stats.parkingFree} paid garages</div>
          </div>

          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
          <div
            role="button"
            tabIndex={0}
            className="ed-cat-tab"
            aria-selected={selectedCategory === 'dining'}
            onClick={() => onCategoryChange?.('dining')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCategoryChange?.('dining'); }}
          >
            <div className="k">iv. Dining</div>
            <div className="big ed-tnum">
              {stats.diningOpen}<span className="sub"> / {stats.diningTotal}</span>
            </div>
            <div className="sub-line">Halls open right now</div>
          </div>
        </div>

        {/* Editorial Shelf - Featured Content */}
        {(selectedCategory === 'classrooms' || selectedCategory === 'library') && (
          <div className="ed-shelf" style={{ marginTop: 40, marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ed-ink-2)' }}>
                Feature · Shelf №01
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              <div>
                <h2 className="ed-serif" style={{ fontSize: 36, lineHeight: 1.2, marginBottom: 12 }}>
                  {filteredBuildings.length > 0 ? (
                    <>
                      The quietest building on campus this hour is <em style={{ color: 'var(--ed-free)' }}>
                        {filteredBuildings.reduce((max, b) => {
                          const maxFree = max.classrooms?.filter(r => {
                            const state = getRoomRenderState(r, { startTime, endTime, isNow, sourceFilter: r.source === 'libcal' ? ['libcal'] : undefined });
                            return state.status === 'available';
                          }).length || 0;
                          const bFree = b.classrooms?.filter(r => {
                            const state = getRoomRenderState(r, { startTime, endTime, isNow, sourceFilter: r.source === 'libcal' ? ['libcal'] : undefined });
                            return state.status === 'available';
                          }).length || 0;
                          return bFree > maxFree ? b : max;
                        }, filteredBuildings[0])?.name || 'Unknown'}
                      </em>.
                    </>
                  ) : (
                    'No buildings available right now.'
                  )}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ed-ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
                  Real-time availability from UMD's 25Live system. Data updates every 6 hours.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="ed-btn-primary" onClick={() => onCategoryChange?.(selectedCategory)}>
                    Search all rooms
                  </button>
                  <button className="ed-btn-secondary" onClick={() => window.scrollTo({ top: document.getElementById('ed-map')?.offsetTop || 0, behavior: 'smooth' })}>
                    Open map fullscreen
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ed-ink-3)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: 12 }}>
                  <strong style={{ color: 'var(--ed-ink)' }}>About this data:</strong> We aggregate real-time classroom
                  scheduling information from UMD's official 25Live system and LibCal for library study rooms.
                </p>
                <p>
                  Updates occur automatically throughout the day. For the most accurate availability, we recommend
                  checking within 30 minutes of your desired time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campus Map Section */}
        {(selectedCategory === 'classrooms' || selectedCategory === 'library') && (
          <div id="ed-map" style={{ marginTop: 32, marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 className="ed-serif" style={{ fontSize: 24, marginBottom: 4 }}>
                Campus Overview
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ed-ink-2)' }}>
                Interactive map showing building availability across campus
              </p>
            </div>
            <div style={{
              height: '500px',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid var(--ed-hair-strong)',
              backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
            }}>
              <Suspense fallback={
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ed-ink-2)'
                }}>
                  Loading map...
                </div>
              }>
                <CampusMap
                  buildingsData={buildingsData}
                  selectedBuilding={selectedBuilding}
                  onBuildingSelect={onBuildingSelect}
                  selectedRoomId={selectedRoomId}
                  darkMode={darkMode}
                  viewMode={viewMode}
                  selectedStartDateTime={selectedStartDateTime}
                  selectedEndDateTime={selectedEndDateTime}
                  favoriteBuildings={favoriteBuildings}
                  userLocation={userLocation}
                  navigateTarget={navigateTarget}
                  onNavigateComplete={onNavigateComplete}
                  mapResetToken={mapResetToken}
                  mapVisibility={mapVisibility}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* Buildings Grid */}
        {(selectedCategory === 'classrooms' || selectedCategory === 'library') && (
          <div className="ed-buildings" style={{ marginTop: 40 }}>
            <div style={{ marginBottom: 24 }}>
              <h3 className="ed-serif" style={{ fontSize: 24, marginBottom: 4 }}>
                By building
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ed-ink-2)' }}>
                All available rooms organized by building location
              </p>
            </div>
            {filteredBuildings.map(building => {
              const rooms = building.classrooms?.filter(r =>
                selectedCategory === 'library'
                  ? r.source === 'libcal'
                  : (!r.source || r.source === '25live')
              ) || [];

              if (rooms.length === 0) return null;

              let freeCount = 0;
              rooms.forEach(r => {
                const state = getRoomRenderState(r, {
                  startTime,
                  endTime,
                  isNow,
                  sourceFilter: selectedCategory === 'library' ? ['libcal'] : undefined
                });
                if (state.status === 'available') freeCount++;
              });

              console.log(`Building ${building.code}: ${freeCount}/${rooms.length} free`);

              return (
                <EditorialBuildingSection
                  key={building.code}
                  building={building}
                  freeCount={freeCount}
                  totalCount={rooms.length}
                >
                  <div className="ed-room-grid">
                    {rooms.slice(0, 8).map(room => {
                      const state = getRoomRenderState(room, {
                        startTime,
                        endTime,
                        isNow,
                        sourceFilter: selectedCategory === 'library' ? ['libcal'] : undefined
                      });

                      const timeline = createTimelineBlocks(room);
                      const isFavorite = favoriteRooms?.some(f => f.id === room.id);

                      return (
                        <EditorialRoomCard
                          key={room.id}
                          buildingCode={building.code}
                          roomNumber={room.name}
                          capacity={room.capacity}
                          status={state.status}
                          timeline={timeline}
                          nowIdx={currentHour}
                          onClick={() => onRoomSelect?.(room.id)}
                          amenities={room.amenities || []}
                          isFavorite={isFavorite}
                        />
                      );
                    })}
                  </div>
                </EditorialBuildingSection>
              );
            })}
          </div>
        )}

        {/* Parking lots and garages */}
        {selectedCategory === 'parking' && (
          <div style={{ marginTop: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 className="ed-serif" style={{ fontSize: 28, marginBottom: 8 }}>
                Free Lots <span style={{ color: 'var(--ed-ink-3)' }}>({stats.parkingFree})</span>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ed-ink-2)' }}>
                Free after 16:00 weekdays and all day on weekends
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {parkingData.filter(p => p.type === 'free').map(lot => (
                <div
                  key={lot.id}
                  className="ed-room-card"
                  onClick={() => onParkingSelect?.(lot)}
                >
                  <div>
                    <h4 className="ed-serif" style={{ fontSize: 18, marginBottom: 6 }}>
                      {lot.name}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--ed-ink-2)', lineHeight: 1.5 }}>
                      {lot.description}
                    </p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <EditorialPill variant="free">Free after 4pm</EditorialPill>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40, marginBottom: 24 }}>
              <h2 className="ed-serif" style={{ fontSize: 28, marginBottom: 8 }}>
                Paid Garages <span style={{ color: 'var(--ed-ink-3)' }}>({stats.parkingTotal - stats.parkingFree})</span>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ed-ink-2)' }}>
                Paid parking or permit required
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {parkingData.filter(p => p.type === 'paid').map(garage => (
                <div
                  key={garage.id}
                  className="ed-room-card"
                  onClick={() => onParkingSelect?.(garage)}
                >
                  <div>
                    <h4 className="ed-serif" style={{ fontSize: 18, marginBottom: 6 }}>
                      {garage.name}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--ed-ink-2)', lineHeight: 1.5 }}>
                      {garage.description}
                    </p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <EditorialPill variant="muted">Paid / Permit</EditorialPill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dining halls */}
        {selectedCategory === 'dining' && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {diningHalls.map(hall => {
                const status = getDiningStatusInfo(hall, now);
                const pillVariant = status.status === 'available' ? 'free' :
                                  status.status === 'openingSoon' ? 'hold' : 'muted';

                return (
                  <div
                    key={hall.id}
                    className="ed-room-card"
                    onClick={() => onDiningSelect?.(hall)}
                  >
                    <div>
                      <h4 className="ed-serif" style={{ fontSize: 20, marginBottom: 8 }}>
                        {hall.name}
                      </h4>
                      {status.currentMeal && (
                        <p style={{ fontSize: 13, color: 'var(--ed-ink-2)', marginBottom: 8 }}>
                          Serving {status.currentMeal}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--ed-ink-3)' }}>
                        {status.hoursLabel}
                      </p>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <EditorialPill variant={pillVariant}>
                        {status.status === 'available' ? 'Open now' :
                         status.status === 'openingSoon' ? `Opens ${status.nextOpenLabel}` :
                         'Closed'}
                      </EditorialPill>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorialMain;
