import json
import re
import time
import requests
from bs4 import BeautifulSoup
import string
import time
import threading

DOMAIN_URL = 'https://www.thecocktaildb.com'
BASE_URL = f'{DOMAIN_URL}/browse/letter/'
PAGE_SEQUENCE = [i for i in string.ascii_lowercase]
headers = {"User-Agent": "Mozilla/5.0"}

def display_timer():
    # I'll display a timer while I hunt for all the delicious cocktail recipes
    start_time = time.time()
    while not scraper_done:
        time.sleep(1)
        elapsed = int(time.time() - start_time)
        print(f'\rElapsed time: {elapsed} sec', end='', flush=True)
    
# need a flag to control timer
scraper_done = False


def scrape_cocktail_urls():
    '''
    The website lists all cocktails alphabetically by page, so initially we scrape the cocktail list off each page using this function, then will scrape the cocktail recipe off each page using the scrape_cocktail_page function - yes i'm aware that this approach could probably be improved, i'll get to it at some point ;) 
    '''
    seen_cocktails = []
    url_list = []
    
    # collect urls of each cocktails page
    for page in PAGE_SEQUENCE:
        url = f'{BASE_URL}{page}'
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all div elements that contain cocktails
            cocktail_items = soup.select(".col-sm-3")

            with open('cocktail_names.txt', 'a') as file:
                for item in cocktail_items:
                    # find all title elements
                    links = item.find_all("a")

                    # Their website has invalid html with nested anchor tags. Run decompose on the empty ones before processing.
                    for link in links:
                        # If an anchor tag has no text and only contains another anchor tag, decompose it
                        if not link.text.strip() and len(link.contents) == 1 and link.contents[0].name == "a":
                            link.decompose()
                    else:
                        # Ensure the a tag contains both an image and text (valid cocktail link)
                        if link.img and link.text.strip():
                            cocktail_name = link.get_text(strip=True)
                            tag_href = link.get('href')
                        
                            # Complete cocktail url
                            cocktail_url = f'{DOMAIN_URL}{tag_href}'
                            
                            if cocktail_name and cocktail_name not in seen_cocktails:
                                file.write(f'{cocktail_name}: {cocktail_url}\n')
                                seen_cocktails.append(cocktail_name)
                                url_list.append(cocktail_url)
        else:
            print(f"Failed to retrieve data. Status code: {response.status_code}")
        
        time.sleep(2)
            
    
    print(f'Collected {len(url_list)} urls.')
    with open('urls.txt', 'w') as file:
        file.write('\n'.join(url_list))
    
    # extract data from each cocktails page
    # for url in url_list:
    #     pass


def scrape_cocktail_page():
    # scrapes each cocktail page in the urls.txt for cocktail info
    urls = []
    recipes = []
    
    # get urls from urls.txt
    with open('urls.txt', 'r') as file:
        for line in file:
            if line:
                urls.append(line.strip())
    print(f'Scraping {len(urls)} urls\n')
    
    for url in urls:
        # load page
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            # extract title, image, ingredients, instructions, glassware, garnishes
            # scrape cocktail title
            h1_titles = soup.select('h1')[0]
            title = h1_titles.get_text(strip=True)
            # print(title)
            
            # scrape cocktail image
            image_url = ''
            image_tags = soup.select('img')
            for item in image_tags:
                if item.get('alt').lower().find(title.lower()) != -1:
                    image_url = item.get('src')
            
            # scrape cocktail ingredients
            ingredients = []
            figure_caption_tags = soup.select('figure figcaption')

            for caption in figure_caption_tags:
                ingredients.append(caption.get_text(strip=True).lower())

            # print(ingredients)

            # TODO: extract base liquor

            # scrape cocktail instructions

            # instructions aren't wrapped in tags, but plain text after an h2 tag containing the word "Instructions". let's find this tag and scrape the adjacent text - which should correspond to the instructions. I can then split the string by <br> which as it appears, the instructions are separated by and load each into the instructions list. 
            instructions = []
            h2_tags = soup.select('h2')
            for tag in h2_tags:
                if tag.get_text(strip=True) == 'Instructions':
                    next_element = tag.next_sibling
                    while next_element and next_element.name != 'h2':
                        if next_element.name != 'br':
                            instructions.append(next_element.strip() if isinstance(next_element, str) else next_element.get_text(strip=True))
                        next_element = next_element.next_sibling

            # print(f'Instructions:', instructions)
            
            # scrape cocktail glassware
            glassware = []
            for tag in h2_tags:
                if tag.get_text(strip=True) == "Glass":
                    glass_inner_text = tag.next_sibling.replace('Serve:', '').strip().lower()
                    glassware = glass_inner_text.split(',')
            # print(f'Glassware: {glassware}')

            # scrape cocktail garnishes

            # garnishes appear to be stated in the last line of the instructions. use regex to extract items
            garnishes = []
            last_line = instructions[-1].lower()
            match = re.search(r'garnish with (.+)', last_line)
            if match:
                # I would like the individual garnishes so i will further split by terms being used "and". Furthermore some will still have a "the" or "a" prefix so I'll go ahead and strip those also
                garnish_str = match.group(1).strip(',.-')
                garnishes = [garnish.strip(',.-').lower().removeprefix('the').strip() for garnish in garnish_str.split('and')]
                
            # print('Garnishes: ', garnishes)

            # create json entry and add to recipes list
            new_recipe = {
                "title": title,
                "image": image_url,
                "ingredients": ingredients,
                "base": [],
                "garnishes": garnishes,
                "glassware": glassware,
                "instructions": instructions
            }
            # print('new recipe:', new_recipe)
            recipes.append(new_recipe)

            # write recipes collection to cocktail_recipes.json
            if recipes:
                with open('cocktail_recipes.json', 'w') as file:
                    json.dump(recipes, file, indent=4)
        pass
    pass

# start timer in a separate thread - duhh
timer_thread = threading.Thread(target=display_timer, daemon=True)
timer_thread.start()

try:
    scrape_cocktail_page()
finally:
    scraper_done = True
    print('\nScraping complete!')