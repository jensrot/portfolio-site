import React from "react";

export type DescriptionPart = string | { text: string; url: string };

/**
 * @description Renders a description with internal links in json format.
 * @param {DescriptionPart[]} description - The description parts to render.
 * @returns {(React.ReactNode | string)[]} - The rendered description parts.
 */
export const renderDescriptionWithInternalLinks = (description: DescriptionPart[]): (React.ReactNode | string)[] => {
    return description.map((part, i) =>
        typeof part === "string"
            ? part
            : React.createElement("a", { key: i, href: part.url, target: "_blank", rel: "noopener noreferrer" }, part.text)
    );
}
