describe('Basic user flow for List Page Website', () => {
    // First, visit the website before running any tests
    beforeAll(async () => {
      await page.goto('http://127.0.0.1:5501/src/html/list.html');
    });

    // Testing 1: Initial check for 0 journals
    it('Initial Check for 0 journals', async () => {
        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
        // Check that the number of journal entries is 0
        expect(journalEntries.length).toBe(0);
    });
    
    // Testing 2: Canceling a new Journal
    it("Canceling creation of journal does not create journal", async() => {
        await page.click('.new-journal-button');
        page.on('dialog', async dialog => {
            await dialog.accept();
        })
        await page.click('#cancelModal');
       const journalEntries = await page.$$('#item-list li');
    expect(journalEntries.length).toBe(0);
    });
      
    // Testing 3: Add a journal to the list
    it('Add journal to list', async () => {
        // Click the new journal button to open the editor
        await page.click('.new-journal-button');
        
        // Enter the title
        await page.type('#journalTitle', 'Test Title');

        // Enter the contents
        await page.evaluate(() => {
            const quill = new Quill('#editor', { theme: 'snow' });
            quill.setText('Test Content');
        });

        // Click the save journal button
        await page.click('#closeModal');

        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
        
        // Check that the number of journal entries is 1
        expect(journalEntries.length).toBe(1);
    });

    // Testing 4: Edit a journal
    it('Edit journal', async () => {
        // Reload the page to ensure a clean state
        await page.reload();
    
        // Wait for the journal entry to be available and select it
        await page.waitForSelector('#item-list li');
        const journalEntry = await page.$('#item-list li');
        await journalEntry.click();
    
        await page.$eval('#journalTitle', input => input.value = '');

        // Modify the existing title
        await page.type('#journalTitle', 'Updated Title');
    
        // Modify the existing content
        await page.evaluate(() => {
            const quill = new Quill('#editor', { theme: 'snow' });
            quill.setText('Updated content for the journal.');
        });
    
        // Click the Save Changes button
        await page.click('#closeModal');
        // Get the updated title text without the additional information
        // Get the updated title text without the additional information
        const journaltitle = await page.evaluate(() => {
        const titleElement = document.querySelector('#item-list li:first-child');
        return titleElement.textContent.split(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)[0].trim();
        });
        // Check that the title is updated  
        expect(journaltitle).toBe('Updated Title');
        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');

        // Check that the number of journal entries is 1
        expect(journalEntries.length).toBe(1);
    });
    

    //Testing 5: Delete a journal from the list entry
    it('Delete journal from the list entry', async () => {
        // Reload the page to ensure a clean state
        await page.reload();
        await page.hover('li');
        // Click the delete icon
        await page.click('.delete-button');
    
        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
        
        // Check that the number of journal entries is 0
        expect(journalEntries.length).toBe(0);
    });
    

    // Testing 6: Delete a journal from the modal
    it('Delete journal from the modal', async () => {
        // Reload the page to ensure a clean state
        await page.reload();
        // Add new Journal Entry
        await page.click('.new-journal-button');
        
        // Enter the title
        await page.type('#journalTitle', 'Test Title');

        // Enter the contents
        await page.evaluate(() => {
            const quill = new Quill('#editor', { theme: 'snow' });
            quill.setText('Test Content');
        });

        // Click the save journal button
        await page.click('#closeModal'); 
               
        // Get all journal entries on the page
        let journalEntries = await page.$$('#item-list li');
        expect(journalEntries.length).toBe(1);
        
        // Wait for the journal entry to be available and select it
        await page.waitForSelector('#item-list li');
        const journalEntry = await page.$('#item-list li');
        await journalEntry.click();
        
        // Wait for the delete button to be available within the modal
        await page.waitForSelector('#deleteModal');
        
        // Click the delete button
        await page.click('#deleteModal');
        
        // Wait for the journal list to be updated (you might need to adjust the selector based on your application)
        await page.waitForSelector('#item-list li', { hidden: true });
        
        // Check that the number of journal entries is 0
        journalEntries = await page.$$('#item-list li');
        expect(journalEntries.length).toBe(0);
    });

    //Testing 7: Adding multiple journals
    it('Add multiple journals to list', async () => {
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        // Click the new journal button to open the editor
        await page.click('.new-journal-button');
        
        // Enter the title
        await page.click('#journalTitle');
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');

        await page.type('#journalTitle', 'Test Title');

        // Enter the contents
        await page.evaluate(() => {
            const quill = new Quill('#editor', { theme: 'snow' });
            quill.setText('Test Content');
        });

        // Click the save journal button
        await page.click('#closeModal');

        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
        
        // Check that the number of journal entries is 1
        expect(journalEntries.length).toBe(1);

        // Click the new journal button to open the editor
        await page.click('.new-journal-button');
        
        // Enter the title
        await page.click('#journalTitle');
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await timeout(2000);
        await page.type('#journalTitle', 'Test 2');

        // Enter the contents
        await page.evaluate(() => {
            const quill = new Quill('#editor', { theme: 'snow' });
            quill.setText('Test Content 2');
        });

        // Click the save journal button
        await page.click('#closeModal');

        // Get all journal entries on the page
        const journalEntries2 = await page.$$('#item-list li');
        
        // Check that the number of journal entries is 2
        expect(journalEntries2.length).toBe(2);
        // Click the new journal button to open the editor
        await page.click('.new-journal-button');
        
        // Enter the title
        await page.click('#journalTitle');
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await timeout(2000);
        await page.type('#journalTitle', 'This is testing');

        // Enter the contents
        await page.evaluate(() => {
            const quill = new Quill('#editor', { theme: 'snow' });
            quill.setText('Test Content 3');
        });

        // Click the save journal button
        await page.click('#closeModal');

        // Get all journal entries on the page
        const journalEntries3 = await page.$$('#item-list li');
        
        // Check that the number of journal entries is 3
        expect(journalEntries3.length).toBe(3);
    });

    
    // Testing 8: Search for a journal by title
    it('Search for journal by title', async () => {
        // Reload the page to ensure a clean state
        await page.reload();
        
        // Wait for the search bar to be available
        await page.waitForSelector('#search-bar');
        
        // Enter the search term
        await page.type('#search-bar', 'This is testing');
        
        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
        
        // Check that the number of journal entries is 1
        expect(journalEntries.length).toBe(1);
    });
    
  
    // Testing 9: Filter the journal by date (to be implemented)
    it('Filter the journal by date', async () => {
        const testTime = new Date();
        const testMonth = ("0" + (testTime.getMonth() + 1)).slice(-2);
        const testDate = testMonth + ("0" + testTime.getDate()).slice(-2) + testTime.getFullYear()
        await page.reload();
        //clicks on filter button
        await page.click('.filter-button');
        await page.type('#start-date', testDate);
        await page.type('#end-date', testDate);
        const journalEntriesFilter = await page.$$('#item-list li');
        expect(journalEntriesFilter.length).toBe(3);
    });

    // Testing 10: Sort the journal by title reverse alphabetically
    it('Sort the journal by title reverse alphabetically', async () => {
        function extractTextWithoutDateTime(text) {
            // Adjust the regex pattern to match "DD/MM/YYYY HH:MM"
            return text.replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, '').trim();
        }

        function isSortedReverseAlphabetically(arr) {
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i].localeCompare(arr[i + 1]) < 0) {
                    return false;
                }
            }
            return true;
        }

        await page.reload();
        await page.click('#sort-name');

        // Get all journal entries on the page
        const journalEntriesAlphaSort = await page.$$('#item-list li');
        // Fetch the title of the journal entries
        let result = [];
        for(let t of journalEntriesAlphaSort){
            const textContent = await t.evaluate(x => x.textContent);
            result.push(extractTextWithoutDateTime(textContent));
        }
        let result2 = await Promise.all(journalEntriesAlphaSort.map(async (t) =>{
            const textContent = await t.evaluate(x => x.textContent);
            return extractTextWithoutDateTime(textContent);
        }))

        testResult = isSortedReverseAlphabetically(result);
        testResult2 = isSortedReverseAlphabetically(result2);
        expect(testResult).toBe(true);
        expect(testResult2).toBe(true);

    });

    // Testing 11: Sort the journal by title alphabetically 
    it('Sort the journal by title alphabetically', async () => {
        function extractTextWithoutDateTime(text) {
            // Adjust the regex pattern to match "DD/MM/YYYY HH:MM"
            return text.replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, '').trim();
        }

        function isSortedAlphabetically(arr) {
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i].localeCompare(arr[i + 1]) > 0) {
                    return false;
                }
            }
            return true;
        }

        await page.click('#sort-name');

        // Get all journal entries on the page
        const journalEntriesAlphaSort = await page.$$('#item-list li');
        // Fetch the title of the journal entries
        let result = [];
        for(let t of journalEntriesAlphaSort){
            const textContent = await t.evaluate(x => x.textContent);
            result.push(extractTextWithoutDateTime(textContent));
        }
        let result2 = await Promise.all(journalEntriesAlphaSort.map(async (t) =>{
            const textContent = await t.evaluate(x => x.textContent);
            return extractTextWithoutDateTime(textContent);
        }))

        testResult = isSortedAlphabetically(result);
        testResult2 = isSortedAlphabetically(result2);
        expect(testResult).toBe(true);
        expect(testResult2).toBe(true);

    });

    // Testing 12: Sort the journal by date (to be implemented)
    it('Sort the journal by date', async () => {
        function extractTextWithoutDateTime(text) {
            // Adjust the regex pattern to match "DD/MM/YYYY HH:MM"
            return text.replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, '').trim();
        }
        // Click the sort by date button
        await page.click('#sort-timestamp');
    

         // Get all journal entries on the page
         const journalEntriesTimeSort = await page.$$('#item-list li');
         // Fetch the title of the journal entries
         let result = [];
         for(let t of journalEntriesTimeSort){
             const textContent = await t.evaluate(x => x.textContent);
             result.push(extractTextWithoutDateTime(textContent));
         }
         let result2 = await Promise.all(journalEntriesTimeSort.map(async (t) =>{
             const textContent = await t.evaluate(x => x.textContent);
             return extractTextWithoutDateTime(textContent);
         }))
         expect(result).toEqual([ 'This is testing', 'Test 2', 'Test Title' ]);
         expect(result2).toEqual([ 'This is testing', 'Test 2', 'Test Title' ]);

    });
    
    // Testing 13: Sort the journal by date in reverse
    it('Sort the journal by date', async () => {
        function extractTextWithoutDateTime(text) {
            // Adjust the regex pattern to match "DD/MM/YYYY HH:MM"
            return text.replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, '').trim();
        }
        // Click the sort by date button
        await page.click('#sort-timestamp');
    

         // Get all journal entries on the page
         const journalEntriesTimeSort = await page.$$('#item-list li');
         // Fetch the title of the journal entries
         let result = [];
         for(let t of journalEntriesTimeSort){
             const textContent = await t.evaluate(x => x.textContent);
             result.push(extractTextWithoutDateTime(textContent));
         }
         let result2 = await Promise.all(journalEntriesTimeSort.map(async (t) =>{
             const textContent = await t.evaluate(x => x.textContent);
             return extractTextWithoutDateTime(textContent);
         }))
         expect(result).toEqual([ 'Test Title', 'Test 2', 'This is testing' ]);
         expect(result2).toEqual([ 'Test Title', 'Test 2', 'This is testing' ]);

    });
    // Tags

    // Testing 14: Add new tags to jounal inside modal 
    it('Add new tags to journal', async() => {
        await page.reload();
        for(let i = 0; i < 3; i++){
            await page.hover('li');
            // Click the delete icon
            await page.click('.delete-button');
        }
        // Get all journal entries on the page
        const journalEntriesTagAddition = await page.$$('#item-list li');
        expect(journalEntriesTagAddition.length).toBe(0);
        await page.evaluate(() => document.querySelector('ul').replaceChildren());
        // Add new journal
        await page.click('.new-journal-button');

        // Add tag
        await page.click('#tag-plus-button');
        const testTag = "Test";
        await page.type('#tag-input-bar', testTag);

        // Save tag
        await page.click('#save-tag');

        // Add title
        const testTitle = "Dummy"
        await page.type('#journalTitle', testTitle);
        await page.click('#closeModal');


        let tag = await page.$('li span');
        let tagContent = (await tag.getProperty('innerText')).jsonValue();
        // Check that the tags in the noteObject contains testTag
        expect(await tagContent).toBe('Test');
        await page.evaluate(() => document.querySelector('ul').replaceChildren());
    });
    

    // Testing 15: Add tags when there are tags inside modal
    it('Add tags when there are tags inside modal', async() => {
        await page.reload();
        await page.waitForSelector('#item-list li');
        const journalEntryMultiTag = await page.$('#item-list li');
        await journalEntryMultiTag.click();
        await page.click('#tag-plus-button');
        const testTag2 = "Test2";
        await page.type('#tag-input-bar', testTag2);
        await page.click('#save-tag');
        await page.click('#closeModal');
        let tags = await page.$$('li span');
        let result = [];
        for(let t of tags) {
            result.push(await t.evaluate(x => x.textContent));
        }
    
        let result2 = await Promise.all(tags.map(async (t) => {
            return await t.evaluate(x => x.textContent);
        }))
        expect(result.length).toEqual(2);
        expect(result2.length).toEqual(2); 
    });


    // Testing 16: Adding duplicate tags
    it('Adding duplicate tags', async () => {
        await page.reload();

        // delete existing entries
        await page.evaluate(() => document.querySelector('ul').replaceChildren());
        
        // add new journal
        await page.click('.new-journal-button')
        
        // adding tag
        await page.click('#tag-plus-button');

        // add first tag
        await page.type('#tag-input-bar', 'test');

        // save tag
        await page.click('#save-tag');
        
        // add duplicate tag
        await page.click('#tag-plus-button');

        // add duplicate tag
        await page.type('#tag-input-bar', 'test');

        await page.click('#save-tag');

        // duplicate tag modal
       // page.on('dialog', async dialog => {
          //  await dialog.accept();
        //})

        await page.click('#closeModal');
        // check that tags are unique
        let tags = await page.$$('.tags');
        expect(tags.length).toBe(1);
    })

    // Testing 17: delete tags in modal
    it('Delete tags in modal', async() => {
        await page.reload();

        // Add new journal
        await page.click('.new-journal-button');

        // Add tag
        await page.click('#tag-plus-button');
        const testTag = "Test";
        await page.type('#tag-input-bar', testTag);

        // Save tag
        await page.click('#save-tag');


        // Add title
        const testTitle = "Dummy"
        await page.type('#journalTitle', testTitle);

        // Handle the dialog within the context of clicking the tag
        page.on('dialog', async dialog => {
            //get alert message
            console.log(dialog.message());
         })

         //make sure a tag was added
         let tags = await page.$$('.tags');
         expect(tags.length).toBe(1);

        // Delete tag by clicking on it
        await page.click('.colored-tag');

        // Save the journal entry
        await page.click('#closeModal');
       
        // Check that the tags in the noteObject contains testTag
        tags = await page.$$('.colored-tag');
        expect(tags.length).toBe(0);
    });
         //Test # ,Test traveling through the pages
    it('Go to root page', async() => {
        const response = await page.goto('http://127.0.0.1:5501/src/html/list.html');
        //refresh page
        await page.reload();
        //click "Root View"
        await page.click('.return-button');
        let result = false;
        //check url
        if(page.url() == "http://127.0.0.1:5501/src/html/home.html"){
            result = true;
        }
        expect(result).toBe(true);
    });

});
describe('Basic User Flow for Root Page', () => {
    // First, visit the website before running any tests
    beforeAll(async () => {
        await page.goto('http://127.0.0.1:5501/src/html/home.html');
    });

    // Testing 1: Expect date and weekday display to be correct
    it('Check for correct date and weekday', async () => {
    });

    // Testing 2: Pressing create opens modal
    it('Pressing create opens modal', async () => {
    });

    // Testing 3: Edit and save a journal to have title Testing 3
    it('Edit and save a journal to have title Testing 3', async () => {
    });

    // Testing 4: New root node appears after saving a journal labeled with current day
    it('New root node appears after saving a journal', async () => {
    });

    // Testing 5: Search for 'Testing 3' journal by title
    it('Search for a journal by title', async () => {
    });

    // Testing 6: Pressing entry search result opens modal
    it('Pressing entry search result opens modal', async () => {
    });

    // Testing 7: Editing title to 'Testing 3 Updated' and saving modal from entry search result updates dropdown to have new title
    it('Editing and saving modal from entry search result updates dropdown', async () => {
    });

    // Testing 8: The previous edit to an existing entry didn't add another root node
    it('The previous edit to an existing entry didn\'t add another root node', async () => {
    });

    // Testing 9: Editing and cancelling modal from entry search result doesn't update dropdown
    it('Editing and cancelling modal from entry search result doesn\'t update dropdown', async () => {
    });

    // Testing 10: Increment year button doesn't do anything (doesn't increment to a future year)
    it('Increment year button doesn\'t do anything (doesn\'t increment to a future year)', async () => {
    });

    // Testing 11: Decrement year button correctly changes year-display year and changes root to have 0 nodes
    it('Decrement year button correctly changes year-display year and changes root to have 0 nodes', async () => {
    });

    // Testing 12: Increment year button correctly changes year-display year and changes root to have previous amount of nodes
    it('Increment year button correctly changes year-display year and changes root to have previous amount of nodes', async () => {
    });

    // Testing #: Clicking List View button changes page to list.html
    it('Clicking List View button changes page to list.html', async () => {
        const response = await page.goto('http://127.0.0.1:5501/src/html/home.html');
        //refresh page
        await page.reload();
        //click "List View"
        await page.click('.list-view-button');
        let result = false;
        //check url
        if(page.url() == "http://127.0.0.1:5501/src/html/list.html"){
            result = true;
        }
        expect(result).toBe(true);
    });

});
