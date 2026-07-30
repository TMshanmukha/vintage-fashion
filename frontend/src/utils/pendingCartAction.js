const KEY = "pendingCartAction";

export function setPendingAction(action) {
    localStorage.setItem(KEY, JSON.stringify(action));
}

export function getPendingAction() {
    const raw = localStorage.getItem(KEY);

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearPendingAction() {
    localStorage.removeItem(KEY);
}