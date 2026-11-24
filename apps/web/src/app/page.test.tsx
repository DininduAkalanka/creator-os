import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BRAND } from "../config/brand";
import Home from "./page";

describe("the app's start page", () => {
  it("renders the brand as its heading and says honestly that the app is not open yet", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain(`<h1>${BRAND.name}</h1>`);
    expect(html).toContain("in development");
  });
});
