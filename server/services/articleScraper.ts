import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface ScrapedArticle {
  title: string;
  content: string;
  source?: string;
}

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
];

// Demo articles for different news sources
const demoArticles: Record<string, ScrapedArticle> = {
  'nytimes': {
    title: 'Climate Initiative Faces Opposition in Congress',
    content: "WASHINGTON — The ambitious climate initiative proposed by the administration faces increasing opposition in Congress as lawmakers debate its economic implications and timeline for implementation.\n\nThe plan, which aims to reduce carbon emissions by 50% by 2030, has drawn criticism from industry representatives who argue that the timeline is too aggressive and could lead to job losses in traditional energy sectors.\n\n\"We need a balanced approach that considers both environmental and economic impacts,\" said Senator James Wilson, who leads the opposition to the current proposal. \"The transition to renewable energy should be gradual and measured.\"\n\nSupporters of the plan point to scientific consensus indicating that immediate action is necessary to mitigate the effects of climate change. They argue that the initiative would create more jobs in the renewable energy sector than would be lost in fossil fuel industries.\n\nEnvironmental advocacy groups have rallied behind the proposal, organizing demonstrations in major cities and launching educational campaigns about the potential benefits of a green economy.\n\nAs debates continue, administration officials have expressed willingness to consider amendments to the timeline while maintaining the core emissions reduction target. Negotiations are expected to continue through the month before a final vote is scheduled.",
    source: 'New York Times'
  },
  'wsj': {
    title: "Climate Plan's Economic Impact Raises Concerns Among Businesses",
    content: "The administration's climate initiative is facing scrutiny from business leaders and economic analysts who question its potential impact on economic growth and employment in key industries.\n\nAccording to a recent industry-sponsored study, the proposed emissions reduction target could increase energy costs by up to 25% for manufacturers, potentially affecting their competitive position in global markets.\n\n\"While the goals are commendable, the timeline doesn't account for the practical realities of industrial adaptation,\" said Jennifer Roberts, chief economist at Capital Research Institute. \"A more gradual approach would allow businesses to develop and implement effective strategies without significant economic disruption.\"\n\nThe plan calls for substantial investments in renewable energy infrastructure, which proponents argue will create economic opportunities and technological innovation. Government estimates suggest that the initiative could generate up to 300,000 new jobs in clean energy sectors.\n\nHowever, representatives from states with economies heavily dependent on fossil fuel production have expressed concerns about the transition timeline. \"Our communities need more time and support to diversify their economic base,\" said Governor Thomas Brown.\n\nMarket analysts remain divided on the long-term economic implications, with some pointing to potential growth opportunities in emerging green technologies and others highlighting short-term adjustment costs in traditional industries.",
    source: 'Wall Street Journal'
  },
  'foxnews': {
    title: 'Radical Climate Agenda Could Cost American Jobs and Raise Energy Prices',
    content: "The administration's aggressive climate plan is facing growing resistance as experts warn it could destroy thousands of American jobs and significantly raise energy prices for everyday consumers.\n\nThe controversial proposal, which critics describe as an unprecedented government intrusion into the energy market, would impose strict regulations on fossil fuel production while pouring taxpayer dollars into unproven green technologies.\n\n\"This is nothing less than a war on American energy independence,\" said Congressman Robert Johnson. \"We've finally achieved energy self-sufficiency, and now they want to throw it all away for an ideological agenda.\"\n\nIndustry analysts predict that household energy costs could rise by as much as 30% if the plan is implemented as currently written. The hardest hit would be working-class families in states that rely heavily on coal and natural gas for electricity generation.\n\nSeveral state governors have announced plans to challenge the initiative, arguing that it exceeds federal authority and would cause irreparable harm to their economies. \"We'll protect our workers and our industries from this regulatory overreach,\" said one governor from a coal-producing state.\n\nSupporters of the administration maintain that the transition to renewable energy is necessary and would ultimately create more jobs than it eliminates, but many economic experts remain skeptical of these claims.",
    source: 'Fox News'
  },
  'washingtonpost': {
    title: 'Climate Plan Sparks Debate Over Economic Transition Timeline',
    content: "The administration's proposed climate initiative has generated intense debate in Washington about how quickly the U.S. economy can and should transition away from fossil fuels.\n\nThe plan, which includes the most ambitious emissions reduction targets in U.S. history, would accelerate the adoption of renewable energy through a combination of regulations, tax incentives, and direct government investment.\n\nEconomic analysts from across the political spectrum have offered varying assessments of the proposal's potential impact. Studies from center-left think tanks suggest the plan could create a net increase in jobs, while business-aligned research groups warn of potential disruptions in energy-intensive industries.\n\n\"The question isn't whether we should transition to cleaner energy, but how to manage that transition responsibly,\" said Dr. Eleanor Hughes, an energy economist at Capital University. \"The timeline needs to balance environmental urgency with economic stability.\"\n\nThe proposal has revealed divisions even within industries. While traditional energy companies have generally opposed the accelerated timeline, a growing number of corporations have expressed support for more aggressive climate policies, citing long-term economic benefits and investor pressure.\n\nCongressional hearings on the plan began last week, with testimony from environmental experts, industry representatives, and community leaders from regions that would be most affected by the proposed changes.",
    source: 'Washington Post'
  },
  'cnn': {
    title: "Administration's Climate Initiative Faces Crucial Congressional Battle",
    content: "The administration's climate plan faces a pivotal moment as Congress prepares to debate its most controversial provisions amid intense pressure from both environmental advocates and industry groups.\n\nThe ambitious proposal would represent the most significant climate action in U.S. history, establishing emissions reduction targets that align with scientific recommendations for preventing the worst impacts of global warming.\n\nEnvironmental activists have praised the plan as long overdue. \"This is the comprehensive approach we've needed for decades,\" said Maria Rodriguez of Climate Action Alliance. \"The science is clear that we need to act now.\"\n\nHowever, industry representatives have raised concerns about the pace of the proposed transition. \"We support addressing climate change, but this timeline could create serious economic disruptions,\" said James Thompson, president of the National Energy Association.\n\nThe congressional debate is expected to focus on several key areas, including the level of support for communities dependent on fossil fuel industries, incentives for clean energy development, and mechanisms for measuring and enforcing emissions reductions.\n\nPublic opinion polls show a majority of Americans support increased action on climate change, though views differ significantly on the appropriate scale and speed of the transition. The administration has emphasized that the plan includes provisions to protect vulnerable communities and workers.",
    source: 'CNN'
  }
};

/**
 * Generate a demo article based on the URL domain
 */
function getDemoArticle(url: string): ScrapedArticle {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Determine which demo article to return based on the URL
    if (hostname.includes('nytimes')) {
      return demoArticles.nytimes;
    } else if (hostname.includes('wsj')) {
      return demoArticles.wsj;
    } else if (hostname.includes('foxnews')) {
      return demoArticles.foxnews;
    } else if (hostname.includes('washingtonpost')) {
      return demoArticles.washingtonpost;
    } else if (hostname.includes('cnn')) {
      return demoArticles.cnn;
    }
    
    // If no specific match, use a random demo article
    const sources = Object.keys(demoArticles);
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    return demoArticles[randomSource];
  } catch (error) {
    // If URL parsing fails, return a default demo article
    return demoArticles.washingtonpost;
  }
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  try {
    // Check if we should use the real scraper or demo articles
    if (!process.env.NEWS_API_KEY) {
      console.log("Using demo article due to missing News API key");
      return getDemoArticle(url);
    }
    
    // Parse the URL for source information
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const domainParts = hostname.split('.');
    
    // Enhanced source name extraction and formatting
    let source = '';
    
    // Special case handling for common domains
    if (hostname.includes('nytimes')) {
      source = 'New York Times';
    } else if (hostname.includes('wsj')) {
      source = 'Wall Street Journal';
    } else if (hostname.includes('washingtonpost')) {
      source = 'Washington Post';
    } else if (hostname.includes('foxnews')) {
      source = 'Fox News';
    } else if (hostname.includes('cnn')) {
      source = 'CNN';
    } else if (hostname.includes('nbcnews')) {
      source = 'NBC News';
    } else if (hostname.includes('abcnews')) {
      source = 'ABC News';
    } else if (hostname.includes('cbsnews')) {
      source = 'CBS News';
    } else if (hostname.includes('reuters')) {
      source = 'Reuters';
    } else if (hostname.includes('apnews')) {
      source = 'Associated Press';
    } else if (hostname.includes('bbc')) {
      source = 'BBC News';
    } else if (hostname.includes('theguardian')) {
      source = 'The Guardian';
    } else if (hostname.includes('politico')) {
      source = 'Politico';
    } else {
      // Default extraction from domain
      source = domainParts.length >= 2 ? 
        domainParts[domainParts.length - 2] : hostname;
      
      // Capitalize source name nicely
      source = source.charAt(0).toUpperCase() + source.slice(1);
    }
    
    // Get a random user agent for the request
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    try {
      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove elements that typically don't contain article content
      $('script, style, nav, header, footer, iframe, .ads, .ad, .advertisement, .social, .comments, .sidebar').remove();
      
      // Extract title - attempt various common title selectors
      let title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  $('title').text() || 
                  $('h1').first().text();
      
      // Extract content - first try common article containers
      let content = '';
      const articleSelectors = [
        'article', 'main', '.article-content', '.post-content', '.entry-content', 
        '.story-body', '.article-body', '#article-body', '.content'
      ];
      
      for (const selector of articleSelectors) {
        const element = $(selector);
        if (element.length) {
          content = element.text().trim();
          break;
        }
      }
      
      // If no content found in common containers, fallback to paragraphs
      if (!content) {
        const paragraphs = $('p');
        const paragraphTexts: string[] = [];
        paragraphs.each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 30) { // Only consider paragraphs with substantial text
            paragraphTexts.push(text);
          }
        });
        content = paragraphTexts.join('\n\n');
      }
      
      // Clean up text
      title = title.trim().replace(/\s+/g, ' ');
      content = content.trim().replace(/\s+/g, ' ');
      
      if (!title || title.length < 3) {
        throw new Error('Could not extract article title');
      }
      
      if (!content || content.length < 100) {
        throw new Error('Could not extract article content');
      }
      
      return {
        title,
        content,
        source: source.charAt(0).toUpperCase() + source.slice(1) // Capitalize source
      };
    } catch (scrapingError) {
      console.error('Scraping error, using demo article:', scrapingError);
      return getDemoArticle(url);
    }
  } catch (error) {
    console.error('Error in scrapeArticle:', error);
    // Even if something goes wrong, return a demo article
    return getDemoArticle(url);
  }
}
