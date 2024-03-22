import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return

  // ! BrightData proxy config
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password: password
    },
    host: 'brd.superproxy.io',
    port: port,
    rejectUnauthorized: false
  }

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    const title = $('#productTitle').text().trim();

    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
      $('.a-price-whole')
    );

    const originalPrice = extractPrice(
      $('.a-price.a-text-price span.a-offscreen')
    );

    const discountPercentage = $('.savingsPercentage').text().replace(/[-%]/g, '');

    const avgReviews = $('span.a-size-base.a-color-base', '#averageCustomerReviews').text().trim().slice(0, 3) ||
      $('#averageCustomerReviews span.a-size-base.a-color-base').text().trim().slice(0, 3);

    const isAvailable = $('#availability span').text().trim().toLowerCase() === 'stokta var';

    const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') || '{}';

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'));

    const description = extractDescription($)

    const reviewsCount = $('#acrCustomerReviewLink span').text().trim();

    const data = {
      url,
      title,
      avgReviews,
      isAvailable,
      description,
      currency: currency || '$',
      image: imageUrls[0],
      priceHistory: [],
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      discountPercentage: Number(discountPercentage),
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      category: 'category',
      reviewsCount: 100,
    };

    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product ${error.message}`);
  }
}
