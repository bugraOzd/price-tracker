import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose";
import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotificationType } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    connectToDB();

    const products = await Product.find();

    if (!products) throw new Error('No products found');

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) throw new Error('Product not found');

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice }
        ];

        const product = {
          ...scrapedProduct,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory)
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: scrapedProduct.url },
          product,
          { upsert: true, new: true }
        );

        const emailNotificationType = getEmailNotificationType(scrapedProduct, currentProduct);

        if (emailNotificationType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct,
            url: updatedProduct.url
          };

          const emailContent = await generateEmailBody(productInfo, emailNotificationType);

          const userEmails = updatedProduct.users.map((user: any) => user.email);

          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: 'Ok',
      data: updatedProducts
    });

  } catch (error) {
    throw new Error(`ERROR IN GET: ${error}`);
  }
}