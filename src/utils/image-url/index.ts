const publicUrl = import.meta.env.VITE_PUBLIC_URL ?? "";

export const getImageUrl = (image?: string): string => {
    const defaultImage = "https://imgs.search.brave.com/kkLO9GerXj9XfoUWeX5bKPjdeLdnQpzFoh-TOFjz1rA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzYv/MDQ5LzExNC9zbWFs/bC9haS1nZW5lcmF0/ZWQtaXNvbGF0ZWQt/Y2hhcmdlci1jdXRv/dXQtb2JqZWN0LW9u/LXRyYW5zcGFyZW50/LWJhY2tncm91bmQt/ZmlsZS1wbmcucG5n"
    return defaultImage;

    if (!image) return "";

    if (image!.startsWith("http://")) {
        return image!;
    }
    if (image!.startsWith("https://")) {
        return image!;
    }

    const base = publicUrl.trim();

    if (!base) {
        console.warn("Public R2 URL is not defined");
        return image!;
    }

    const baseNormalized = base.replace(/\/+$/, "");
    const imageNormalized = image!.replace(/^\/+/, "");
    return `${baseNormalized}/${imageNormalized}`;
};