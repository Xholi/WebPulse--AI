import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface IndustryChartProps {
  data: Array<{ industry: string; count: number }>;
}

export default function IndustryChart({ data }: IndustryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.industry),
        datasets: [
          {
            data: data.map(d => d.count),
            backgroundColor: [
              "hsl(43, 96%, 56%)",
              "hsl(207, 90%, 54%)",
              "hsl(142, 76%, 36%)",
              "hsl(0, 84%, 60%)",
              "hsl(262, 83%, 58%)",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
