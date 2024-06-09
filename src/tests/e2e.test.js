describe('Basic user flow for Website', () => {
    // First, visit the website before running any tests
    beforeAll(async () => {
      await page.goto('http://127.0.0.1:5500/src/html/list.html');
    });

    // Testing 1: Initial check for 0 journals
    it('Initial Check for 0 journals', async () => {
        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
        // Check that the number of journal entries is 0
        expect(journalEntries.length).toBe(0);
    });
    
    it("Canceling creation of journal does not create journal", async() => {
        await page.click('.new-journal-button');
        page.on('dialog', async dialog => {
            await dialog.accept();
        })
        await page.click('#cancelModal');
       const journalEntries = await page.$$('#item-list li');
    expect(journalEntries.length).toBe(0);
    });
      
    // Testing 2: Add a journal to the list
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

    // Testing 3: Edit a journal
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
    

    //Testing 4: Delete a journal from the list entry
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
    

    // Testing 5: Delete a journal from the modal
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

    //Testing 6: Adding multiple journals
    it('Add multiple journals to list', async () => {
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

        // Click the new journal button to open the editor
        await page.click('.new-journal-button');
        
        // Enter the title
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

    
    // Testing 7: Search for a journal by title
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
    
  
    // Testing 8: Filter the journal by date (to be implemented)
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

   /* // Testing 9: Sort the journal by title alphabetically
    it('Sort the journal by title alphabetically', async () => {
    await page.reload();
    await page.click('#sort-name');

    // Get all journal entries on the page
    const journalEntries = await page.$$('#item-list li');

    // Fetch the title of the journal entries
    const titles = await Promise.all(journalEntries.map(async (entry) => {
        const titleHandle = await entry.$('.title'); // Adjust the selector to match the title element
        const title = await (await titleHandle.getProperty('textContent')).jsonValue();
        return title.trim(); // Trim any extra whitespace
    }));

    console.log(titles);

    // Check if the titles array is sorted in ascending order
    const isSorted = titles.every((val, i, arr) => !i || (val >= arr[i - 1]));
    expect(isSorted).toBe(true);

    // Check that the number of journal entries is correct
    // Adjust this if you expect a different number of entries
    expect(journalEntries.length).toBe(titles.length);
});*/

  /*  // Testing 10: Sort the journal by date (to be implemented)
    it('Sort the journal by date', async () => {
        // Click the sort by date button
        await page.click('#sort-timestamp');
    
        // Get all journal entries on the page
        const journalEntries = await page.$$('#item-list li');
    
        // Fetch the timestamps of the journal entries
        const timestamps = await Promise.all(journalEntries.map(async (entry) => {
            const timestamp = await (await entry.getProperty('timestamp')).jsonValue();
            return timestamp;
        }));
    
        // Check if the timestamps array is sorted in ascending order
        const isSorted = timestamps.every((val, i, arr) => !i || (val >= arr[i - 1]));
        expect(isSorted).toBe(true);
    });*/
    
    // Tags

    // Testing 11: Add new tags to jounal inside modal 
    it('Add new tags to journal', async() => {
        await page.reload();
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
    
/*
    // Testing 12: Add tags when there are tags inside modal
    it('Add tags when there are tags inside modal', async() => {
        await page.reload();

        // Wait for the search bar to be available
        await page.waitForSelector('#search-bar');

        // Enter the search term
        await page.type('#search-bar', "Dummy");

        const journalEntries = await page.$$('#item-list li');

        // FIX 
        let targetEntry = null;
        for (const entry of journalEntries) {
            const title = await entry.$eval('.title-class', el => el.innerText); // Adjust the selector to match your title element
            if (title.includes("Dummy")) {
                targetEntry = entry;
                break;
            }
        }
        
    });
*/

    // Testing 
    // Testing 13: Adding duplicate tags
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

    
    // Testing 14: delete tags in modal
    it('Delete tags in modal', async() => {
        await page.reload();
        //await page.evaluate(() => document.querySelector('ul').replaceChildren());
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

        // Delete tag
        await page.click("#tag-plus > div");

        page.on('dialog', async dialog => {
            //get alert message
            console.log(dialog.message());
            //accept alert
            await dialog.accept();
         })
        await page.click('#closeModal');

        // Check that the tags in the noteObject contains testTag
        let tags = await page.$$('.tags');
        expect(tags.length).toBe(0);
        //await page.evaluate(() => document.querySelector('ul').replaceChildren());
    });

    //Test # ,Test traveling through the pages
    it('Go to root page', async() => {
        const response = await page.goto('http://127.0.0.1:5500/src/html/list.html');
        //refresh page
        await page.reload();
        //click "Root View"
        await page.click('.return-button');
        let result = false;
        //check url
        if(page.url() == "http://127.0.0.1:5500/src/html/home.html"){
            result = true;
        }
        expect(result).toBe(true);
    });


});
