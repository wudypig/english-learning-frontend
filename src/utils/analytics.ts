// Analytics utility functions for dashboard statistics

export interface DimensionScores {
    grammar: number;
    vocabulary: number;
    coherence: number;
    relevance: number;
    argumentation: number;
    mechanics: number;
}

export interface EssayMetadata {
    scores: DimensionScores;
    strengths: string[];
    weaknesses: string[];
    improvement_tips: string[];
}

export const parseEssayMetadata = (metadata?: string): EssayMetadata | null => {
    if (!metadata) return null;
    try {
        return JSON.parse(metadata) as EssayMetadata;
    } catch {
        return null;
    }
};

export interface TestRecord {
    id: string;
    type: 'essay' | 'reading';
    score: number;
    createdAt: string;
    content: string;
    questions?: string;
    answers?: string;
    feedback?: string;
    metadata?: string;
}

export interface DailyData {
    date: string;
    essayAvg: number | null;
    readingAvg: number | null;
    essayCount: number;
    readingCount: number;
}

/**
 * Calculate total number of tests completed
 */
export const calculateTotalTests = (history: TestRecord[]): number => {
    return history.length;
};

/**
 * Calculate average score for a specific test type or all tests
 * Reading scores are normalized to 0-10 scale
 */
export const calculateAverageScore = (
    history: TestRecord[],
    testType?: 'essay' | 'reading'
): number => {
    const filteredHistory = testType
        ? history.filter(record => record.type === testType)
        : history;

    if (filteredHistory.length === 0) return 0;

    const total = filteredHistory.reduce((sum, record) => {
        // Normalize reading scores from 0-100 to 0-10
        const normalizedScore = record.type === 'reading' ? record.score / 10 : record.score;
        return sum + normalizedScore;
    }, 0);

    return total / filteredHistory.length;
};

/**
 * Calculate current streak (consecutive days with at least one test)
 */
export const calculateStreak = (history: TestRecord[]): number => {
    if (history.length === 0) return 0;

    // Sort by date descending (most recent first)
    const sorted = [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get unique dates
    const uniqueDates = new Set(
        sorted.map(record => new Date(record.createdAt).toISOString().split('T')[0])
    );

    const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));

    // Check if most recent date is today or yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] !== today && dates[0] !== yesterday) {
        return 0; // Streak broken
    }

    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const previousDate = new Date(dates[i - 1]);
        const diffDays = Math.floor(
            (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Group tests by date and calculate daily averages
 * Returns array sorted by date (oldest to newest)
 */
export const groupByDate = (history: TestRecord[]): DailyData[] => {
    const grouped: Record<string, { essay: number[]; reading: number[] }> = {};

    // Group scores by date and type
    history.forEach(record => {
        const date = new Date(record.createdAt).toISOString().split('T')[0];

        if (!grouped[date]) {
            grouped[date] = { essay: [], reading: [] };
        }

        // Normalize reading scores from 0-100 to 0-10
        const normalizedScore = record.type === 'reading' ? record.score / 10 : record.score;

        if (record.type === 'essay') {
            grouped[date].essay.push(normalizedScore);
        } else {
            grouped[date].reading.push(normalizedScore);
        }
    });

    // Calculate averages and convert to array
    const dailyData: DailyData[] = Object.entries(grouped).map(([date, scores]) => {
        const essayAvg = scores.essay.length > 0
            ? scores.essay.reduce((a, b) => a + b, 0) / scores.essay.length
            : null;

        const readingAvg = scores.reading.length > 0
            ? scores.reading.reduce((a, b) => a + b, 0) / scores.reading.length
            : null;

        return {
            date,
            essayAvg,
            readingAvg,
            essayCount: scores.essay.length,
            readingCount: scores.reading.length,
        };
    });

    // Sort by date (oldest to newest)
    return dailyData.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Filter data by time period
 */
export const filterByTimePeriod = (
    data: DailyData[],
    period: '7d' | '14d' | '30d' | 'all'
): DailyData[] => {
    if (period === 'all') return data;

    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    return data.filter(item => item.date >= cutoffDateStr);
};

// --- Dimension analytics ---

export const DIMENSION_KEYS = [
    'grammar', 'vocabulary', 'coherence', 'relevance', 'argumentation', 'mechanics'
] as const;

export type DimensionKey = typeof DIMENSION_KEYS[number];

export interface DimensionAverages extends Record<DimensionKey, number> {
    sampleCount: number;
}

export interface DailyDimensionData extends Record<DimensionKey, number> {
    date: string;
}

const avgDimensions = (scores: DimensionScores[]): Record<DimensionKey, number> =>
    Object.fromEntries(
        DIMENSION_KEYS.map(k => [k, scores.reduce((s, sc) => s + sc[k], 0) / scores.length])
    ) as Record<DimensionKey, number>;

/**
 * Calculate average score per dimension across all essay records with metadata
 */
export const calculateDimensionAverages = (history: TestRecord[]): DimensionAverages | null => {
    const valid = history
        .filter((r): r is TestRecord & { metadata: string } => r.type === 'essay' && !!r.metadata)
        .map(r => parseEssayMetadata(r.metadata))
        .filter((m): m is EssayMetadata => m !== null);

    if (valid.length === 0) return null;

    return { ...avgDimensions(valid.map(m => m.scores)), sampleCount: valid.length };
};

/**
 * Return the dimension with the lowest average score
 */
export const getWeakestDimension = (avgs: DimensionAverages): DimensionKey =>
    DIMENSION_KEYS.reduce<DimensionKey>(
        (weakest, key) => avgs[key] < avgs[weakest] ? key : weakest,
        DIMENSION_KEYS[0]
    );

/**
 * Group dimension scores by date for trend charting (essay records with metadata only)
 */
export const groupDimensionsByDate = (history: TestRecord[]): DailyDimensionData[] => {
    const grouped: Record<string, DimensionScores[]> = {};

    history
        .filter((r): r is TestRecord & { metadata: string } => r.type === 'essay' && !!r.metadata)
        .forEach(r => {
            const meta = parseEssayMetadata(r.metadata);
            if (!meta) return;
            const date = new Date(r.createdAt).toISOString().split('T')[0];
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(meta.scores);
        });

    return Object.entries(grouped)
        .map(([date, scores]) => ({ date, ...avgDimensions(scores) }))
        .sort((a, b) => a.date.localeCompare(b.date));
};
