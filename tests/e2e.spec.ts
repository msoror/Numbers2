import { expect, Page, test } from '@playwright/test';

async function dismissPlacementPromptIfVisible(page: Page) {
  const skipBtn = page.getByRole('button', { name: /Skip for now|تخطي الآن/i });
  if (await skipBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await skipBtn.click();
  }
}

test.describe('Nile Numbers E2E accessibility, layout, pause & placement exam', () => {
  test('Pause blocks keyboard input, traps focus inside dialog, and restores focus on close', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await dismissPlacementPromptIfVisible(page);

    // Start first level directly via Continue Learning
    await page.getByRole('button', { name: /Continue Learning/i }).click();
    await expect(page.getByText(/Question 1\/6/)).toBeVisible();

    const pauseBtn = page.getByRole('button', { name: 'Pause' });
    await pauseBtn.focus();
    await pauseBtn.click();

    const pauseDialog = page.getByRole('dialog');
    await expect(pauseDialog).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();

    // Pressing answer shortcuts 1..4 while paused must NOT advance or alter question state
    await page.keyboard.press('1');
    await page.keyboard.press('2');
    await page.keyboard.press('3');
    await page.keyboard.press('4');
    await page.waitForTimeout(300);
    await expect(pauseDialog).toBeVisible();
    await expect(page.getByText(/Question 1\/6/)).toBeVisible();

    // Tab cycling must remain strictly inside the Pause dialog
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focusInside = await pauseDialog.evaluate((el) => el.contains(document.activeElement));
      expect(focusInside).toBe(true);
    }

    // Pressing Escape resumes and restores focus to the Pause button
    await page.keyboard.press('Escape');
    await expect(pauseDialog).toBeHidden();
    await expect(pauseBtn).toBeFocused();
  });

  test('No overlap between guide and answer buttons at 390x844 phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await dismissPlacementPromptIfVisible(page);

    // Start Level 1 (Place Value multiple choice)
    await page.getByRole('button', { name: /Continue Learning/i }).click();
    await expect(page.getByText(/Question 1\/6/)).toBeVisible();

    // Verify no horizontal overflow on 390px phone
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(hasOverflow).toBe(false);

    // Check answer option buttons are unobstructed by any pointer-events-auto guide bubble
    const answerButtons = page.locator('main button, [data-testid="answer-option"], button').filter({
      hasText: /^\d{2,3}$/,
    });
    const count = await answerButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const btn = answerButtons.nth(i);
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (!box) continue;

      const hitTag = await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return el ? el.closest('button')?.textContent?.trim() ?? '' : '';
        },
        { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      );
      const expectedText = (await btn.textContent())?.trim() ?? '';
      expect(hitTag).toBe(expectedText);
    }
  });

  test('Arabic RTL layout sets html[lang="ar"][dir="rtl"] with zero horizontal clipping at 390x844', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await dismissPlacementPromptIfVisible(page);

    // Switch to Arabic
    await page.getByRole('button', { name: /Switch language|عربي/i }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const titleOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(titleOverflow).toBe(false);

    // Navigate to Game Section and verify zero clipping in Arabic RTL
    await page.getByRole('button', { name: /قسم الألعاب/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const mapOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(mapOverflow).toBe(false);
  });

  test('Complete full 24-question Placement Exam at 390x844 in English and Arabic', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await dismissPlacementPromptIfVisible(page);

    // Run 1: English Placement Exam
    await page.getByRole('button', { name: /Level Check/i }).first().click();
    await expect(page.getByText(/Question 1\/24/)).toBeVisible();

    // Soft timer must be OFF by default
    await expect(page.getByRole('button', { name: /Soft Timer: Off/i })).toBeVisible();

    // Skip Q1, then answer remaining questions and return to Q1
    await page.getByRole('button', { name: /Skip/i }).click();
    await expect(page.getByText(/Question 2\/24/)).toBeVisible();

    for (let step = 0; step < 24; step++) {
      const finishBtn = page.getByRole('button', { name: /Finish Level Check/i });
      if (await finishBtn.isVisible().catch(() => false)) {
        break;
      }
      await page.keyboard.press('1');
      await page.waitForTimeout(30);
    }

    const finishEn = page.getByRole('button', { name: /Finish Level Check/i });
    await expect(finishEn).toBeVisible();
    await finishEn.click();

    // Verify Results screen in English at 390x844
    await expect(page.getByText(/Top 2 Strengths/i)).toBeVisible();
    await expect(page.getByText(/Top 2 Areas to Practise/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Download Report/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Recommended Path/i })).toBeVisible();

    const enOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(enOverflow).toBe(false);

    // Return Home, switch to Arabic, and complete Placement Exam in Arabic RTL
    await page.getByRole('button', { name: /Home/i }).click();
    await page.getByRole('button', { name: /Switch language|عربي/i }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.getByRole('button', { name: /اختبار المستوى|تحديد المستوى/ }).first().click();
    await expect(page.getByText(/سؤال 1\/24/)).toBeVisible();

    for (let step = 0; step < 24; step++) {
      const finishBtnAr = page.getByRole('button', { name: /إنهاء اختبار المستوى/ });
      if (await finishBtnAr.isVisible().catch(() => false)) {
        break;
      }
      await page.keyboard.press('1');
      await page.waitForTimeout(30);
    }

    const finishAr = page.getByRole('button', { name: /إنهاء اختبار المستوى/ });
    await expect(finishAr).toBeVisible();
    await finishAr.click();

    await expect(page.getByText(/أبرز نقطتي قوة/)).toBeVisible();
    await expect(page.getByRole('button', { name: /تحميل التقرير/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /ابدأ المسار المقترح/ })).toBeVisible();

    const arOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(arOverflow).toBe(false);
  });
});
