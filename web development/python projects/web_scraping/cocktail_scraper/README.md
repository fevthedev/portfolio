# Cocktail Web Scraper
As a part time bartender during my early career, I always envisioned creating an app that a bartender could easily and quickly reference should they need a specific drink recipe on the fly. So here's step one - getting the recipes. I decided to just make it fun and set up a web scraper.
Next steps include:
- Adding scraped data from about two or three more websites to make the recipe list as complete as can be
- Using ChatGPT to polish things a bit more - not all sites are made equal
- feeding these recipes into a lightweight mobile app. Maybe someone else will find use with this also - go for it.

## Setup Instructions
1. Install dependencies
```sh
pip install -r requirements.txt
```
2. Run the script
```sh
python main.py
```
### EASY!!!
## My Approach
1. The website divides every cocktail alphabetically, assigning a page to each letter. So I iterate over each page collecting every cocktail url from a-z. The urls are saved in urls.txt for later reference.
2. I then iterate through each cocktail page url from urls.txt, using *beautiful soup* to properly extract the components that we need to make this recipe app complete. Each cocktail recipe is then saved as a json object into an array.
3. The complete list of json recipes is writted to cocktail_recipes.json for future reference.
4. To add a bit of flair I used threading to display the elapsed time so that you don't feel lost in limbo while we scrape 600+ pages.

*De rien mon ami! - FevTheDev*

