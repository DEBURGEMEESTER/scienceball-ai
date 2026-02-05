import React from 'react';
import styles from './RadarChart.module.css';

interface RadarData {
    label: string;
    value: number; // 0-100 (percentile)
}

interface RadarChartProps {
    data: RadarData[];
    size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
    if (!data || data.length === 0) {
        return (
            <div className={styles.container} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className={styles.noDataText}>METRICS DATA PENDING</span>
            </div>
        );
    }

    const padding = 40;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - padding;
    const angleStep = (Math.PI * 2) / (data.length || 1);

    // Calculate coordinates for a specific value and angle
    const getCoordinates = (value: number, angle: number, r: number) => {
        const val = isNaN(value) ? 0 : value;
        const x = centerX + r * (val / 100) * Math.cos(angle - Math.PI / 2);
        const y = centerY + r * (val / 100) * Math.sin(angle - Math.PI / 2);

        // Final safety check to prevent NaN in SVG attributes
        return {
            x: isNaN(x) ? centerX : x,
            y: isNaN(y) ? centerY : y
        };
    };

    // Generate background polygons (grids)
    const gridLevels = [25, 50, 75, 100];
    const gridPaths = gridLevels.map(level => {
        const points = data.map((_, i) => {
            const { x, y } = getCoordinates(level, i * angleStep, radius);
            return `${x},${y}`;
        }).join(' ');
        return points;
    });

    // Generate data polygon
    const dataPoints = data.map((d, i) => {
        const { x, y } = getCoordinates(d.value, i * angleStep, radius);
        return `${x},${y}`;
    }).join(' ');

    // Labels
    const labels = data.map((d, i) => {
        const { x, y } = getCoordinates(115, i * angleStep, radius); // Slightly outside the radius
        return { text: d.label || '?', x, y };
    });

    return (
        <div className={styles.container} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Grids */}
                {gridPaths.map((path, i) => (
                    <polygon key={i} points={path} className={styles.gridLine} />
                ))}

                {/* Axis Lines */}
                {data.map((_, i) => {
                    const { x, y } = getCoordinates(100, i * angleStep, radius);
                    return (
                        <line key={i} x1={centerX} y1={centerY} x2={x} y2={y} className={styles.axisLine} />
                    );
                })}

                {/* Data Area */}
                <polygon points={dataPoints} className={styles.dataArea} />

                {/* Data Points (Dots) */}
                {data.map((d, i) => {
                    const { x, y } = getCoordinates(d.value, i * angleStep, radius);
                    return (
                        <circle key={i} cx={x} cy={y} r="3" className={styles.dataPoint} />
                    );
                })}

                {/* Labels */}
                {labels.map((l, i) => (
                    <text
                        key={i}
                        x={l.x}
                        y={l.y}
                        textAnchor="middle"
                        className={styles.label}
                    >
                        {l.text}
                    </text>
                ))}
            </svg>
        </div>
    );
};

export default RadarChart;
