/* eslint-disable */
import { createFormHelper } from "e2e/helpers/FormHelper.js";
import { test as base, expect } from '@playwright/test';

const test = base.extend({
    form: async ({ page }, use) => {
        const formHelper = createFormHelper(page);
        await use(formHelper)
    }
});

export { test, expect }

