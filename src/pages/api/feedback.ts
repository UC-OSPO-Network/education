import type { APIRoute } from "astro";

export const prerender = false;

const OWNER = "UC-OSPO-Network";
const REPO = "education";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;
const ipRequestMap = new Map<string, number[]>();

export const POST: APIRoute = async ({ request }) => {
    try {

        const clientIp =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("cf-connecting-ip") ||
            "unknown";

        const now = Date.now();
        const timestamps = ipRequestMap.get(clientIp) || [];

        const recentRequests = timestamps.filter(
            (time) => now - time < RATE_LIMIT_WINDOW_MS
        );

        if (recentRequests.length >= MAX_REQUESTS) {
            return new Response(
                JSON.stringify({
                    error: "Too many feedback submissions. Please try again later."
                }),
                { status: 429 }
            );
        }

        recentRequests.push(now);
        ipRequestMap.set(clientIp, recentRequests);


        const { lessonName, feedbackType, description } = await request.json();

        if (!lessonName || !feedbackType || !description) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400 }
            );
        }

        const allowedTypes = ["bug", "suggestion", "content-quality"];
        if (!allowedTypes.includes(feedbackType)) {
            return new Response(
                JSON.stringify({ error: "Invalid feedback type" }),
                { status: 400 }
            );
        }

        if (description.trim().length < 10) {
            return new Response(
                JSON.stringify({
                    error: "Description must be at least 10 characters long."
                }),
                { status: 400 }
            );
        }


        const title = `[Lesson Feedback] ${lessonName} – ${feedbackType}`;
        const body = `
### Lesson
${lessonName}

### Feedback Type
${feedbackType}

### Description
${description}

---
Submitted via lesson feedback form.
`;


        const response = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    body,
                    labels: ["lesson-feedback", feedbackType]
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return new Response(
                JSON.stringify({ error: error.message || "GitHub API error" }),
                { status: response.status }
            );
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 201
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: "Server error" }),
            { status: 500 }
        );
    }
};
