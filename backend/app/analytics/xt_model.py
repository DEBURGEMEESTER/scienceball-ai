import numpy as np

# Define a 12x8 grid representing the pitch (Standard analytics grid)
# Values represent the probability of a goal occurring within the next N actions from that zone.
# These are heuristic baseline values for our prototype.
XT_GRID = np.array([
    [0.001, 0.001, 0.002, 0.003, 0.003, 0.002, 0.001, 0.001],
    [0.001, 0.002, 0.003, 0.004, 0.004, 0.003, 0.002, 0.001],
    [0.002, 0.003, 0.005, 0.006, 0.006, 0.005, 0.003, 0.002],
    [0.003, 0.005, 0.008, 0.010, 0.010, 0.008, 0.005, 0.003],
    [0.005, 0.008, 0.012, 0.015, 0.015, 0.012, 0.008, 0.005],
    [0.008, 0.012, 0.018, 0.022, 0.022, 0.018, 0.012, 0.008],
    [0.012, 0.018, 0.028, 0.035, 0.035, 0.028, 0.018, 0.012],
    [0.018, 0.028, 0.045, 0.060, 0.060, 0.045, 0.028, 0.018],
    [0.025, 0.040, 0.070, 0.095, 0.095, 0.070, 0.040, 0.025],
    [0.035, 0.060, 0.110, 0.160, 0.160, 0.110, 0.060, 0.035],
    [0.045, 0.080, 0.150, 0.250, 0.250, 0.150, 0.080, 0.045],
    [0.055, 0.100, 0.200, 0.400, 0.400, 0.200, 0.100, 0.055],
])

def get_zone_value(x_pct: float, y_pct: float) -> float:
    """Gets the xT value for a normalized coordinate (0-100)."""
    grid_x = min(int(x_pct / (100 / 12)), 11)
    grid_y = min(int(y_pct / (100 / 8)), 7)
    return XT_GRID[grid_x, grid_y]
