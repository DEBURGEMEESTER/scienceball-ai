export interface Player {
    id: string;
    name: string;
    club: string;
    league: string;
    position: string;
    age: number;
    nationality: string;
    image: string;
    market_value: string;
    predicted_growth: number;
    tactical_role: string;

    // Detailed Stats
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;

    // Scientific Metrics
    xg_per_90: number;
    xa_per_90: number;
    ppda: number;

    // Complex Data
    metrics: { label: string; value: number }[];
    attributes: {
        technical: { name: string; value: number }[];
        mental: { name: string; value: number }[];
        physical: { name: string; value: number }[];
    } | any; // Allow fallback for now

    medical_dna?: any;
    biometric_profile?: any;
    physical_metrics?: any;
    cognitive_profile?: any;
    scientific_dossier?: string;
    scout_notes?: { scout: string; date: string; note: string }[];
    value_history?: { date: string; value: number }[];
    agent_info?: {
        name: string;
        agency: string;
        tier: string;
        history: string[];
    };

    // Frontend specific
    trajectory?: { year: number; value: number; label: string }[];
}

export interface Shortlist {
    id?: number;
    name: string;
    players: Player[];
}

export interface Channel {
    id: number;
    name: string;
    type: "INTERNAL" | "DIRECTOR_NETWORK";
}

export interface Message {
    id: number;
    channel_id: number;
    sender: string;
    content: string;
    player_id?: string;
    timestamp: string;
}
