"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, clearTokens } from "../../utils/auth";
import { LineChart } from "@mui/x-charts/LineChart";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("light");
  const [timeFrame, setTimeFrame] = useState("3m");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch("/api/fetch_data", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else if (res.status === 401) {
          clearTokens();
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const filterDataByTimeFrame = (data) => {
    const now = new Date();
    let startDate;

    if (timeFrame === "3m") {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else if (timeFrame === "6m") {
      startDate = new Date(now.setMonth(now.getMonth() - 6));
    } else if (timeFrame === "1y") {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else {
      return data;
    }

    return data.filter((item) => new Date(item.timestamp) >= startDate);
  };

  const processData = (dataKey) => {
    if (!data || !data[dataKey]) return [];

    const df = data[dataKey].map((item) => ({
      timestamp: new Date(item.timestamp),
      weight: parseFloat(item.weight),
      reps: item.reps ? parseInt(item.reps) : 0,
    }));

    const grouped = df.reduce((acc, curr) => {
      const date = curr.timestamp.toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr);
      return acc;
    }, {});

    const processedData = Object.keys(grouped).map((date) => {
      const entries = grouped[date];
      const maxWeight = Math.max(...entries.map((e) => e.weight));
      const max1RM = Math.max(
        ...entries.map((e) => e.weight * (1 + e.reps / 30))
      );

      return {
        timestamp: new Date(date).getTime(),
        weight: maxWeight,
        "1RM": max1RM,
      };
    });

    return filterDataByTimeFrame(processedData);
  };

  const processWeeklyVolume = () => {
    if (!data || !data.weekly_volume) return [];

    const df = data.weekly_volume.map((item) => {
      const processedItem = { timestamp: new Date(item.timestamp).getTime() };
      for (const [key, value] of Object.entries(item)) {
        if (key !== "timestamp") {
          processedItem[key] =
            typeof value === "number" ? value : parseFloat(value) || 0;
        }
      }
      return processedItem;
    });

    const meltedData = df.flatMap((entry) => {
      return Object.keys(entry)
        .filter((key) => key !== "timestamp")
        .map((muscleGroup) => ({
          timestamp: entry.timestamp,
          muscleGroup,
          sets: entry[muscleGroup],
        }));
    });

    return filterDataByTimeFrame(meltedData);
  };

  const renderChart = (title, dataKey) => {
    const processedData = processData(dataKey);
    if (processedData.length === 0) return <p>No data available for {title}</p>;

    return (
      <div
        className={`mb-8 p-6 rounded-2xl shadow-2xl ${
          theme === "light" ? "bg-white" : "bg-gray-900"
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
        <LineChart
          xAxis={[
            {
              dataKey: "timestamp",
              valueFormatter: (value) =>
                new Date(value).toLocaleDateString("default", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
            },
          ]}
          series={[
            {
              dataKey: "weight",
              label: `${title} (Max Weight)`,
              color: "#FF6B6B",
            },
            {
              dataKey: "1RM",
              label: `${title} (1RM Projection)`,
              color: "#4ECDC4",
            },
          ]}
          dataset={processedData}
          height={300}
          sx={{
            backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
            color: theme === "light" ? "#000000" : "#ffffff",
          }}
        />
      </div>
    );
  };

  const renderWeeklyVolumeChart = () => {
    const volumeData = processWeeklyVolume();
    if (volumeData.length === 0) return <p>No weekly volume data available</p>;

    const series = Array.from(
      new Set(volumeData.map((d) => d.muscleGroup))
    ).map((muscle) => ({
      dataKey: muscle,
      label: muscle,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }));

    const transformedData = volumeData.reduce((acc, curr) => {
      const date = curr.timestamp;
      if (!acc[date]) acc[date] = { timestamp: date };
      acc[date][curr.muscleGroup] = curr.sets;
      return acc;
    }, {});

    const dataset = Object.values(transformedData);

    return (
      <div
        className={`mb-8 p-6 rounded-2xl shadow-2xl ${
          theme === "light" ? "bg-white" : "bg-gray-900"
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Weekly Volume by Muscle Group
        </h2>
        <LineChart
          xAxis={[
            {
              dataKey: "timestamp",
              valueFormatter: (value) =>
                new Date(value).toLocaleDateString("default", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
            },
          ]}
          series={series}
          dataset={dataset}
          height={300}
          sx={{
            backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
            color: theme === "light" ? "#000000" : "#ffffff",
          }}
        />
      </div>
    );
  };

  const materialTheme = createTheme({
    palette: {
      mode: theme,
      primary: { main: "#FF6B6B" },
      secondary: { main: "#4ECDC4" },
      background: {
        default: theme === "light" ? "#f8f9fa" : "#0a0a0a",
        paper: theme === "light" ? "#ffffff" : "#121212",
      },
      text: {
        primary: theme === "light" ? "#212529" : "#ffffff",
      },
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
  });

  return (
    <ThemeProvider theme={materialTheme}>
      <div
        className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
          theme === "light"
            ? "bg-gray-100 text-black"
            : "bg-gray-900 text-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-center mb-4 sm:mb-0">
            🏋🏼‍♂️ Strong PR Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className={`p-2 rounded-lg border w-full sm:w-auto ${
                theme === "light"
                  ? "bg-white text-black border-gray-300"
                  : "bg-gray-800 text-white border-gray-600"
              }`}
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={toggleTheme}
              className="w-full sm:w-auto bg-indigo-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-600 transition"
            >
              Toggle Theme
            </button>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {renderChart("Bench Press Progression", "bench_press")}
          {renderChart("Deadlift Progression", "deadlift")}
          {renderChart("Squat Progression", "squat")}
          {renderChart("Overhead Press Progression", "overhead_press")}
          {renderChart("Bodyweight Progression", "bodyweight")}
          {renderWeeklyVolumeChart()}
        </div>
      </div>
    </ThemeProvider>
  );
}
