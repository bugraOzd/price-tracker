"use client";

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react";

const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLaoding, setisLaoding] = useState(false);

  const isValidAmazonUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const hostName = parsedUrl.hostname;

      if (
        hostName.includes("amazon.com") ||
        hostName.includes("amazon.") ||
        hostName.endsWith("amazon")
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // default behaviour is to reload the page, so we use preventDefault

    console.log(searchPrompt);

    const isValidLink = isValidAmazonUrl(searchPrompt);

    if (!isValidLink) return alert("Please provide a valid Amazon link.");

    try {
      setisLaoding(true);

      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setisLaoding(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      ></input>

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ""}
      >
        {isLaoding ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
