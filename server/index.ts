import express, { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import robotsParser from "robots-parser";
import cors from "cors";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

interface ScrapedData {
  url: string;
  title?: string;
  description?: string;
  h1?: string;
  h2?: string;
  error?: string; // Add error property
  products?: Product[]; // Add products property
  [key: string]: any;
}
interface Product {
  title?: string;
  imageUrl?: string;
  price?: string;
  description?: string;
  link?: string; // Add link property
  [key: string]: any; // Allow other dynamic properties
}

async function crawl(url: string, maxDepth: number = 1): Promise<ScrapedData> {
  try {
    const robotsURL = new URL("/robots.txt", new URL(url).origin).toString();
    const robotsResponse = await axios.get(robotsURL);
    const robots = robotsParser(url, robotsResponse.data as string);

    if (!robots.isAllowed(url, "MyCoolScraper/1.0")) {
      console.log(`URL ${url} disallowed by robots.txt`);
      return { url, error: "URL disallowed by robots.txt" }; // Return error object
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "MyCoolScraper/1.0",
      },
    });

    const $ = cheerio.load(response.data as string);

    return { url, $: $ };
  } catch (error: any) {
    // Type 'any' for error, as its type is not always known
    console.error(`Error crawling ${url}: ${error}`);
    return { url, error: error.message }; // Return error object
  }
}

app.post("/scrape", async (req: Request, res: Response): Promise<void> => {
  const {
    url,
    titleSelector,
    imageUrlSelector,
    priceSelector,
    descriptionSelector,
    productContainerSelector,
  } = req.body;

  if (!url) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  try {
    const scrapedData: ScrapedData = await crawl(url);

    if (scrapedData.error) {
      res.json(scrapedData); // Send error response
      return; // Return void
    }

    const $ = scrapedData.$; // Access the Cheerio object

    //console.log($.html());

    const products: Product[] = [];
    $(productContainerSelector).each(
      (index: number, element: cheerio.Element) => {
        // Iterate over product containers
        const product: Product = {};

        product.title = $(element).find(titleSelector).text().trim();
        product.imageUrl = $(element)
          .find(imageUrlSelector)
          .attr("href")
          ?.trim();
        product.price = $(element).find(priceSelector).text().trim();
        product.description = $(element)
          .find(descriptionSelector)
          .text()
          .trim();
        products.push(product);
      }
    );

    scrapedData.products = products; // Assign the products array
    delete scrapedData.$; // Remove Cheerio object

    res.json(scrapedData);
  } catch (error: any) {
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
