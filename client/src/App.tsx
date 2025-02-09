import React, { useState, useRef, JSX } from "react";
import "./App.css";

interface ScrapedData {
  url: string;
  title?: string;
  description?: string;
  h1?: string;
  h2?: string;
  [key: string]: unknown; // Allow for other dynamic properties
}

function App(): JSX.Element {
  const [url, setUrl] = useState("");
  const [titleSelector, setTitleSelector] = useState("");
  const [imageUrlSelector, setImageUrlSelector] = useState("");
  const [priceSelector, setPriceSelector] = useState("");
  const [descriptionSelector, setDescriptionSelector] = useState("");
  const [productContainerSelector, setProductContainerSelector] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const jsonDisplayRef = useRef<HTMLPreElement>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setScrapedData(null);

    try {
      const response = await fetch("http://localhost:5000/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          titleSelector,
          imageUrlSelector,
          priceSelector,
          descriptionSelector,
          productContainerSelector,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Scraping failed");
      }

      const data: ScrapedData = await response.json();
      setScrapedData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error(err);
      } else {
        setError("An unknown error occurred");
        console.error("An unknown error occurred", err);
      }
    }
  };

  const handleCopyClick = (): void => {
    if (jsonDisplayRef.current && scrapedData) {
      // Check if scrapedData is not null
      const jsonString = JSON.stringify(scrapedData, null, 2);
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          console.log("JSON copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy JSON: ", err);
        });
    }
  };

  return (
    <div className='mx-auto container  p-4 bg-gray-100 min-h-screen flex flex-col'>
      <h1 className='text-3xl font-bold mb-4 text-center text-gray-800'>
        Web Scraper
      </h1>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col items-center w-full'
      >
        <input
          type='text'
          placeholder='Enter URL'
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUrl(e.target.value)
          }
          className='w-full md:max-w-[500px] p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />

        <input
          type='text'
          placeholder='Container Selector'
          value={productContainerSelector}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setProductContainerSelector(e.target.value)
          }
          className='w-full md:max-w-[500px] p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />

        <input
          type='text'
          placeholder='Title Selector'
          value={titleSelector}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitleSelector(e.target.value)
          }
          className='w-full md:max-w-[500px] p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <input
          type='text'
          placeholder='Image URL Selector'
          value={imageUrlSelector}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setImageUrlSelector(e.target.value)
          }
          className='w-full md:max-w-[500px] p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <input
          type='text'
          placeholder='Price Selector'
          value={priceSelector}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPriceSelector(e.target.value)
          }
          className='w-full md:max-w-[500px] p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <input
          type='text'
          placeholder='Description Selector'
          value={descriptionSelector}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDescriptionSelector(e.target.value)
          }
          className='w-full md:max-w-[500px] p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />

        <button
          type='submit'
          className='bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors duration-300 w-full md:w-auto'
        >
          Submit
        </button>
      </form>

      {error && <p className='text-red-500 mt-4 text-center'>{error}</p>}

      {scrapedData && (
        <div className='mt-8 p-4 border border-gray-300 rounded bg-white shadow-md flex flex-col flex-grow'>
          <h2 className='text-2xl font-bold mb-2 text-gray-800'>JSON Result</h2>
          <pre
            ref={jsonDisplayRef}
            className='whitespace-pre-wrap break-words bg-gray-100 p-3 rounded mb-4 overflow-auto flex-grow'
          >
            {JSON.stringify(scrapedData, null, 2)}
          </pre>
          <button
            onClick={handleCopyClick}
            className='bg-green-500 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors duration-300 w-full md:w-auto self-center'
          >
            Copy JSON
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
