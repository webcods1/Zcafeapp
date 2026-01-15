export const BRANCH_SCOPE = {
    'Vatakara': ['Vatakara', 'Calicut', 'Wayanad', 'Kasaragod', 'Kannur'],
    'Trivandrum': ['Trivandrum', 'Kollam'],
    'Eranamkulam': ['Eranamkulam', 'Kochi', 'Aluva', 'Idukki'],
    'Thrissur': ['Thrissur', 'Palakkad', 'Malappuram'],
    'Pattikkad': ['Pattikkad', 'Perinthalmanna']
};

export const getBranchForLocation = (location) => {
    if (!location) return null;

    // Normalize input
    const normalizedLoc = location.trim().toLowerCase();

    for (const [branch, locations] of Object.entries(BRANCH_SCOPE)) {
        if (locations.some(loc => loc.toLowerCase() === normalizedLoc)) {
            return branch;
        }
    }

    // Fallback: If the location itself IS a branch name (e.g., user put 'Trivandrum' which is both)
    if (BRANCH_SCOPE[location]) return location;

    // Fuzzy Search / Partial Match safety (optional, but good for "Calicut City")
    for (const [branch, locations] of Object.entries(BRANCH_SCOPE)) {
        if (locations.some(loc => normalizedLoc.includes(loc.toLowerCase()))) {
            return branch;
        }
    }

    return null;
};
