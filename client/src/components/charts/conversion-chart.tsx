import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface ConversionChartProps {
  data: Array<{ month: string; leads: number; sites: number; revenue: number }>;
}

export default function ConversionChart({ data }: ConversionChartProps) {
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
      type: "line",
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: "Leads Generated",
            data: data.map(d => d.leads),
            borderColor: "hsl(207, 90%, 54%)",
            backgroundColor: "hsla(207, 90%, 54%, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Sites Created",
            data: data.map(d => d.sites),
            borderColor: "hsl(142, 76%, 36%)",
            backgroundColor: "hsla(142, 76%, 36%, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
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
