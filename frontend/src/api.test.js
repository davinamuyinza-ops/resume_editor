import { beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(status, body = {}) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

// api.js keeps the token in module state, so each test gets a fresh copy.
async function loadApi() {
    vi.resetModules();
    return import("./api.js");
}

function lastAuthHeader(fetchMock, callIndex = fetchMock.mock.calls.length - 1) {
    return fetchMock.mock.calls[callIndex][1].headers.Authorization;
}

describe("api auth handling", () => {
    let fetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    it("sends the login token as a Bearer header once it has one", async () => {
        const api = await loadApi();
        fetchMock.mockResolvedValue(jsonResponse(200, { findings: [] }));

        api.setAuthToken("abc123");
        await api.checkAts({}, null);

        expect(lastAuthHeader(fetchMock)).toBe("Bearer abc123");
    });

    it("sends no Authorization header when standalone (no token, no host app)", async () => {
        const api = await loadApi();
        fetchMock.mockResolvedValue(jsonResponse(200, { findings: [] }));

        await api.checkAts({}, null);

        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it("on a 401 asks the host for a fresh token and retries once with it", async () => {
        const api = await loadApi();
        api.setAuthToken("stale");
        api.setTokenRequester(() => setTimeout(() => api.setAuthToken("fresh"), 0));
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { detail: "expired" }))
            .mockResolvedValueOnce(jsonResponse(200, { findings: ["ok"] }));

        const result = await api.checkAts({}, null);

        expect(result).toEqual({ findings: ["ok"] });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(lastAuthHeader(fetchMock, 0)).toBe("Bearer stale");
        expect(lastAuthHeader(fetchMock, 1)).toBe("Bearer fresh");
    });

    it("throws AuthError (no endless retry) if the retry is rejected too", async () => {
        const api = await loadApi();
        api.setAuthToken("stale");
        api.setTokenRequester(() => setTimeout(() => api.setAuthToken("also-bad"), 0));
        fetchMock.mockResolvedValue(jsonResponse(401, { detail: "nope" }));

        await expect(api.checkAts({}, null)).rejects.toBeInstanceOf(api.AuthError);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("throws AuthError straight away on a 401 when there is no host to ask", async () => {
        const api = await loadApi();
        fetchMock.mockResolvedValue(jsonResponse(401, { detail: "nope" }));

        await expect(api.renderPreview({})).rejects.toBeInstanceOf(api.AuthError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("waits for the first token from the host before the first call", async () => {
        const api = await loadApi();
        api.setTokenRequester(() => setTimeout(() => api.setAuthToken("first"), 10));
        fetchMock.mockResolvedValue(jsonResponse(200, { findings: [] }));

        await api.checkAts({}, null);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(lastAuthHeader(fetchMock)).toBe("Bearer first");
    });

    it("keeps real server errors distinct from auth errors", async () => {
        const api = await loadApi();
        api.setAuthToken("ok");
        fetchMock.mockResolvedValue(jsonResponse(500, { detail: "boom" }));

        const error = await api.checkAts({}, null).catch((e) => e);

        expect(error).not.toBeInstanceOf(api.AuthError);
        expect(error.message).toBe("boom");
    });

    it("sends the finding details to /suggest-fix", async () => {
        const api = await loadApi();
        api.setAuthToken("ok");
        fetchMock.mockResolvedValue(jsonResponse(200, { can_fix: false, explanation: "x" }));

        await api.suggestFix({ basics: {} }, { id: "missing_phone", message: "m", fix: "f" }, "JD");

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toMatch(/\/suggest-fix$/);
        expect(JSON.parse(options.body)).toMatchObject({
            finding_id: "missing_phone",
            finding_message: "m",
            finding_fix: "f",
            job_description: "JD",
        });
    });
});
