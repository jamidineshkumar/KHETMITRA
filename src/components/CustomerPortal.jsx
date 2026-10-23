import React from 'react';

// Full Modular Tabs for Customer / Farmer
import OverviewTab from './OverviewTab';
import LiveMonitoringTab from './LiveMonitoringTab';
import AlertsTab from './AlertsTab';
import DeviceSensorsTab from './DeviceSensorsTab';
import ControlsTab from './ControlsTab';
import HistoryReportsTab from './HistoryReportsTab';
import SettingsTab from './SettingsTab';

export default function CustomerPortal({
  activeNav,
  setActiveNav,
  operatingMode,
  setOperatingMode,
  isLiveHardware,
  espHeartbeatSeconds,
  sensors,
  events,
  buzzerOn,
  setBuzzerOn,
  buzzerIntensity,
  setBuzzerIntensity,
  lightOn,
  setLightOn,
  lightIntensity,
  setLightIntensity,
  autoProtection,
  setAutoProtection,
  autoDuration,
  setAutoDuration,
  selectedZone,
  setSelectedZone,
  farmProfile,
  onSaveFarmProfile,
  notificationSettings,
  onSaveNotificationSettings,
  onSimulateDetection,
  onTriggerAlarm,
  onSilenceAll,
  onReviewEvent,
  onReviewAll,
  onClearReviewed,
  onSelectAlert,
  onResetSimulatedData,
  userEmail,
}) {
  return (
    <div className="customer-full-portal">
      {activeNav === 'Overview' && (
        <OverviewTab
          operatingMode={operatingMode}
          setOperatingMode={setOperatingMode}
          isLiveHardware={isLiveHardware}
          espHeartbeatSeconds={espHeartbeatSeconds}
          sensors={sensors}
          events={events}
          buzzerOn={buzzerOn}
          setBuzzerOn={setBuzzerOn}
          buzzerIntensity={buzzerIntensity}
          lightOn={lightOn}
          setLightOn={setLightOn}
          lightIntensity={lightIntensity}
          autoProtection={autoProtection}
          setAutoProtection={setAutoProtection}
          onSimulateDetection={() => onSimulateDetection()}
          onTriggerAlarm={onTriggerAlarm}
          onSilenceAll={onSilenceAll}
          onReviewEvent={onReviewEvent}
          onNavigate={(nav) => setActiveNav(nav)}
          onSelectZone={(zone) => setSelectedZone(zone)}
        />
      )}

      {activeNav === 'Live Monitoring' && (
        <LiveMonitoringTab
          events={events}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          onSimulateDetection={(zone) => onSimulateDetection(zone)}
          onTriggerZoneTest={(zone, type) => {
            if (type === 'buzzer') {
              setBuzzerOn(true);
              setTimeout(() => setBuzzerOn(false), 2000);
            } else {
              setLightOn(true);
              setTimeout(() => setLightOn(false), 2000);
            }
          }}
          buzzerOn={buzzerOn}
          lightOn={lightOn}
        />
      )}

      {activeNav === 'Alerts' && (
        <AlertsTab
          events={events}
          onReviewEvent={onReviewEvent}
          onReviewAll={onReviewAll}
          onClearReviewed={onClearReviewed}
          onSimulateDetection={() => onSimulateDetection()}
          onSelectAlert={onSelectAlert}
        />
      )}

      {activeNav === 'Device & Sensors' && (
        <DeviceSensorsTab
          isLiveHardware={isLiveHardware}
          espHeartbeatSeconds={espHeartbeatSeconds}
          onPingController={() => {}}
        />
      )}

      {activeNav === 'Controls' && (
        <ControlsTab
          operatingMode={operatingMode}
          setOperatingMode={setOperatingMode}
          buzzerOn={buzzerOn}
          setBuzzerOn={setBuzzerOn}
          buzzerIntensity={buzzerIntensity}
          setBuzzerIntensity={setBuzzerIntensity}
          lightOn={lightOn}
          setLightOn={setLightOn}
          lightIntensity={lightIntensity}
          setLightIntensity={setLightIntensity}
          autoProtection={autoProtection}
          setAutoProtection={setAutoProtection}
          autoDuration={autoDuration}
          setAutoDuration={setAutoDuration}
          onTriggerAlarm={onTriggerAlarm}
          onSilenceAll={onSilenceAll}
          onTestPulse={(type) => {
            if (type === 'buzzer') {
              setBuzzerOn(true);
              setTimeout(() => setBuzzerOn(false), 2000);
            } else {
              setLightOn(true);
              setTimeout(() => setLightOn(false), 2000);
            }
          }}
          isLiveHardware={isLiveHardware}
        />
      )}

      {activeNav === 'History & Reports' && (
        <HistoryReportsTab events={events} />
      )}

      {activeNav === 'Settings' && (
        <SettingsTab
          farmProfile={farmProfile}
          onSaveFarmProfile={onSaveFarmProfile}
          notificationSettings={notificationSettings}
          onSaveNotificationSettings={onSaveNotificationSettings}
          onResetSimulatedData={onResetSimulatedData}
          isLiveHardware={isLiveHardware}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
