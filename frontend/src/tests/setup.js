import { server } from "@/mocks/server";
import { resetLoginAttempts } from "@/mocks/handlers";
import { beforeAll, afterAll, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
})

afterEach(() => {
    server.resetHandlers();
    resetLoginAttempts();
    vi.clearAllMocks();
    localStorage.clear();
    cleanup();
});

afterAll(() => {
    server.close();
})

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    })),
});
