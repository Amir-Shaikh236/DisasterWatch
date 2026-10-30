export const createFormHelper = (page) => ({

    fillField: async (label, value) => {
        await page.getByLabel(label).fill(value)
    },


    selectOption: async (label, optionText) => {
        await page.getByLabel(label).selectOption({ label: optionText })
    },

    submitButton: async (nameRegex = /Login|submit|Register/i) => {
        await page.getByRole('button', { name: nameRegex }).click()
    },

});