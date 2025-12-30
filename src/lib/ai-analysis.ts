import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
});

export interface PhotoAnalysis {
    stats: {
        formal: number;
        spicy: number;
        cool: number;
        trustworthy: number;
        mysterious: number;
    };
    insights: string[];
}

export async function analyzeGeneratedPhoto(
    imageUrl: string,
    styleCategory: string,
    styleName: string,
    realismLevel: string
): Promise<PhotoAnalysis> {
    try {
        const prompt = `You are an expert photo analyst. Analyze this generated profile photo and provide:

        1. Stats (rate 0-100 for each):
        - formal: How formal/professional the image appears
        - spicy: How attractive/alluring the image is
        - cool: How trendy/stylish the image appears
        - trustworthy: How trustworthy the person appears
        - mysterious: How mysterious/enigmatic the person appears

        2. Insights (3-4 brief observations - each observation should be a single sentence):
        - Comment on how the ${styleName} style enhances the photo
        - Comment on suitability for ${styleCategory} profiles
        - Any other notable observations

        Context:
        - Style: ${styleName}
        - Category: ${styleCategory}
        - Realism Level: ${realismLevel}

        Respond ONLY with a valid JSON object in this exact format:
        {
        "stats": {
            "formal": <number>,
            "spicy": <number>,
            "cool": <number>,
            "trustworthy": <number>,
            "mysterious": <number>
        },
        "insights": ["<insight 1>", "<insight 2>", "<insight 3>"]
        }`;

        const stream = await openrouter.chat.send({
            model: "google/gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            imageUrl: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ],
            responseFormat: { type: "json_object" },
            stream: true,
            streamOptions: {
                includeUsage: true
            }
        });

        let response = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                response += content;
            }

            // Usage information comes in the final chunk
            if (chunk.usage) {
                console.log("AI Analysis tokens:", chunk.usage.totalTokens);
            }
        }

        // Parse and validate the response
        const analysis = JSON.parse(response) as PhotoAnalysis;

        // Validate stats are within range
        const validatedStats = {
            formal: Math.min(100, Math.max(0, analysis.stats.formal)),
            spicy: Math.min(100, Math.max(0, analysis.stats.spicy)),
            cool: Math.min(100, Math.max(0, analysis.stats.cool)),
            trustworthy: Math.min(100, Math.max(0, analysis.stats.trustworthy)),
            mysterious: Math.min(100, Math.max(0, analysis.stats.mysterious)),
        };

        return {
            stats: validatedStats,
            insights: analysis.insights || []
        };

    } catch (error) {
        console.error('AI analysis error:', error);

        // Fallback to basic analysis based on parameters
        return {
            stats: {
                formal: styleCategory === 'work' ? 75 : 40,
                spicy: styleCategory === 'dating' ? 70 : 35,
                cool: 65,
                trustworthy: 60,
                mysterious: styleCategory === 'anonymous' ? 75 : 30,
            },
            insights: [
                'feels approachable',
                `${styleName} style enhances your look`,
                `Great for ${styleCategory} profiles`,
            ]
        };
    }
}
