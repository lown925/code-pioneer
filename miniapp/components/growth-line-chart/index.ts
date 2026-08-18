import { getThemeChartPalette } from "../../utils/theme";
import type { GrowthTrendPoint } from "../../types/growth";

declare function Component(options: any): void;

type GrowthCanvasContext = {
  clearRect(x: number, y: number, width: number, height: number): void;
  setFillStyle(color: string): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  setFontSize(size: number): void;
  fillText(text: string, x: number, y: number): void;
  setStrokeStyle(color: string): void;
  setLineWidth(width: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  arc(x: number, y: number, radius: number, start: number, end: number): void;
  fill(): void;
  draw(): void;
};

type GrowthCanvasApi = {
  getSystemInfoSync(): { windowWidth: number };
  createCanvasContext(id: string, component?: unknown): GrowthCanvasContext;
};

const canvasWx = wx as unknown as GrowthCanvasApi;

type GrowthLineChartData = {
  canvasWidth: number;
  canvasHeight: number;
};

type GrowthLineChartProperties = {
  points: GrowthTrendPoint[];
  resolvedTheme: "light" | "dark";
};

type GrowthLineChartInstance = {
  data: GrowthLineChartData & GrowthLineChartProperties;
  setData(data: Partial<GrowthLineChartData>, callback?: () => void): void;
  drawChart(): void;
};

Component({
  properties: {
    points: {
      type: Array,
      value: [],
      observer(this: GrowthLineChartInstance) {
        this.drawChart();
      },
    },
    resolvedTheme: {
      type: String,
      value: "light",
      observer(this: GrowthLineChartInstance) {
        this.drawChart();
      },
    },
  },

  data: {
    canvasWidth: 320,
    canvasHeight: 150,
  },

  lifetimes: {
    ready(this: GrowthLineChartInstance) {
      const systemInfo = canvasWx.getSystemInfoSync();
      const width = Math.max(260, systemInfo.windowWidth - 48);
      const height = Math.max(
        140,
        Math.round((260 / 750) * systemInfo.windowWidth),
      );

      this.setData(
        {
          canvasWidth: width,
          canvasHeight: height,
        },
        () => this.drawChart(),
      );
    },
  },

  methods: {
    drawChart(this: GrowthLineChartInstance) {
      if (!this.data.canvasWidth || !this.data.canvasHeight) {
        return;
      }

      const context = canvasWx.createCanvasContext("growth-line-chart", this);
      const palette = getThemeChartPalette(this.data.resolvedTheme);
      const width = this.data.canvasWidth;
      const height = this.data.canvasHeight;
      const left = 34;
      const right = 16;
      const top = 18;
      const bottom = 28;
      const plotWidth = Math.max(1, width - left - right);
      const plotHeight = Math.max(1, height - top - bottom);
      const points = this.data.points ?? [];

      context.clearRect(0, 0, width, height);
      context.setFillStyle(palette.background);
      context.fillRect(0, 0, width, height);
      context.setFontSize(10);
      context.setFillStyle(palette.label);

      for (const level of [0, 50, 100]) {
        const y = top + ((100 - level) / 100) * plotHeight;
        context.setStrokeStyle(palette.grid);
        context.setLineWidth(1);
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(width - right, y);
        context.stroke();
        context.fillText(`${level}`, 6, y + 3);
      }

      const drawSeries = (
        key: "quizAccuracy" | "practiceAccuracy",
        color: string,
      ) => {
        let previous: { x: number; y: number } | null = null;
        context.setStrokeStyle(color);
        context.setFillStyle(color);
        context.setLineWidth(2);

        points.forEach((point: GrowthTrendPoint, index: number) => {
          const value = point[key];
          if (value === null) {
            previous = null;
            return;
          }

          const x =
            points.length <= 1
              ? left + plotWidth / 2
              : left + (index / (points.length - 1)) * plotWidth;
          const y =
            top +
            ((100 - Math.max(0, Math.min(100, value))) / 100) * plotHeight;

          if (previous) {
            context.beginPath();
            context.moveTo(previous.x, previous.y);
            context.lineTo(x, y);
            context.stroke();
          }

          context.beginPath();
          context.arc(x, y, 3, 0, Math.PI * 2);
          context.fill();
          previous = { x, y };
        });
      };

      drawSeries("quizAccuracy", palette.quiz);
      drawSeries("practiceAccuracy", palette.practice);

      if (points.length > 0) {
        context.setFillStyle(palette.label);
        context.fillText(points[0]?.date.slice(5) ?? "", left, height - 8);
        context.fillText(
          points[points.length - 1]?.date.slice(5) ?? "",
          Math.max(left, width - right - 34),
          height - 8,
        );
      }

      context.draw();
    },
  },
});
