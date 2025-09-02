import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello({ name }: { name: string }) {
  return <h1>Hello {name}</h1>;
}

describe("Hello", () => {
  it("renders greeting", () => {
    render(<Hello name="Sabidatos" />);
    expect(screen.getByText("Hello Sabidatos")).toBeInTheDocument();
  });
});
