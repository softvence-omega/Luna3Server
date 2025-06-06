import { chromium } from 'playwright';

const jobTitles = ['software developer', 'UX designer', 'cyber security analyst', 'data scientist', 'product manager', 'DevOps engineer', 'marketing specialist', 'sales engineer'];
const jobLocations = ['canada'];

export const scrapeLinkedInJobs = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const allJobs: any[] = [];

  for (const title of jobTitles) {
    for (const location of jobLocations) {
      const keyword = encodeURIComponent(title);
      const loc = encodeURIComponent(location);
      const url = `https://www.linkedin.com/jobs/search/?keywords=${keyword}&location=${loc}&f_TPR=r86400`;
      console.log(`[SCRAPER] Visiting: ${url}`);

      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000); // wait for content

      const jobs = await page.$$eval(
        '.base-card',
        (cards, title) =>
          cards.map((card) => {
            const postedStr =
              card.querySelector('time')?.getAttribute('datetime') || '';
            return {
              title: card.querySelector('h3')?.textContent?.trim() || '',
              company: card.querySelector('h4')?.textContent?.trim() || '',
              location:
                card
                  .querySelector('.job-search-card__location')
                  ?.textContent?.trim() || '',
              link: card.querySelector('a')?.href || '',
              posted: postedStr ? new Date(postedStr) : new Date(),
              category: title,
              source: 'LinkedIn',
            };
          }),
        title,
      );

      allJobs.push(...jobs);
    }
  }

  await browser.close();
  return allJobs;
};
