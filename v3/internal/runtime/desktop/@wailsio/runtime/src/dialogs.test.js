import { afterEach, describe, expect, it, vi } from "vitest";
import { TextInput } from "./dialogs.js";
import { objectNames, setTransport } from "./runtime.js";

afterEach(() => setTransport(null));

describe("native text input dialogs", () => {
    it("sends text and password options using the text input method", async () => {
        const call = vi.fn().mockResolvedValue("entered value");
        setTransport({ call });
        const options = { Title: "Unlock", Password: true, DefaultText: "", Detached: true };
        expect(await TextInput(options)).toBe("entered value");
        expect(call).toHaveBeenCalledWith(objectNames.Dialog, 6, expect.any(String), options);
    });

    it("preserves cancellation and accepts omitted options", async () => {
        const call = vi.fn().mockResolvedValue("");
        setTransport({ call });
        expect(await TextInput()).toBe("");
        expect(call).toHaveBeenCalledWith(objectNames.Dialog, 6, expect.any(String), {});
    });

    it("propagates native dialog errors", async () => {
        const failure = new Error("dialog unavailable");
        setTransport({ call: vi.fn().mockRejectedValue(failure) });
        await expect(TextInput()).rejects.toBe(failure);
    });
});
