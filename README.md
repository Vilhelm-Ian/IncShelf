# For Developers
- This is my first big project and I want to make the stable version myself. If you have a suggestion better tell me so I can implement it instead of you having to change the code. If you do make a pull request. I will still appreciate the work you did and merge.
- The current version is ripe for testing. That's way I won't share builds. If someone can't use the CLI to build the reader it's early for him to test it

# Getting started
- Clone the repo
- cd into the newly created folder
- run ``npm install``
- To run in development mode run ``npm run tauri dev --debug`` 
- To run in production mode run ``npm run tauri build`` cd into ``src-tauri/target/release`` there you will find the executable

# Know issues
- Heat Map is not displaying the first page (it's not a priority to fix)
  - This is also interfering with the progress bar
- If you scroll really fast the pages start glitching and. It's an issue in mupdf-viewer.js (it's not a priority to fix).
  - This also causes read pages in heat map to be displayeed wrong.
- If a file is large it will crash. If you want to test it how it will handle large files. Run the program in production but it still can crash.
  - The reason for this is tauri when it sends data from rust to javascript it converts it json. So serde takes a long time to convert every byte to a string
  - This will be resolved in tauri 2.0 . We can wait for it to be released. Or another option is to make it run a local server and have the frontend interact with the server. I am not intrested in the second approach since I want the program to be as lightweight as possible. But I am flexible
- Can't open pdf files from obsidain or any other markdown editor and anki. It's mostly because of sandbox reasons.
  - Potetial solution is to generate a relative path to the obsidian vault folder. To not make the app dependent on obisidian. We should make it so a user defines to what folder to make the path relative
  - Current solution is to copy the link file:///<path_to_file>#page=<page_number> in to browser it will open the pdf at the specified page

# Anki
- Anki-Connect setup
  - You need to have the anki-connect addon installed
  - After installing the addon you need to go to settings and whitelist the ip address you see in the terminal when you run in development mode 
  - Anki needs to be running at the same time as IncShelf(Will eventually try to move away from anki-connect)
- If you have a field titeled ``Source`` or ``Sources`` when creating an anki note it will append the page and pdf file where the anki note was created
- Currenttly there is only visual feedback when you fail to send a note to anki. You need to manually check anki if the note was created. (Sorry I wanted to get this out as fast as possible)
- To make clozes the shortcut is CTRL+SHIFT+M . Using the default anki shortcut CTRL+SHIFT+C made my dev console close


# Que
- The current way the que is sorted
  - Priority
    - When a user adds a pdf there is a list of all the pdfs. He has control where in the list to place the pdf. Higher(closer to 0) the higher the priority, lower lower the priority
  - Number of pages read
  - Number of times read(how many times the user has pressed next in que while the current pdf is shown)
  - FuzzFactor(not yet implemented) The point is to add a bit of randomness so it won't get boring
  - The above factors are normalized and multiplied by predifiened weights
    - Eventually will add the ability for the user to tweak the weights
- Currently once IncShelf is closed or you press reload the que is rebuild.
  - Reason I didn't want to implement logic if que has been created more than 24 hours. Because I wanted to get it out as fast as possible

# About
- Flow Reader is a pdf reader that allows you to iteratively read books, iteratively write notes, iteratively write anki flash cards.

# Features
- [ ] VI key-bindings
- [x] Link note(edited highlighted section) to anki notes
  - [ ] sync note and anki notes
- [x] Reading que(automatically chose which book to be read based on the priority and time passed since last read)
- [x] HeatMap
- [x] Sync Reading progress
- [ ] Note que (same as above, just for notes)
- [ ] Save notes as Markdown files so they can be edited in a Obsidian and allow easy synchronization
- [ ] Dark mode
- [ ] Local translation(argos translate)
- [ ] Local TTS(not sure which one I will use)
- [ ] Dictionary support
- [ ] Local LLM support
    - So it can create automatically tags and titles for notes   
- [ ] Custom user sytles
- [x] Rename it to IncShelf
- [ ] Add video Support
- [ ] Add ability to read web articlse(you can call getSelection from an iframe)
- [ ] Add x-ray functionality like in kindle. Amazon own the x-ray trademark
- [ ] Remove anki connect
- [ ] once tauri 2.0 releases make a mobile version
- [ ] copy all pdf documents to one folder so people can synch with something like syncthing
- [ ] Detect if the user has anki installed. if not don't render anki related UI
- [ ] Make it so if a user has an optional field in his anki card priority. To auto insert the priority of the book he is reading.And the. To write an addon that will sort new cards based on the priority
- [x] Migrate DB from local storage to SQL
- [ ] RSVP option

