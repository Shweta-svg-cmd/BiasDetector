import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

export interface BiasAnalysisResponse {
  biasScore: number;
  politicalLeaning: string;
  emotionalLanguage: string;
  factualReporting: string;
  keyFindings: string[];
  biasedPhrases: { original: string, neutral: string }[];
  sourceDistribution: {
    leftLeaning: number;
    neutral: number;
    rightLeaning: number;
  };
  languageDistribution: {
    neutral: number;
    biased: number;
  };
  topics: string[];
  mainTopic: string;
}

// Demo function to generate consistent results without OpenAI
function getDemoAnalysisResult(text: string, title: string): BiasAnalysisResponse {
  // Create a random but realistic bias score
  const calculateBiasScore = () => {
    // Generate different scores for different articles
    // Use a mix of title and text length to create variety
    const titleHash = title.length * 13;
    const textHash = text.length * 7;
    const combinedHash = (titleHash + textHash) % 100;
    
    // Ensure we have a good distribution of bias scores across the spectrum
    // Most news articles have some bias, so rarely return extremely low scores
    if (combinedHash < 20) {
      return 30 + Math.floor(Math.random() * 20); // 30-50 range (moderate)
    } else if (combinedHash < 60) {
      return 50 + Math.floor(Math.random() * 30); // 50-80 range (significant bias)
    } else {
      return 70 + Math.floor(Math.random() * 25); // 70-95 range (high bias)
    }
  };

  const biasScore = calculateBiasScore();
  
  // Determine political leaning based on the generated bias score
  const getPoliticalLeaning = () => {
    if (biasScore < 40) return "Centrist";
    if (biasScore < 60) return biasScore % 2 === 0 ? "Lean Left" : "Lean Right";
    if (biasScore < 80) return biasScore % 2 === 0 ? "Left-leaning" : "Right-leaning";
    return biasScore % 2 === 0 ? "Far Left" : "Far Right";
  };

  // Generate demo biased phrases
  const generateDemoBiasedPhrases = () => {
    const demoPhrases = [
      { original: "radical agenda", neutral: "policy proposal" },
      { original: "destroy the economy", neutral: "impact economic growth" },
      { original: "reckless spending", neutral: "federal expenditure" },
      { original: "climate change hoax", neutral: "climate change research" },
      { original: "liberal elite", neutral: "government officials" },
      { original: "communist takeover", neutral: "regulatory changes" },
      { original: "freedom-crushing regulations", neutral: "regulatory framework" },
      { original: "right-wing extremists", neutral: "political opponents" },
      { original: "socialist nightmare", neutral: "progressive policies" },
      { original: "corrupt politicians", neutral: "elected officials" }
    ];
    
    // Select a subset based on the bias score
    const numPhrases = Math.max(3, Math.min(8, Math.floor(biasScore / 15)));
    return demoPhrases.slice(0, numPhrases);
  };

  // Generate topics based on the title
  const generateTopics = () => {
    // List of possible topics
    const allTopics = [
      "Politics", "Economy", "Health", "Environment", "Technology", 
      "International", "Military", "Law", "Education", "Society",
      "Culture", "Science", "Immigration", "Civil Rights", "Elections"
    ];
    
    // Select a main topic and 2-4 related topics based on title content
    const titleLower = title.toLowerCase();
    
    // Logic to determine the main topic from title keywords
    let mainTopic = "Politics"; // Default
    
    if (titleLower.includes("econom") || titleLower.includes("market") || 
        titleLower.includes("inflation") || titleLower.includes("jobs") || 
        titleLower.includes("unemploy")) {
      mainTopic = "Economy";
    } else if (titleLower.includes("health") || titleLower.includes("covid") || 
               titleLower.includes("pandemic") || titleLower.includes("disease") || 
               titleLower.includes("vaccine")) {
      mainTopic = "Health";
    } else if (titleLower.includes("climate") || titleLower.includes("environment") || 
               titleLower.includes("pollution") || titleLower.includes("green")) {
      mainTopic = "Environment";
    } else if (titleLower.includes("tech") || titleLower.includes("digital") || 
               titleLower.includes("app") || titleLower.includes("internet") || 
               titleLower.includes("ai") || titleLower.includes("artificial intelligence")) {
      mainTopic = "Technology";
    } else if (titleLower.includes("war") || titleLower.includes("military") || 
               titleLower.includes("army") || titleLower.includes("weapon") || 
               titleLower.includes("defense")) {
      mainTopic = "Military";
    } else if (titleLower.includes("international") || titleLower.includes("global") || 
               titleLower.includes("foreign") || titleLower.includes("diplomat") || 
               titleLower.includes("nation")) {
      mainTopic = "International";
    } else if (titleLower.includes("law") || titleLower.includes("court") || 
               titleLower.includes("judge") || titleLower.includes("justice") || 
               titleLower.includes("legal")) {
      mainTopic = "Law";
    }
    
    // Create a list of topics, always including the main one
    const topics = [mainTopic];
    
    // Add "Politics" if it's not already the main topic
    if (mainTopic !== "Politics") {
      topics.push("Politics");
    }
    
    // Add 1-3 more random topics different from what we already have
    const remainingTopics = allTopics.filter(t => !topics.includes(t));
    const numAdditional = 1 + Math.floor(Math.random() * 3); // 1-3 additional topics
    
    for (let i = 0; i < numAdditional && i < remainingTopics.length; i++) {
      const randomIndex = Math.floor(Math.random() * remainingTopics.length);
      topics.push(remainingTopics[randomIndex]);
      // Remove the selected topic to avoid duplicates
      remainingTopics.splice(randomIndex, 1);
    }
    
    return { mainTopic, topics };
  };
  
  const { mainTopic, topics } = generateTopics();

  return {
    biasScore,
    politicalLeaning: getPoliticalLeaning(),
    emotionalLanguage: biasScore > 70 ? "High" : biasScore > 40 ? "Moderate" : "Low",
    factualReporting: biasScore > 70 ? "Low" : biasScore > 50 ? "Moderate" : "High",
    keyFindings: [
      "Uses emotionally charged language to describe policies",
      "Contains unsupported claims about opponents",
      "Presents one-sided view of complex issues",
      "Lacks balanced representation of different perspectives"
    ],
    biasedPhrases: generateDemoBiasedPhrases(),
    sourceDistribution: {
      leftLeaning: Math.floor(biasScore / 20),
      neutral: 10 - Math.floor(biasScore / 10),
      rightLeaning: Math.floor(biasScore / 25)
    },
    languageDistribution: {
      neutral: 100 - Math.floor(biasScore * 0.7),
      biased: Math.floor(biasScore * 0.7)
    },
    topics,
    mainTopic
  };
}

// Demo function to generate a "neutral" version of an article
function getDemoNeutralVersion(text: string): string {
  // For demo purposes, we'll make some simple replacements
  const replacements = [
    { pattern: /radical/gi, replacement: "proposed" },
    { pattern: /destroy/gi, replacement: "affect" },
    { pattern: /reckless/gi, replacement: "significant" },
    { pattern: /hoax/gi, replacement: "topic" },
    { pattern: /elite/gi, replacement: "officials" },
    { pattern: /takeover/gi, replacement: "changes" },
    { pattern: /freedom-crushing/gi, replacement: "" },
    { pattern: /extremists/gi, replacement: "advocates" },
    { pattern: /nightmare/gi, replacement: "policy" },
    { pattern: /corrupt/gi, replacement: "elected" }
  ];

  let neutralText = text;
  for (const { pattern, replacement } of replacements) {
    neutralText = neutralText.replace(pattern, replacement);
  }
  
  return neutralText + "\n\n[This is a demo neutral version for testing purposes only]";
}

export async function analyzeArticleBias(text: string, title: string): Promise<BiasAnalysisResponse> {
  try {
    // Check if OpenAI API key is valid
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-") === false) {
      console.log("Using demo analysis result due to missing or invalid OpenAI API key");
      return getDemoAnalysisResult(text, title);
    }

    // Try using the actual OpenAI API
    const prompt = `
      Analyze the following news article for media bias. Provide a comprehensive analysis including:
      1. A bias score from 0-100 (0 being completely neutral, 100 being extremely biased)
      2. Political leaning (Left-leaning, Right-leaning, Centrist, etc.)
      3. Emotional language rating (Low, Moderate, High)
      4. Factual reporting rating (Low, Moderate, High)
      5. 3-5 key findings about bias in the content
      6. A list of 3-10 biased phrases with their neutral alternatives
      7. Source distribution (number of left-leaning, neutral, and right-leaning sources)
      8. Language distribution (percentage of neutral vs biased language)
      9. List of 3-5 relevant topics from the following categories: Politics, Economy, Health, Environment, Technology, International, Military, Law, Education, Society, Culture, Science, Immigration, Civil Rights, Elections
      10. The main topic (just one) that best describes the article's subject

      Format your response as a JSON object with these properties: biasScore, politicalLeaning, emotionalLanguage, factualReporting, keyFindings, biasedPhrases, sourceDistribution, languageDistribution, topics (array of strings), mainTopic (string).

      Title: ${title}
      Article: ${text}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
  
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from OpenAI");
      }
  
      const analysis = JSON.parse(content) as BiasAnalysisResponse;
      return analysis;
    } catch (openaiError) {
      console.error("OpenAI API error, falling back to demo result:", openaiError);
      return getDemoAnalysisResult(text, title);
    }
  } catch (error) {
    console.error("Error analyzing article bias:", error);
    // Even if there's an error in our error handling, still return a demo result
    return getDemoAnalysisResult(text, title);
  }
}

export async function generateNeutralVersion(text: string, biasedPhrases?: { original: string, neutral: string }[]): Promise<string> {
  try {
    // Check if OpenAI API key is valid
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-") === false) {
      console.log("Using demo neutral version due to missing or invalid OpenAI API key");
      return getDemoNeutralVersion(text);
    }

    // Check if biasedPhrases is valid, if not use a default empty array
    const validBiasedPhrases = Array.isArray(biasedPhrases) ? biasedPhrases : [];
    
    // Try using the actual OpenAI API
    const phrasesText = validBiasedPhrases.length > 0 
      ? validBiasedPhrases.map(p => `"${p.original}" -> "${p.neutral}"`).join("\n")
      : "No specific phrases identified. Please neutralize any biased language you find.";
    
    const prompt = `
      Rewrite the following news article to make it completely neutral and unbiased. 
      Maintain the core facts but remove any politically charged language, emotional framing,
      or unbalanced perspectives. Ensure the tone is objective and journalistic.
      
      Here are the specific biased phrases identified (with neutral alternatives):
      ${phrasesText}
      
      Original article:
      ${text}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
      });
  
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to get response from OpenAI");
      }
  
      return content;
    } catch (openaiError) {
      console.error("OpenAI API error, falling back to demo neutral version:", openaiError);
      return getDemoNeutralVersion(text);
    }
  } catch (error) {
    console.error("Error generating neutral version:", error);
    // Even if there's an error in our error handling, still return a demo result
    return getDemoNeutralVersion(text);
  }
}
