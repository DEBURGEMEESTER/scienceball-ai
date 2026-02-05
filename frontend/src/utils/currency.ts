export const formatCurrency = (value: string | number): string => {
    let numVal: number;

    if (typeof value === 'string') {
        const clean = value.replace(/[^0-9.\-MKmk]/g, ""); // Keep M/K
        if (clean.toUpperCase().includes('M')) {
            numVal = parseFloat(clean) * 1000000;
        } else if (clean.toUpperCase().includes('K')) {
            numVal = parseFloat(clean) * 1000;
        } else {
            numVal = parseFloat(clean);
        }
    } else {
        numVal = value;
    }

    if (isNaN(numVal)) return "€0";

    // Logic: >= 1 Million use Compact "€13,4M"
    if (numVal >= 1000000) {
        const inMillions = numVal / 1000000;
        // Dutch format use comma for decimals
        return `€${inMillions.toFixed(1).replace('.', ',')}M`;
    }

    // Logic: < 1 Million use Full "€850.000"
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numVal);
};
