import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import playbackService, { parseSafeDate } from '../../services/playbackService';
import PlaybackMap from './PlaybackMap';
import PlaybackControls from './PlaybackControls';
import TimelineScrubber from './TimelineScrubber';
import Icon from '../ui/Icon';

const PlaybackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(null); // { minTime: Date, maxTime: Date }
  const [timelineData, setTimelineData] = useState([]); // Raw DTO list
  const [currentTime, setCurrentTime] = useState(null); // Date
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [showTrails, setShowTrails] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const wasPlayingBeforeScrub = useRef(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Compute recommended downsampling interval based on duration
  const computeInterval = (durationHours) => {
    if (durationHours <= 2) return 30;
    if (durationHours <= 6) return 60;
    if (durationHours <= 24) return 120;
    return 300;
  };

  // Fetch time range and timeline data on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const range = await playbackService.getTimeRange();
        if (!range || !range.minTime || !range.maxTime) {
          if (isMounted) {
            setTimeRange(null);
            setLoading(false);
          }
          return;
        }

        const min = parseSafeDate(range.minTime);
        const max = parseSafeDate(range.maxTime);

        if (!min || !max || isNaN(min.getTime()) || isNaN(max.getTime())) {
          if (isMounted) {
            setTimeRange(null);
            setLoading(false);
          }
          return;
        }

        const durationHours = (max.getTime() - min.getTime()) / (1000 * 3600);
        const interval = computeInterval(durationHours);

        const timeline = await playbackService.getTimeline(
          range.minTime,
          range.maxTime,
          interval
        );

        if (isMounted) {
          setTimeRange({ minTime: min, maxTime: max });
          setCurrentTime(min);
          setTimelineData(timeline || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load playback data:', err);
        if (isMounted) {
          setError(err.response?.data?.error || err.message || 'Failed to load historical playback');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Group timeline points by vehicle and sort chronologically
  const vehicleTimelineMap = useMemo(() => {
    const map = new Map();
    timelineData.forEach((item) => {
      if (!item.vehicleId) return;
      const point = {
        ...item,
        date: parseSafeDate(item.recordedAt),
      };
      if (!map.has(item.vehicleId)) {
        map.set(item.vehicleId, []);
      }
      map.get(item.vehicleId).push(point);
    });

    // Ensure sorted
    map.forEach((points) => {
      points.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    return map;
  }, [timelineData]);

  // Extract unique vehicles for filter chips
  const vehicleList = useMemo(() => {
    const unique = new Map();
    timelineData.forEach((item) => {
      if (item.vehicleId && !unique.has(item.vehicleId)) {
        unique.set(item.vehicleId, {
          id: item.vehicleId,
          vehicleId: item.vehicleId,
          licensePlate: item.licensePlate || `Vehicle #${item.vehicleId}`,
          model: item.model || '',
        });
      }
    });
    return Array.from(unique.values());
  }, [timelineData]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying || !timeRange || !currentTime) return;

    const tickMs = 100;
    const intervalId = setInterval(() => {
      setCurrentTime((prev) => {
        if (!prev) return prev;
        const advanceMs = tickMs * speed;
        const nextMs = prev.getTime() + advanceMs;

        if (nextMs >= timeRange.maxTime.getTime()) {
          setIsPlaying(false);
          return timeRange.maxTime;
        }
        return new Date(nextMs);
      });
    }, tickMs);

    return () => clearInterval(intervalId);
  }, [isPlaying, speed, timeRange, currentTime]);

  // Binary search to find latest point <= targetTime
  const findLatestPoint = useCallback((points, targetTime) => {
    if (!points || points.length === 0) return null;
    const targetMs = targetTime.getTime();
    let low = 0;
    let high = points.length - 1;
    let bestIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (points[mid].date.getTime() <= targetMs) {
        bestIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (bestIndex === -1) return null;
    return {
      point: points[bestIndex],
      index: bestIndex,
    };
  }, []);

  // Compute active vehicles and trails for the currentTime
  const { currentVehicles, currentTrails } = useMemo(() => {
    if (!currentTime) return { currentVehicles: [], currentTrails: {} };

    const activeList = [];
    const trailsMap = {};

    vehicleTimelineMap.forEach((points, vehicleId) => {
      if (selectedVehicleId !== null && selectedVehicleId !== vehicleId) {
        return;
      }

      const result = findLatestPoint(points, currentTime);
      if (result) {
        activeList.push(result.point);

        // Collect trail: up to last 20 points
        if (showTrails) {
          const startIndex = Math.max(0, result.index - 19);
          trailsMap[vehicleId] = points.slice(startIndex, result.index + 1);
        }
      }
    });

    return { currentVehicles: activeList, currentTrails: trailsMap };
  }, [currentTime, vehicleTimelineMap, selectedVehicleId, showTrails, findLatestPoint]);

  // Handlers
  const handleTogglePlay = () => {
    if (!timeRange) return;
    if (currentTime && currentTime.getTime() >= timeRange.maxTime.getTime()) {
      setCurrentTime(timeRange.minTime);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleReset = () => {
    if (timeRange) {
      setCurrentTime(timeRange.minTime);
      setIsPlaying(false);
    }
  };

  const handleScrubStart = () => {
    wasPlayingBeforeScrub.current = isPlaying;
    setIsPlaying(false);
  };

  const handleScrub = (newDate) => {
    setCurrentTime(newDate);
  };

  const handleScrubEnd = () => {
    if (wasPlayingBeforeScrub.current) {
      setIsPlaying(true);
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading historical telemetry playback...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-6 text-rose-700 dark:text-rose-300">
          <h3 className="font-bold text-lg mb-2">Error Loading Playback</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!timeRange) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Icon name="History" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Historical Telemetry Data</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There is currently no recorded telemetry data in the system to play back. As vehicles report their positions, playback history will automatically become available here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
              <Icon name="History" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Historical Playback
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Replay and analyze fleet movements, telemetry metrics, and vehicle routes in fast-forward.
              </p>
            </div>
          </div>
        </div>

        {/* Time range badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
          <Icon name="Clock" size={15} className="text-blue-500" />
          <span>Range:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {formatDateDisplay(timeRange.minTime)} → {formatDateDisplay(timeRange.maxTime)}
          </span>
        </div>
      </div>

      {/* Main Map Container with overlay controls */}
      <div className="relative w-full h-[calc(100vh-250px)] min-h-[550px] rounded-xl overflow-hidden shadow-sm">
        {/* Interactive Map */}
        <PlaybackMap
          vehicles={currentVehicles}
          trails={currentTrails}
          showTrails={showTrails}
          isDark={isDark}
        />

        {/* Floating Playback Controls (top-right overlay on desktop, stacked on mobile) */}
        <div className="absolute top-4 right-4 z-[1000] max-w-sm sm:max-w-md w-full pointer-events-auto">
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            speed={speed}
            onChangeSpeed={setSpeed}
            currentTime={currentTime}
            onReset={handleReset}
            vehicles={vehicleList}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            showTrails={showTrails}
            onToggleTrails={setShowTrails}
          />
        </div>

        {/* Bottom Docked Scrubber */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-auto">
          <TimelineScrubber
            minTime={timeRange.minTime}
            maxTime={timeRange.maxTime}
            currentTime={currentTime}
            onScrub={handleScrub}
            onScrubStart={handleScrubStart}
            onScrubEnd={handleScrubEnd}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaybackPage;
