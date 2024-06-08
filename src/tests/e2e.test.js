describe('Basic user flow for Website', () => {
    // First, visit the website before running any tests
    beforeAll(async () => {
      await page.goto('http://127.0.0.1:3000/src/html/list.html');
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
        const journaltitle = await page.evaluate(() => {
        const titleElement = document.querySelector('#item-list li:first-child');
        return titleElement.textContent.split(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}Delete/)[0].trim();
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

    
    // Testing 6: Search for a journal by title
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
    

    // Testing 7: Filter the journal by date (to be implemented)
    it('Filter the journal by date', async () => {
        await page.reload();

        await page.click()
    });

    // Testing 8: Sort the journal by title alphabetically(to be implemented)
    it('Sort the journal by title alphabetically', async () => {
        await page.evaluate(() => localStorage.clear)
    });
    for
(let i = 0; i <= 3; i++)    // Testing 9: Sort the journal by date (to be implemented)
    it('Sort the journal by date', async () => {

    });
    
    // Tags

    // Testing 10: Add new tags to jounal inside modal 
    it('Add new tags to journal', async() => {
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

        // Find the noteObject
        const noteObjectTags = await page.evaluate(() => {
            const journalEntries = JSON.parse(localStorage.getItem('GarlicNotes'));
            return journalEntries.find(note => note.title === testTitle).tags;
        });

        // Check that the tags in the noteObject contains testTag
        expect(noteObjectTags.includes(testTag)).toBe(true);
    });

    // Testing 11: Add tags when there are tags inside modal
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

    // Testing 12: Adding duplicate tags
    it('Adding duplicate tags', async () => {
        await page.reload();
        
        // duplicate tag modal
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContian
        })

        await page.click('')
    })

    // Testing 13: Check if tags are stored globally

});
