import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export const extractTextFromPDF = async (filePath) => {
  try {
    const pdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    let text = '';

    for (const page of pages) {
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const validatePDF = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('PDF file size exceeds 10MB limit');
    }

    const pdfBytes = await fs.readFile(filePath);
    await PDFDocument.load(pdfBytes);
    return true;
  } catch (error) {
    console.error('Error validating PDF:', error);
    throw new Error('Invalid PDF file');
  }
};

export const cleanupPDF = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up PDF file:', error);
  }
}; 